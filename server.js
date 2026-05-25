// server.js - Servidor Node.js SPA (Web Service Render)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

// 1. Serve arquivos estáticos do cliente (JS, CSS, imagens)
server.use(express.static(path.join(__dirname, 'dist', 'client')));

// 2. Fallback de SPA: Qualquer rota não encontrada vai para o index.html
server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'client', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Estático SPA rodando na porta ${PORT}`);
});
