import { Router } from 'express';
import type { Response } from 'express';
import { db } from '../db';
import { requireAuth, requireOwnerOrManager, type AuthenticatedRequest } from '../auth';
import type { Creator } from '../types';

export const creatorsRouter = Router();

// GET all creators for current agency
creatorsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  res.json(db.getAgencyCreators(agencyId));
});

// POST create new creator
creatorsRouter.post('/', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const { name, photoUrl, colorCode, platforms, handles, rateNotes, representationType } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Creator name is required' });
    return;
  }

  const newCreator: Creator = {
    id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    agencyId,
    name: name.trim(),
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    colorCode: colorCode || '#6366F1',
    platforms: platforms || ['YouTube', 'Instagram'],
    handles: handles || {},
    rateNotes: rateNotes || '',
    representationType: representationType || 'In-House Exclusive',
    createdAt: new Date().toISOString()
  };

  db.mutate(data => {
    data.creators.unshift(newCreator);
  });

  res.status(201).json(newCreator);
});

// PUT update creator
creatorsRouter.put('/:id', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const creatorId = req.params.id;

  let updatedCreator: Creator | null = null;
  db.mutate(data => {
    const idx = data.creators.findIndex(c => c.id === creatorId && c.agencyId === agencyId);
    if (idx !== -1) {
      data.creators[idx] = {
        ...data.creators[idx],
        ...req.body,
        id: creatorId,
        agencyId
      };
      updatedCreator = data.creators[idx];
    }
  });

  if (!updatedCreator) {
    res.status(404).json({ error: 'Creator not found' });
    return;
  }

  res.json(updatedCreator);
});

// DELETE creator
creatorsRouter.delete('/:id', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const creatorId = req.params.id;

  db.mutate(data => {
    data.creators = data.creators.filter(c => !(c.id === creatorId && c.agencyId === agencyId));
    data.deliverables = data.deliverables.filter(d => !(d.creatorId === creatorId && d.agencyId === agencyId));
  });

  res.json({ message: 'Creator deleted successfully' });
});
