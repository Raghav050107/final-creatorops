import { Router } from 'express';
import type { Response } from 'express';
import { db } from '../db';
import { requireAuth, requireOwnerOrManager, type AuthenticatedRequest } from '../auth';
import type { Deliverable } from '../types';

export const deliverablesRouter = Router();

// GET all deliverables for current agency
deliverablesRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  res.json(db.getAgencyDeliverables(agencyId));
});

// POST schedule new deliverable
deliverablesRouter.post('/', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const { dealId, creatorId, category, title, type, platform, dueDate, targetLiveDate, status } = req.body;

  if (!creatorId || !title || !dueDate) {
    res.status(400).json({ error: 'Creator, title, and due date are required' });
    return;
  }

  const newDeliverable: Deliverable = {
    id: `deliv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    agencyId,
    dealId: dealId || undefined,
    creatorId,
    category: category || 'sponsored',
    title: title.trim(),
    type: type || 'video',
    platform: platform || 'YouTube',
    dueDate,
    targetLiveDate: targetLiveDate || dueDate,
    status: status || 'Draft',
    finalMetrics: {
      views: 0,
      likes: 0,
      comments: 0,
      source: 'manual'
    },
    createdAt: new Date().toISOString()
  };

  db.mutate(data => {
    data.deliverables.unshift(newDeliverable);
  });

  res.status(201).json(newDeliverable);
});

// PUT update deliverable (status, dates, metrics, liveUrl)
deliverablesRouter.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const deliverableId = req.params.id;

  let updatedDeliv: Deliverable | null = null;
  db.mutate(data => {
    const idx = data.deliverables.findIndex(d => d.id === deliverableId && d.agencyId === agencyId);
    if (idx !== -1) {
      data.deliverables[idx] = {
        ...data.deliverables[idx],
        ...req.body,
        id: deliverableId,
        agencyId
      };
      updatedDeliv = data.deliverables[idx];
    }
  });

  if (!updatedDeliv) {
    res.status(404).json({ error: 'Deliverable not found' });
    return;
  }

  res.json(updatedDeliv);
});

// DELETE deliverable
deliverablesRouter.delete('/:id', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const deliverableId = req.params.id;

  db.mutate(data => {
    data.deliverables = data.deliverables.filter(d => !(d.id === deliverableId && d.agencyId === agencyId));
  });

  res.json({ message: 'Deliverable deleted' });
});
