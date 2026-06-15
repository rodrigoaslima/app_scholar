require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { runSchema } = require('./database/connection');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const cepRoutes = require('./routes/cepRoutes');
const courseRoutes = require('./routes/courseRoutes');
const messageRoutes = require('./routes/messageRoutes');
const professorRoutes = require('./routes/professorRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);
app.use('/api', cepRoutes);
app.use('/api', courseRoutes);
app.use('/api', messageRoutes);
app.use('/api', adminRoutes);
app.use('/api', professorRoutes);
app.use('/api', studentRoutes);

app.use((error, _req, res, _next) => {
  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    mensagem: error.message || 'Erro interno do servidor.',
    code: error.code || 'INTERNAL_ERROR',
  });
});

runSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`API App Scholar rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar banco de dados.', error);
    process.exit(1);
  });
