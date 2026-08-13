import { Router } from 'express';
import type { Response } from 'express';
import { db } from '../db';
import { requireAuth, requireOwnerOrManager, type AuthenticatedRequest } from '../auth';
import type { Deal, DealNote } from '../types';

export const dealsRouter = Router();

// GET all deals for current agency
dealsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  res.json(db.getAgencyDeals(agencyId));
});

// POST create brand deal
dealsRouter.post('/', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const { 
    brandName, 
    brandContact, 
    value, 
    currency, 
    commissionPct, 
    unseenHoursCutPct,
    stage, 
    targetLiveDate,
    creatorIds,
    paymentStatus,
    paymentDueDate,
    invoiceSentDate,
    initialNote
  } = req.body;

  if (!brandName || value === undefined) {
    res.status(400).json({ error: 'Brand name and commercial value are required' });
    return;
  }

  const dealId = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const authorName = req.user?.name || 'Agency Manager';

  const newDeal: Deal = {
    id: dealId,
    agencyId,
    brandName: brandName.trim(),
    brandContact: brandContact || 'brand@partner.com',
    value: Number(value),
    currency: currency || 'INR',
    commissionPct: commissionPct !== undefined ? Number(commissionPct) : 15,
    unseenHoursCutPct: unseenHoursCutPct !== undefined ? Number(unseenHoursCutPct) : (commissionPct || 15),
    stage: stage || 'Inbound',
    targetLiveDate: targetLiveDate || undefined,
    invoiceSentDate: invoiceSentDate || undefined,
    paymentDueDate: paymentDueDate || undefined,
    paymentStatus: paymentStatus || 'Invoice Pending',
    creatorIds: Array.isArray(creatorIds) ? creatorIds : [],
    activityLog: [
      {
        id: `act_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        author: authorName,
        text: `Deal created for ${brandName} at ${value} INR`
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.mutate(data => {
    data.deals.unshift(newDeal);
    if (initialNote && typeof initialNote === 'string' && initialNote.trim()) {
      data.dealNotes.unshift({
        id: `note_${Date.now()}`,
        dealId,
        agencyId,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        author: authorName,
        text: initialNote.trim(),
        createdAt: new Date().toISOString()
      });
    }
  });

  const fullDeals = db.getAgencyDeals(agencyId);
  const created = fullDeals.find(d => d.id === dealId) || newDeal;
  res.status(201).json(created);
});

// PUT update deal (stage, notes, details, etc.)
dealsRouter.put('/:id', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const dealId = req.params.id;

  let updatedDeal: Deal | null = null;
  db.mutate(data => {
    const idx = data.deals.findIndex(d => d.id === dealId && d.agencyId === agencyId);
    if (idx !== -1) {
      const oldStage = data.deals[idx].stage;
      const newStage = req.body.stage;

      const activityLog = [...data.deals[idx].activityLog];
      if (newStage && newStage !== oldStage) {
        activityLog.unshift({
          id: `act_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: req.user?.name || 'Agency Manager',
          text: `Stage moved from ${oldStage} to ${newStage}`
        });
      }

      data.deals[idx] = {
        ...data.deals[idx],
        ...req.body,
        activityLog,
        id: dealId,
        agencyId
      };
      updatedDeal = data.deals[idx];
    }
  });

  if (!updatedDeal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  const fullDeals = db.getAgencyDeals(agencyId);
  res.json(fullDeals.find(d => d.id === dealId) || updatedDeal);
});

// DELETE deal
dealsRouter.delete('/:id', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const dealId = req.params.id;

  db.mutate(data => {
    data.deals = data.deals.filter(d => !(d.id === dealId && d.agencyId === agencyId));
    data.dealNotes = data.dealNotes.filter(n => !(n.dealId === dealId && n.agencyId === agencyId));
    data.deliverables = data.deliverables.filter(del => !(del.dealId === dealId && del.agencyId === agencyId));
  });

  res.json({ message: 'Deal deleted successfully' });
});

// --- DEAL NOTES SUB-RESOURCES (SEPARATED NOTE ENTRY BOXES) ---

// GET all notes for a specific deal
dealsRouter.get('/:id/notes', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const dealId = req.params.id;

  const notes = db.getRaw().dealNotes
    .filter(n => n.dealId === dealId && n.agencyId === agencyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(notes);
});

// POST add a new note entry box for a deal
dealsRouter.post('/:id/notes', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const dealId = req.params.id;
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Note text cannot be empty' });
    return;
  }

  const newNote: DealNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    dealId,
    agencyId,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    author: req.user?.name || 'Agency Manager',
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  db.mutate(data => {
    data.dealNotes.unshift(newNote);
  });

  res.status(201).json(newNote);
});

// DELETE a specific note entry box
dealsRouter.delete('/:dealId/notes/:noteId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const { dealId, noteId } = req.params;

  db.mutate(data => {
    data.dealNotes = data.dealNotes.filter(n => !(n.id === noteId && n.dealId === dealId && n.agencyId === agencyId));
  });

  res.json({ message: 'Note entry deleted' });
});
