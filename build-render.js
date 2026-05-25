// build-render.js
// Polyfill de globals do browser para o Leaflet rodar no Node.js
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
    documentElement: { style: {} }
  };
  try {
    Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', platform: 'node' }, configurable: true, writable: true });
  } catch (_) {}
  globalThis.location = { href: '/', protocol: 'https:', host: 'localhost' };
  globalThis.screen = { deviceXDPI: 96, logicalXDPI: 96 };
}

import fs from 'fs';
import app from './dist/server/server.js';

(async () => {
  try {
    const req = new Request('http://localhost/');
    const res = await app.fetch(req, process.env, {});
    const html = await res.text();
    fs.writeFileSync('dist/client/index.html', html);
    console.log('✅ index.html gerado com sucesso (' + html.length + ' bytes) para deploy estático no Render.');
  } catch (err) {
    console.error('❌ Erro ao gerar index.html', err);
    process.exit(1);
  }
})();
