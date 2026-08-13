import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../db';
import { requireAuth, requireOwnerOrManager, type AuthenticatedRequest } from '../auth';
import type { Report } from '../types';

export const reportsRouter = Router();

// GET all reports for agency
reportsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  res.json(db.getAgencyReports(agencyId));
});

// POST generate new report for deal
reportsRouter.post('/', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const { dealId } = req.body;

  const deals = db.getAgencyDeals(agencyId);
  const deal = deals.find(d => d.id === dealId);

  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  const slug = `${deal.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

  const newReport: Report = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    agencyId,
    publicSlug: slug,
    dealId,
    generatedAt: new Date().toISOString()
  };

  db.mutate(data => {
    data.reports.unshift(newReport);
  });

  res.status(201).json(newReport);
});

// PUBLIC: GET /api/reports/public/:slug (No login required - for brand clients)
reportsRouter.get('/public/:slug', (req: Request, res: Response): void => {
  const { slug } = req.params;
  const rawDb = db.getRaw();

  const report = rawDb.reports.find(r => r.publicSlug === slug);
  if (!report) {
    res.status(404).json({ error: 'Report not found or link has expired' });
    return;
  }

  const agency = rawDb.agencies.find(a => a.id === report.agencyId);
  const deal = rawDb.deals.find(d => d.id === report.dealId && d.agencyId === report.agencyId);
  const deliverables = rawDb.deliverables.filter(d => d.dealId === report.dealId && d.agencyId === report.agencyId);
  const creators = rawDb.creators.filter(c => deal?.creatorIds.includes(c.id));

  res.json({
    report,
    agency: agency ? { name: agency.name, logoUrl: agency.logoUrl } : { name: 'Unseen Hours' },
    deal,
    creators,
    deliverables
  });
});
