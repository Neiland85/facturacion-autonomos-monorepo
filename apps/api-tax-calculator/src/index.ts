import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'tax-calculator-api' });
});

app.listen(PORT, () => {
  console.log(`🧮 API Tax Calculator corriendo en puerto ${PORT}`);
});
