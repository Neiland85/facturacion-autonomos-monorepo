import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'facturas-api' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Facturas corriendo en puerto ${PORT}`);
});
