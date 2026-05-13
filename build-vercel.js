import fs from 'fs';
import path from 'path';

const clientDir = path.resolve('dist/client');
const vercelStaticDir = path.resolve('.vercel/output/static');
const vercelConfigDir = path.resolve('.vercel/output');

// 1. Cria as pastas ocultas que o Vercel exige
fs.mkdirSync(vercelStaticDir, { recursive: true });

// 2. Copia todo o visual estático para dentro do Vercel
fs.cpSync(clientDir, vercelStaticDir, { recursive: true });

// 3. Injeta a regra de roteamento (Fim do Erro 404)
const config = {
  version: 3,
  routes: [
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/index.html" }
  ]
};

fs.writeFileSync(
  path.join(vercelConfigDir, 'config.json'),
  JSON.stringify(config, null, 2)
);

console.log('✅ Estrutura Vercel Build Output gerada com sucesso!');