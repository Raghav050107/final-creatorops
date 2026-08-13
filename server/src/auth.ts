import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { AuthPayload, User } from './types';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'creatorops_jwt_secret_unseen_hours_2026_super_secure_key';
const JWT_EXPIRES_IN = '30d';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
  const payload: AuthPayload = {
    userId: user.id,
    agencyId: user.agencyId,
    role: user.role,
    email: user.email,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  // Verify user still exists in database
  const user = db.findUserById(payload.userId);
  if (!user || user.agencyId !== payload.agencyId) {
    res.status(401).json({ error: 'Unauthorized: User or Agency not found' });
    return;
  }

  req.user = payload;
  next();
};

export const requireOwnerOrManager = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'manager')) {
    res.status(403).json({ error: 'Forbidden: Requires manager or owner privileges' });
    return;
  }
  next();
};
