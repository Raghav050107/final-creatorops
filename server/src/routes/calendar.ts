import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../db';
import { verifyToken } from '../auth';

export const calendarRouter = Router();

// GET /api/calendar/feed.ics?token=... OR ?agencyId=...
// Serves standard iCalendar (.ics) format compatible with Google Calendar, Apple Calendar, Outlook
calendarRouter.get('/feed.ics', (req: Request, res: Response): void => {
  const token = req.query.token as string | undefined;
  const directAgencyId = req.query.agencyId as string | undefined;

  let targetAgencyId = 'agency_unseen_hours_1'; // default fallback for default agency

  if (token) {
    const payload = verifyToken(token);
    if (payload?.agencyId) {
      targetAgencyId = payload.agencyId;
    }
  } else if (directAgencyId) {
    targetAgencyId = directAgencyId;
  }

  const agency = db.findAgencyById(targetAgencyId);
  const agencyName = agency?.name || 'Unseen Hours';
  const deliverables = db.getAgencyDeliverables(targetAgencyId);
  const creators = db.getAgencyCreators(targetAgencyId);
  const deals = db.getAgencyDeals(targetAgencyId);

  const formatICSDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const now = new Date();
      return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}${month}${day}T120000Z`;
  };

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const events = deliverables.map(deliv => {
    const creator = creators.find(c => c.id === deliv.creatorId);
    const deal = deals.find(d => d.id === deliv.dealId);
    const dtStart = formatICSDate(deliv.targetLiveDate || deliv.dueDate);
    const summary = `${creator ? creator.name : 'Creator'} - ${deliv.platform} ${deliv.type.toUpperCase()} (${deliv.status})`;
    const description = `Deliverable: ${deliv.title}\\nBrand: ${deal ? deal.brandName : 'Direct'}\\nStatus: ${deliv.status}\\nCategory: ${deliv.category}\\nAgency: ${agencyName}`;

    return [
      'BEGIN:VEVENT',
      `UID:${deliv.id}@creatorops.unseenhours.com`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${dtStart}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `STATUS:${deliv.status === 'Live' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${agencyName}//CreatorOps Calendar 2.0//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${agencyName} Release Calendar`,
    'X-WR-TIMEZONE:Asia/Kolkata',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-calendar.ics"`);
  res.send(icsContent);
});
