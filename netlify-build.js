// netlify-build.js
// Script de build para Netlify - gera o index.html estático sem servidor

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
    
    // Escreve index.html limpo sem erros de SSR
    const cleanHtml = html
      .replace(/<template[^>]*data-dgst[^>]*>[\s\S]*?<\/template>/g, '')
      .replace(/<template[^>]*id="\$[^"]*"[^>]*>[\s\S]*?<\/template>/g, '');
    
    fs.writeFileSync('dist/client/index.html', cleanHtml);
    console.log('✅ index.html gerado com sucesso (' + cleanHtml.length + ' bytes)');
    process.exit(0);
  } catch (err) {
    // Se o SSR falhar, usa um index.html puro sem pré-renderização
    console.warn('⚠️  SSR falhou, usando HTML shell puro:', err.message);
    
    const shellHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Planejamento Magistério</title>
  <link rel="stylesheet" href="/assets/styles-B_ktHpkP.css" />
  <link rel="stylesheet" href="/assets/index-CIGW-MKW.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index-CJtl4H8Q.js"></script>
</body>
</html>`;
    
    fs.writeFileSync('dist/client/index.html', shellHtml);
    console.log('✅ HTML shell gerado com sucesso');
    process.exit(0);
  }
})();
