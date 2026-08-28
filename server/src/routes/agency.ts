import { Router } from 'express';
import type { Response } from 'express';
import { db } from '../db';
import { requireAuth, requireOwnerOrManager, type AuthenticatedRequest, hashPassword } from '../auth';
import type { User } from '../types';

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

// Update Agency profile (Name & Logo)
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

// Update Team Manager details (Name, Email, Role)
agencyRouter.put('/managers/:managerId', requireAuth, requireOwnerOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const agencyId = req.user!.agencyId;
    const { managerId } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    let updatedUser: User | null = null;
    db.mutate(data => {
      const idx = data.users.findIndex(u => u.id === managerId && u.agencyId === agencyId);
      if (idx !== -1) {
        data.users[idx].name = name.trim();
        data.users[idx].email = email.toLowerCase().trim();
        if (role) {
          data.users[idx].role = role === 'owner' ? 'owner' : role === 'viewer' ? 'viewer' : 'manager';
        }
        data.users[idx].avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
        updatedUser = data.users[idx];
      }
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'Manager not found' });
      return;
    }

    res.json({ message: 'Manager updated successfully', user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update manager' });
  }
});

// Add new Team Manager
agencyRouter.post('/managers', requireAuth, requireOwnerOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const agencyId = req.user!.agencyId;
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'A team member with this email already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      agencyId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role === 'owner' ? 'owner' : role === 'viewer' ? 'viewer' : 'manager',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };

    db.mutate(data => {
      data.users.push(newUser);
    });

    res.status(201).json({ message: 'Manager added successfully', user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add manager' });
  }
});

// Delete Team Manager seat
agencyRouter.delete('/managers/:managerId', requireAuth, requireOwnerOrManager, (req: AuthenticatedRequest, res: Response): void => {
  const agencyId = req.user!.agencyId;
  const { managerId } = req.params;

  if (managerId === req.user!.userId) {
    res.status(400).json({ error: 'You cannot delete your own logged-in user seat' });
    return;
  }

  db.mutate(data => {
    data.users = data.users.filter(u => !(u.id === managerId && u.agencyId === agencyId));
  });

  res.json({ message: 'Manager seat deleted successfully' });
});
