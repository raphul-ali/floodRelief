from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
import jwt
import bcrypt
import resend
import random
from datetime import datetime, timedelta

import time
try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
    load_dotenv(".env")
except Exception:
    pass

app = FastAPI()

# Enable CORS for local development (Vercel handles this in prod usually, but good practice)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_ratelimit():
    try:
        from upstash_ratelimit.asyncio import AsyncRatelimit, SlidingWindow
        from upstash_redis.asyncio import Redis
        import os
        UPSTASH_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
        UPSTASH_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
        if UPSTASH_URL and UPSTASH_TOKEN:
            upstash_redis = Redis(url=UPSTASH_URL, token=UPSTASH_TOKEN)
            return AsyncRatelimit(redis=upstash_redis, limiter=SlidingWindow(max_requests=30, window=10))
    except ImportError:
        pass
    return None


async def check_rate_limit(request: Request):
    
    ratelimit = get_ratelimit()
    if not ratelimit:

        return # Rate limiting disabled if env vars or package missing
        
    ip = (
        request.headers.get("cf-connecting-ip")
        or request.headers.get("x-forwarded-for")
        or (request.client.host if request.client else "unknown")
    )
    
    # x-forwarded-for can be a comma-separated list, take the first
    if ip and "," in ip:
        ip = ip.split(",")[0].strip()

    response = await ratelimit.limit(ip)

    if not response.allowed:
        raise HTTPException(status_code=429, detail="Too many requests")

@app.middleware("http")
async def security_audit_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        
        # Rate Limiting
        
        ratelimit = get_ratelimit()
        if ratelimit:

            try:
                await check_rate_limit(request)
            except HTTPException as e:
                return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
        
        # RBAC is now handled by FastAPI dependencies (Depends(get_current_user))
        # Rate Limiting is now handled by per-route dependencies (Depends(check_rate_limit))

        # Logging logic
        if request.method in ["POST", "PUT", "DELETE"]:
            ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
            if not ip and request.client:
                ip = request.client.host
            
            path_parts = request.url.path.strip("/").split("/")
            target_table = path_parts[2] if len(path_parts) > 2 and path_parts[1] == "db" else path_parts[-1]
            
            
            supabase = get_supabase_client()
            if supabase:

                try:
                    get_supabase_client().table('security_logs').insert({
                        "ip_address": ip or "unknown",
                        "action": request.method,
                        "target_table": target_table,
                        "details": {"path": request.url.path, "query": str(request.query_params)}
                    }).execute()
                except Exception as e:
                    print(f"Security logging failed: {e}")
                    
    return await call_next(request)


def get_supabase_client():
    import os
    from supabase import create_client
    url = os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        key = os.environ.get("VITE_SUPABASE_ANON_KEY", "")
    if url:
        return create_client(url, key)
    return None

def get_jwt_secret():
    import os
    return os.environ.get("JWT_SECRET") or os.environ.get("get_jwt_secret()") or "super-secret-fallback-key"


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

def require_auth(user: dict = Depends(get_current_user)):
    if not user.get("role"):
        raise HTTPException(status_code=403, detail="Authentication required")
    return user

# Pydantic Models for our incoming data
class CampaignCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    status: Optional[str] = "Active"
    campaign_type: Optional[str] = None
    target_count: Optional[str] = None
    contact_person: Optional[str] = None
    whatsapp_number: Optional[str] = None
    map_link: Optional[str] = None

class VictimRequestCreate(BaseModel):
    name: str
    phone: str
    alt_phone: Optional[str] = None
    people_count: int
    males_count: int
    females_count: int
    children_count: int
    district: str
    village_name: str
    pin_code: str
    landmark: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_urgent_rescue: bool
    needs: List[str]
    details: str

class DeliveryLogCreate(BaseModel):
    requestId: str
    recipientName: str
    district: str
    deliveredBy: str
    volunteerPhone: str
    itemsDelivered: Optional[str] = None
    deliveryNotes: Optional[str] = None
    statusUpdate: str
    rescuedCount: Optional[int] = None
    remainingCount: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/login")
