import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../db';
import { hashPassword, verifyPassword, generateToken, requireAuth, requireOwnerOrManager, type AuthenticatedRequest } from '../auth';
import type { Agency, User } from '../types';

export const authRouter = Router();

// Register new Agency and Owner account
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { agencyName, name, email, password } = req.body;

    if (!agencyName || !name || !email || !password) {
      res.status(400).json({ error: 'All fields (agencyName, name, email, password) are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email address already exists' });
      return;
    }

    const agencyId = `agency_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const passwordHash = await hashPassword(password);

    const newAgency: Agency = {
      id: agencyId,
      name: agencyName.trim(),
      slug: agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      currency: 'INR',
      createdAt: new Date().toISOString()
    };

    const newUser: User = {
      id: userId,
      agencyId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'owner',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };

    db.mutate(data => {
      data.agencies.push(newAgency);
      data.users.push(newUser);
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Agency workspace created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        agencyId: newUser.agencyId
      },
      agency: newAgency
    });
  } catch (err: any) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const agency = db.findAgencyById(user.agencyId);
    if (!agency) {
      res.status(404).json({ error: 'Agency workspace associated with this account was not found' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        agencyId: user.agencyId
      },
      agency
    });
  } catch (err: any) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Get current authenticated user profile and agency workspace
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.findUserById(req.user!.userId);
  const agency = db.findAgencyById(req.user!.agencyId);

  if (!user || !agency) {
    res.status(404).json({ error: 'User or agency workspace not found' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      agencyId: user.agencyId
    },
    agency,
    teamMembers: db.getAgencyUsers(agency.id)
  });
});

// Update Profile (Name & Email)
authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    const userId = req.user!.userId;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing && existing.id !== userId) {
      res.status(409).json({ error: 'This email address is already in use by another user' });
      return;
    }

    let updatedUser: User | null = null;
    db.mutate(data => {
      const idx = data.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        data.users[idx].name = name.trim();
        data.users[idx].email = email.toLowerCase().trim();
        data.users[idx].avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
        updatedUser = data.users[idx];
      }
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const token = generateToken(updatedUser);

    res.json({
      message: 'Profile updated successfully',
      token,
      user: {
        id: (updatedUser as User).id,
        name: (updatedUser as User).name,
        email: (updatedUser as User).email,
        role: (updatedUser as User).role,
        avatarUrl: (updatedUser as User).avatarUrl,
        agencyId: (updatedUser as User).agencyId
      }
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change Password
authRouter.put('/password', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long' });
      return;
    }

    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    db.mutate(data => {
      const idx = data.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        data.users[idx].passwordHash = newHash;
      }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Create/Invite a new team member to current agency
authRouter.post('/users', requireAuth, requireOwnerOrManager, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const agencyId = req.user!.agencyId;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
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

    res.status(201).json({
      message: 'Team member added successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        agencyId: newUser.agencyId
      }
    });
  } catch (err: any) {
    console.error('Error adding team member:', err);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});
