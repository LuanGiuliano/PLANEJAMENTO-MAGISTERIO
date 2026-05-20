// server.js - Servidor Node.js para Render Web Service
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Polyfill de globals do browser para o Leaflet rodar no Node.js ──────────
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
  globalThis.self = globalThis;
  globalThis.document = {
    createElement: () => ({ style: {}, setAttribute: () => {}, addEventListener: () => {} }),
    createElementNS: () => ({ style: {}, setAttribute: () => {}, addEventListener: () => {} }),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { appendChild: () => {}, removeChild: () => {}, style: {} },
    head: { appendChild: () => {} },
  };
  try {
    Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', platform: 'node' }, configurable: true, writable: true });
  } catch (_) {}
  globalThis.location = { href: '/', protocol: 'https:', host: 'localhost' };
}

// Importa o app gerado pelo TanStack Start (que usa a Fetch API padrão)
import app from './dist/server/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

// 1. Serve arquivos estáticos do cliente primeiro (JS, CSS, imagens)
server.use(express.static(path.join(__dirname, 'dist', 'client'), {
  maxAge: '1y',
  index: false // Não serve index.html estaticamente, deixa o TanStack gerenciar
}));

// 2. Ponte Express -> Fetch API (TanStack Start)
server.use(async (req, res, next) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = `${protocol}://${host}${req.originalUrl}`;

    const fetchReq = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body
    });

    const fetchRes = await app.fetch(fetchReq, process.env, {});
    
    res.status(fetchRes.status);
    for (const [key, value] of fetchRes.headers.entries()) {
      res.setHeader(key, value);
    }
    
    const arrayBuffer = await fetchRes.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Erro no servidor SSR:', error);
    res.status(500).send('Erro Interno do Servidor');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
