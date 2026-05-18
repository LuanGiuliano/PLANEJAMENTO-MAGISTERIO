import fs from 'fs';
import path from 'path';

const clientDir = path.resolve('dist/client');
const assetsDir = path.join(clientDir, 'assets');

// Descobre dinamicamente os arquivos gerados pelo Vite
const allAssets = fs.readdirSync(assetsDir);

const cssFiles = allAssets.filter(f => f.endsWith('.css'));
const jsFiles  = allAssets.filter(f => f.endsWith('.js'));

// Ordena para garantir: vendor* primeiro, depois index*
const vendorJs  = jsFiles.filter(f => f.startsWith('vendor'));
const mainJs    = jsFiles.filter(f => !f.startsWith('vendor'));

const cssLinks  = cssFiles.map(f => `  <link rel="stylesheet" crossorigin href="/assets/${f}">`).join('\n');
const vendorTags = vendorJs.map(f => `  <script type="module" crossorigin src="/assets/${f}"></script>`).join('\n');
const mainTags  = mainJs.map(f => `  <script type="module" crossorigin src="/assets/${f}"></script>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SIAE · SEDUC-PA — Planejamento do Magistério</title>
    <meta name="description" content="Dashboard estratégico do Planejamento do Magistério da Secretaria de Educação do Pará." />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
${cssLinks}
  </head>
  <body>
    <div id="root"></div>
${vendorTags}
${mainTags}
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, 'index.html'), html, 'utf-8');
console.log('✅ index.html gerado em dist/client com', cssFiles.length, 'CSS e', jsFiles.length, 'JS');