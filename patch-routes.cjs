const fs = require('fs');
let c = fs.readFileSync('src/routes/index.tsx', 'utf8');

// Step 1: remove the loader + pendingComponent block
const idx1 = c.indexOf('loader: async () =>');
const idx1end = c.indexOf('component: Dashboard,\r\n});', idx1);
if (idx1 >= 0 && idx1end >= 0) {
  c = c.substring(0, idx1) + c.substring(idx1end);
  console.log('Step 1 OK - removed loader block');
} else {
  console.log('Step 1 NOT FOUND idx1=' + idx1 + ' idx1end=' + idx1end);
}

// Step 2: replace useLoaderData with useState + useEffect
const old2 = 'const rawData = Route.useLoaderData() as any[];';
const new2 = 'const [rawData, setRawData] = (require(\'react\').useState)(null);\r\n  const [loading, setLoading] = (require(\'react\').useState)(true);\r\n  (require(\'react\').useEffect)(() => {\r\n    fetchRawData().then(data => { setRawData(data); setLoading(false); }).catch(() => setLoading(false));\r\n  }, []);';

// Actually use string manipulation to avoid double-require
const new2clean = 'const [rawData, setRawData] = useState(null);\r\n  const [loading, setLoading] = useState(true);\r\n  useEffect(() => {\r\n    fetchRawData().then(data => { setRawData(data); setLoading(false); }).catch(() => setLoading(false));\r\n  }, []);';

if (c.includes(old2)) { c = c.replace(old2, new2clean); console.log('Step 2 OK'); }
else console.log('Step 2 NOT FOUND');

// Step 3: replace dashboardData useMemo with direct call + loading guard
const old3 = 'const dashboardData = useMemo(() => processDashboardData(rawData, filtrosAtivos), [rawData, filtrosAtivos]);';
const new3 = 'if (loading) return (<div className="flex min-h-screen items-center justify-center bg-[#081C2E]"><Loader2 className="h-10 w-10 animate-spin text-[#F4A300]" /></div>);\r\n  const dashboardData = processDashboardData(rawData ?? [], filtrosAtivos);';

if (c.includes(old3)) { c = c.replace(old3, new3); console.log('Step 3 OK'); }
else console.log('Step 3 NOT FOUND');

fs.writeFileSync('src/routes/index.tsx', c, 'utf8');
console.log('Done writing file');
