// Test server simple
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '🏦 COOP-SMART API funcionando!' });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor de prueba corriendo en http://localhost:${PORT}`);
  console.log('Presiona Ctrl+C para detener');
});
