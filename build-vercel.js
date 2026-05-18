/**
 * build-vercel.js
 * Gera a estrutura Vercel Build Output API v3:
 *   .vercel/output/static/   → assets estáticos (CSS, JS)
 *   .vercel/output/functions/index.func/ → função serverless Node.js (CJS)
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

// ── 4. Cria o adaptador Node.js → Fetch API (CommonJS + dynamic ESM import) ──
//    O Vercel usa Node.js com loader CommonJS por padrão.
//    Usamos import() dinâmico para carregar o bundle ESM do TanStack Start.
const handlerCode = `'use strict';

let _appPromise;

function getApp() {
  if (!_appPromise) {
    _appPromise = import('./server/server.js').then(m => m.default);
  }
  return _appPromise;
}

module.exports = async function handler(req, res) {
  try {
    const app = await getApp();

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host     = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url      = protocol + '://' + host + req.url;

    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
      });
    }

    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (v !== undefined) headers[k] = Array.isArray(v) ? v.join(', ') : String(v);
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const response = await app.fetch(request, process.env, {});

    res.statusCode = response.status;
    for (const [k, v] of response.headers.entries()) {
      res.setHeader(k, v);
    }

    const buf = await response.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error('[SIAE Server Error]', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h1>Erro interno do servidor</h1><pre>' + String(err) + '</pre>');
  }
};
`;

fs.writeFileSync(path.join(funcDir, 'index.js'), handlerCode);

// ── 5. package.json da função (CJS — sem "type":"module") ────────────────────
fs.writeFileSync(
  path.join(funcDir, 'package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2)
);

// ── 6. Configuração da função serverless (.vc-config.json) ───────────────────
fs.writeFileSync(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify({
    runtime: 'nodejs20.x',
    handler: 'index.js',
    launcherType: 'Nodejs',
    shouldAddHelpers: true,
  }, null, 2)
);

// ── 7. Configuração de roteamento do Vercel ──────────────────────────────────
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