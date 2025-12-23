import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Gateway is healthy and running on TypeScript!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway API ready at http://localhost:${PORT}`);
});