import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { agencyRouter } from './routes/agency';
import { creatorsRouter } from './routes/creators';
import { dealsRouter } from './routes/deals';
import { deliverablesRouter } from './routes/deliverables';
import { calendarRouter } from './routes/calendar';
import { reportsRouter } from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Unseen Hours CreatorOps Cloud API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/agency', agencyRouter);
app.use('/api/creators', creatorsRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/deliverables', deliverablesRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/reports', reportsRouter);

// Serve frontend in production
const DIST_DIR = path.resolve(process.cwd(), 'dist');
app.use(express.static(DIST_DIR));

// Express 5 single-page application fallback
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send('CreatorOps Cloud API is online. Run frontend dev server or build the frontend with `pnpm build`.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CreatorOps SaaS Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📅 iCal Feed: http://localhost:${PORT}/api/calendar/feed.ics`);
});

export default app;
