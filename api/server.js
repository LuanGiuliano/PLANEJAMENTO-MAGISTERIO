// api/server.js — Adaptador Vercel → TanStack Start (Fetch API)
// O bundle gerado pelo TanStack Start usa a interface fetch() do Web API

import app from '../dist/server/server.js';

export default async function handler(req, res) {
  // Reconstrói a Request padrão Web API a partir da req do Node/Vercel
  const url = `https://${req.headers.host}${req.url}`;

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await new Promise((resolve) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
      })
    : undefined;

  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body,
  });

  // Chama o handler do TanStack Start
  const response = await app.fetch(request, process.env, {});

  // Converte de volta para a resposta do Node/Vercel
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));

  const buffer = await response.arrayBuffer();
  res.end(Buffer.from(buffer));
}
