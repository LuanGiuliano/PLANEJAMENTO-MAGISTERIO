/**
 * build-vercel.js
 * Gera a estrutura Vercel Build Output API v3:
 *   .vercel/output/static/   → assets estáticos (CSS, JS)
 *   .vercel/output/functions/index.func/ → função serverless Node.js
 *   .vercel/output/config.json → roteamento
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const clientDir  = path.join(ROOT, 'dist/client');
const serverDir  = path.join(ROOT, 'dist/server');
const outputDir  = path.join(ROOT, '.vercel/output');
const staticDir  = path.join(outputDir, 'static');
const funcDir    = path.join(outputDir, 'functions/index.func');

// ── 1. Limpa e cria estrutura ────────────────────────────────────────────────
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(staticDir, { recursive: true });
fs.mkdirSync(funcDir,   { recursive: true });

// ── 2. Copia assets do cliente para /static ──────────────────────────────────
fs.cpSync(clientDir, staticDir, { recursive: true });
console.log('✅ Assets copiados para .vercel/output/static/');

// ── 3. Copia o servidor para dentro da função ────────────────────────────────
fs.cpSync(serverDir, path.join(funcDir, 'server'), { recursive: true });
console.log('✅ Bundle do servidor copiado');

// ── 4. Cria o adaptador Node.js → Fetch API ──────────────────────────────────
//    O TanStack Start gera um handler com interface Fetch API (como Cloudflare
//    Workers). O Vercel usa Node.js. Este adaptador faz a ponte.
const handlerCode = `import app from './server/server.js';

export default async function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host     = req.headers['x-forwarded-host'] || req.headers.host;
  const url      = protocol + '://' + host + req.url;

  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await new Promise((resolve) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : v;
  }

  const request = new Request(url, { method: req.method, headers, body });

  const response = await app.fetch(request, process.env, {});

  res.statusCode = response.status;
  for (const [k, v] of response.headers.entries()) {
    res.setHeader(k, v);
  }

  const buf = await response.arrayBuffer();
  res.end(Buffer.from(buf));
}
`;

fs.writeFileSync(path.join(funcDir, 'index.mjs'), handlerCode);

// ── 5. package.json da função (ESM) ─────────────────────────────────────────
fs.writeFileSync(
  path.join(funcDir, 'package.json'),
  JSON.stringify({ type: 'module' }, null, 2)
);

// ── 6. Configuração da função serverless (.vc-config.json) ───────────────────
fs.writeFileSync(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify({
    runtime: 'nodejs20.x',
    handler: 'index.mjs',
    launcherType: 'Nodejs',
    shouldAddHelpers: true,
  }, null, 2)
);

// ── 7. Configuração de roteamento do Vercel ──────────────────────────────────
//    Assets estáticos servidos diretamente; tudo mais vai pro servidor Node.js
const config = {
  version: 3,
  routes: [
    {
      src: '/assets/(.*)',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index' },
  ],
};

fs.writeFileSync(path.join(outputDir, 'config.json'), JSON.stringify(config, null, 2));

console.log('✅ Vercel Build Output v3 gerado com sucesso!');
console.log('   Static  →', staticDir);
console.log('   Func    →', funcDir);
console.log('   Config  →', path.join(outputDir, 'config.json'));