import { Router } from 'express';
import type { Response } from 'express';
import { db } from '../db';
import { requireAuth, requireOwnerOrManager, type AuthenticatedRequest } from '../auth';

export const agencyRouter = Router();

// Get agency details and full aggregate workspace bundle
agencyRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const agency = db.findAgencyById(agencyId);

  if (!agency) {
    res.status(404).json({ error: 'Agency not found' });
    return;
  }

  const teamMembers = db.getAgencyUsers(agencyId);
  const creators = db.getAgencyCreators(agencyId);
  const deals = db.getAgencyDeals(agencyId);
  const deliverables = db.getAgencyDeliverables(agencyId);
  const reports = db.getAgencyReports(agencyId);

  res.json({
    id: agency.id,
    name: agency.name,
    slug: agency.slug,
    currency: agency.currency || 'INR',
    managers: teamMembers.map(u => ({
      id: u.id,
      agencyId: u.agencyId,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
      role: u.role === 'owner' ? 'Agency Principal / Owner' : 'Campaign Operations Manager'
    })),
    creators,
    deals,
    deliverables,
    reports
  });
});

// Update Agency profile
agencyRouter.put('/', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const { name, logoUrl } = req.body;

  let updatedAgency = null;
  db.mutate(data => {
    const idx = data.agencies.findIndex(a => a.id === agencyId);
    if (idx !== -1) {
      if (name) data.agencies[idx].name = name.trim();
      if (logoUrl !== undefined) data.agencies[idx].logoUrl = logoUrl;
      updatedAgency = data.agencies[idx];
    }
  });

  if (!updatedAgency) {
    res.status(404).json({ error: 'Agency not found' });
    return;
  }

  res.json({ message: 'Agency profile updated', agency: updatedAgency });
});