def login(creds: LoginRequest):
    
    supabase = get_supabase_client()
    if not supabase:

        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        # Fetch the admin user
        res = get_supabase_client().table('platform_admins').select('*').eq('email', creds.email).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        admin_user = res.data[0]
        
        # Verify the password using bcrypt
        if not bcrypt.checkpw(creds.password.encode('utf-8'), admin_user['password_hash'].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        # Generate JWT Token
        import time
        payload = {
            "sub": admin_user['id'],
            "email": admin_user['email'],
            "role": "ADMIN",
            "name": admin_user.get("name", "Super Admin"),
            "exp": int(time.time()) + (24 * 60 * 60) # 24 hours expiry
        }
        
        token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")
        
        return {
            "token": token,
            "user": {
                "id": admin_user['id'],
                "email": admin_user['email'],
                "role": "ADMIN",
                "name": admin_user.get("name", "Super Admin")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SendOtpRequest(BaseModel):
    email: str

@app.post("/api/auth/send-otp")
def send_otp(req: SendOtpRequest):
    # Fetch Resend API Key dynamically inside the request context
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Resend API Key is missing")
    resend.api_key = api_key

    
    supabase = get_supabase_client()
    if not supabase:

        raise HTTPException(status_code=500, detail="Database not configured")
        
    code = f"{random.randint(100000, 999999)}"
    expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()
    
    try:
        # Save to Supabase
        get_supabase_client().table('otps').insert({
            "email": req.email.lower(),
            "otp_code": code,
            "expires_at": expires_at
        }).execute()
        
        # Send Email via Resend
        resend.Emails.send({
            "from": "noreply@helpaxom.in",
            "to": [req.email],
            "subject": "Your Assam Flood Relief Verification Code",
            "html": f"<p>Hello,</p><p>Your verification code is: <strong>{code}</strong></p><p>This code will expire in 10 minutes.</p>"
        })
        return {"success": True, "message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class VerifyOtpRequest(BaseModel):
    email: str
    code: str

@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    
    supabase = get_supabase_client()
    if not supabase:

        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        email = req.email.lower()
        res = get_supabase_client().table('otps').select('*').eq('email', email).execute()
        
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=400, detail="No OTP request found for this email")
            
        # Check all OTPs for this email (just in case they requested multiple times)
        valid_record = None
        for record in res.data:
            if str(record.get('otp_code', '')).strip() == str(req.code).strip():
                expires_raw = record.get('expires_at')
                if not expires_raw:
                    valid_record = record
                    break
                try:
                    if isinstance(expires_raw, str):
                        expires_dt = datetime.fromisoformat(expires_raw.replace('Z', '+00:00'))
                        now_dt = datetime.now(expires_dt.tzinfo)
                        if expires_dt > now_dt:
                            valid_record = record
                            break
                    else:
                        valid_record = record
                        break
                except Exception:
                    valid_record = record
                    break
                    
        if not valid_record:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code")
            
        # Clean up used OTP
        get_supabase_client().table('otps').delete().eq('id', valid_record['id']).execute()
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RegisterNgoRequest(BaseModel):
    name: str
    contactPerson: str
    phone: str
    email: str
    logoUrl: Optional[str] = None
    address: str
    operatingZones: List[str]
    services: Union[List[str], str]
    showPhone: bool
    password: str

@app.post("/api/auth/register-ngo")
def register_ngo(req: RegisterNgoRequest):
    
    supabase = get_supabase_client()
    if not supabase:

        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        # Check if email exists
        res = get_supabase_client().table('ngos').select('id').eq('email', req.email.lower()).execute()
        if res.data and len(res.data) > 0:
            raise HTTPException(status_code=400, detail="An NGO with this email is already registered")

        import uuid
        ngo_id = f"ngo-assam-{uuid.uuid4()}"
        hashed_pw = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        insert_data = {
            "id": ngo_id,
            "name": req.name,
            "contact_person": req.contactPerson,
            "phone": req.phone,
            "email": req.email.lower(),
            "password": hashed_pw,
            "logo_url": req.logoUrl,
            "operating_zones": req.operatingZones,
            "services": req.services,
            "address": req.address,
            "verified": False,
            "active_teams": 1,
            "show_phone": req.showPhone,
        }
        get_supabase_client().table('ngos').insert(insert_data).execute()
        return {"success": True, "ngo_id": ngo_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RegisterVolunteerRequest(BaseModel):
    name: str
    roleType: str
    phone: str
    email: str
    district: str
    offerings: str
    showPhone: bool
    password: str

@app.post("/api/auth/register-volunteer")
def register_volunteer(req: RegisterVolunteerRequest):
    
    supabase = get_supabase_client()
    if not supabase:

        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        res = get_supabase_client().table('volunteers').select('id').eq('email', req.email.lower()).execute()
        if res.data and len(res.data) > 0:
            raise HTTPException(status_code=400, detail="A volunteer with this email is already registered")

        import uuid
        vol_id = f"vol-{uuid.uuid4()}"
        hashed_pw = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        insert_data = {
            "id": vol_id,
            "name": req.name,
            "role_type": req.roleType,
            "phone": req.phone,
            "email": req.email.lower(),
            "password": hashed_pw,
            "district": req.district,
            "offerings": req.offerings,
            "available_status": "Active Now",
            "verified": False,
            "show_phone": req.showPhone,
        }
        get_supabase_client().table('volunteers').insert(insert_data).execute()
        return {"success": True, "vol_id": vol_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login-ngo")
def login_ngo(creds: LoginRequest):
    
    supabase = get_supabase_client()
    if not supabase:

        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        res = get_supabase_client().table('ngos').select('*').eq('email', creds.email.lower()).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        user_record = res.data[0]
        
        # Backward compatibility for plain text passwords (if any exist) or bcrypt
        if user_record['password'].startswith('$2b$') or user_record['password'].startswith('$2a$'):
            if not bcrypt.checkpw(creds.password.encode('utf-8'), user_record['password'].encode('utf-8')):
                raise HTTPException(status_code=401, detail="Invalid email or password")
        else:
            if creds.password != user_record['password']:
                raise HTTPException(status_code=401, detail="Invalid email or password")
                
        if not user_record.get('verified', False):
            raise HTTPException(status_code=403, detail="Your NGO account is pending Admin Verification.")
            
        import time
        payload = {
            "sub": user_record['id'],
            "email": user_record['email'],
            "role": "NGO",
            "name": user_record['name'],
            "exp": int(time.time()) + (24 * 60 * 60)
        }
        token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")
        
        return {
            "token": token,
            "user": {
                "id": user_record['id'],
                "email": user_record['email'],
                "role": "NGO",
                "name": user_record['name'],
                "contactPerson": user_record.get('contact_person'),
                "phone": user_record.get('phone'),
                "operatingZones": user_record.get('operating_zones'),
                "verified": True
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login-volunteer")
def login_volunteer(creds: LoginRequest):
    
    supabase = get_supabase_client()
    if not supabase:

        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        res = get_supabase_client().table('volunteers').select('*').eq('email', creds.email.lower()).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        user_record = res.data[0]
        
        if user_record['password'].startswith('$2b$') or user_record['password'].startswith('$2a$'):
            if not bcrypt.checkpw(creds.password.encode('utf-8'), user_record['password'].encode('utf-8')):
                raise HTTPException(status_code=401, detail="Invalid email or password")
        else:
            if creds.password != user_record['password']:
                raise HTTPException(status_code=401, detail="Invalid email or password")
                
        if not user_record.get('verified', False):
            raise HTTPException(status_code=403, detail="Your Volunteer account is pending Admin Verification.")
            
        import time
        payload = {
            "sub": user_record['id'],
            "email": user_record['email'],
            "role": "VOLUNTEER",
            "name": user_record['name'],
            "exp": int(time.time()) + (24 * 60 * 60)
        }
        token = jwt.encode(payload, get_jwt_secret(), algorithm="HS256")
        
        return {
            "token": token,
            "user": {
                "id": user_record['id'],
                "email": user_record['email'],
                "role": "VOLUNTEER",
                "name": user_record['name'],
                "roleType": user_record.get('role_type'),
                "district": user_record.get('district'),
                "phone": user_record.get('phone'),
                "verified": True
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "supabase_configured": bool(supabase)}

# --- Campaigns Endpoints ---
@app.get("/api/campaigns")
def get_campaigns(status: Optional[str] = None):
    try:
        query = get_supabase_client().table('campaigns').select('*')
        if status:
            query = query.eq('status', status)
        res = query.order('created_at', desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/campaigns")
def create_campaign(campaign: CampaignCreate, user: dict = Depends(require_admin)):
    try:
        import uuid
        import time
        new_id = f"camp-{int(time.time()*1000)}-{uuid.uuid4().hex[:6]}"
        data = campaign.dict(exclude_unset=True)
        data['id'] = new_id
        res = get_supabase_client().table('campaigns').insert(data).execute()
        return res.data[0] if res.data else {"id": new_id, **data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/campaigns/{campaign_id}")
def delete_campaign(campaign_id: str, user: dict = Depends(require_admin)):
    try:
        res = get_supabase_client().table('campaigns').delete().eq('id', campaign_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/campaigns/{campaign_id}")
def update_campaign(campaign_id: str, updates: Dict[str, Any], user: dict = Depends(require_admin)):
    try:
        res = get_supabase_client().table('campaigns').update(updates).eq('id', campaign_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Victim Requests Endpoints ---
@app.get("/api/victim_requests")
def get_victim_requests():
    try:
        res = get_supabase_client().table('victim_requests').select('*').order('created_at', desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/victim_requests")
def create_victim_request(req: VictimRequestCreate):
    try:
        import uuid
        import time
        new_id = f"VREQ-{int(time.time()*1000)}-{uuid.uuid4().hex[:6]}"
        data = req.dict()
        data['id'] = new_id
        res = get_supabase_client().table('victim_requests').insert(data).execute()
        return res.data[0] if res.data else {"id": new_id, **data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/victim_requests/{req_id}")
def delete_victim_request(req_id: str, user: dict = Depends(require_admin)):
    try:
        res = get_supabase_client().table('victim_requests').delete().eq('id', req_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/victim_requests/{req_id}")
def update_victim_request(req_id: str, updates: Dict[str, Any], user: dict = Depends(require_auth)):
    try:
        res = get_supabase_client().table('victim_requests').update(updates).eq('id', req_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NGOs Endpoints ---
@app.get("/api/ngos")
def get_ngos():
    try:
        res = get_supabase_client().table('ngos').select('*').order('created_at', desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ngos")
def create_ngo(req: Request):
    # Since NGOs structure might vary slightly, we'll just parse the JSON directly for this MVP
    pass # to be implemented if needed. We can just use Dict[str, Any]
    
# --- Generic Catch-all POST for simple migration ---
# To make the migration easy, we can create generic endpoints for tables
@app.post("/api/db/{table_name}")
async def create_record(table_name: str, req: Request, user: dict = Depends(require_auth)):
    try:
        data = await req.json()
        res = get_supabase_client().table(table_name).insert(data).execute()
        return res.data[0] if res.data else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/db/{table_name}/{record_id}")
async def update_record(table_name: str, record_id: str, req: Request, user: dict = Depends(require_auth)):
    try:
        data = await req.json()
        res = get_supabase_client().table(table_name).update(data).eq('id', record_id).execute()
        return res.data[0] if res.data else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/db/{table_name}/{record_id}")
def delete_record(table_name: str, record_id: str, user: dict = Depends(require_auth)):
    try:
        get_supabase_client().table(table_name).delete().eq('id', record_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/db/{table_name}")
def get_records(table_name: str, order_by: str = 'created_at'):
    try:
        # Ascending for helpline_numbers, desc for everything else
        asc = True if table_name == 'helpline_numbers' else False
        order_col = 'sort_order' if table_name == 'helpline_numbers' else order_by
        res = get_supabase_client().table(table_name).select('*').order(order_col, desc=not asc).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
