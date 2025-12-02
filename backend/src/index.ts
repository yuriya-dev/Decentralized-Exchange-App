import express from 'express';
import cors from 'cors';
import tokenRoutes from './routes/tokenRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', tokenRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});