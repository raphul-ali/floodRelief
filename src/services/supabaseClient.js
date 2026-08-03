export const isSupabaseConfigured = true;

const executeRequest = async (method, table, data = null, urlParams = '') => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  // Attach JWT if available
  try {
    const sessionData = localStorage.getItem('flood_portal_auth_session_v1');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      if (parsed.accessToken) {
        options.headers['Authorization'] = `Bearer ${parsed.accessToken}`;
      }
    }
  } catch(e) {}

  if (data) options.body = JSON.stringify(data);
  const res = await fetch(`/api/db/${table}${urlParams}`, options);
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return { data: json, error: null };
};

class SupabaseQueryBuilder {
  constructor(table) {
    this.table = table;
  }
  select() { return this; }
  order() { return this; }
  
  then(resolve, reject) {
    executeRequest('GET', this.table)
      .then(resolve)
      .catch(e => resolve({ data: null, error: e }));
  }

  insert(data) {
    const d = Array.isArray(data) ? data[0] : data;
    return executeRequest('POST', this.table, d).catch(e => ({ data: null, error: e }));
  }

  update(data) {
    return {
      eq: (col, val) => {
        return executeRequest('PUT', this.table, data, `/${val}`).catch(e => ({ data: null, error: e }));
      }
    };
  }

  delete() {
    return {
      eq: (col, val) => {
        return executeRequest('DELETE', this.table, null, `/${val}`).catch(e => ({ data: null, error: e }));
      }
    };
  }
}

export const supabase = {
  from: (table) => new SupabaseQueryBuilder(table)
};
