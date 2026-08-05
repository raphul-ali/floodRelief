with open('src/components/VictimRequestForm.jsx', 'r') as f:
    content = f.read()
# Remove parseNeedsTags definition from VictimRequestForm
import re
content = re.sub(r'const parseNeedsTags = \(needs\) => \{.*?\n\};\n', '', content, flags=re.DOTALL)
content = content.replace("import RippleButton from './ui/RippleButton';", "import RippleButton from './ui/RippleButton';\nimport { parseNeedsTags } from '../utils/helpers';")
with open('src/components/VictimRequestForm.jsx', 'w') as f:
    f.write(content)

with open('src/components/PublicRequestsList.jsx', 'r') as f:
    content = f.read()
content = content.replace("import { parseNeedsTags } from './VictimRequestForm';", "import { parseNeedsTags } from '../utils/helpers';")
with open('src/components/PublicRequestsList.jsx', 'w') as f:
    f.write(content)

with open('src/components/NGODashboard.jsx', 'r') as f:
    content = f.read()
content = content.replace("import { parseNeedsTags } from './VictimRequestForm';", "import { parseNeedsTags } from '../utils/helpers';")
with open('src/components/NGODashboard.jsx', 'w') as f:
    f.write(content)
