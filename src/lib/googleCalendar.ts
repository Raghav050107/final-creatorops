import type { Deliverable, Creator, Deal } from '../types/creatorops';

export function createGoogleCalendarEventUrl(
  deliverable: Deliverable,
  creator?: Creator,
  deal?: Deal
): string {
  const title = encodeURIComponent(`[Live Release] ${deliverable.title} (${creator?.name || 'Creator'})`);
  const details = encodeURIComponent(
    `Creator: ${creator?.name || 'Unassigned'}\n` +
    `Brand / Deal: ${deal?.brandName || 'Organic Solo Content'}\n` +
    `Platform: ${deliverable.platform} (${deliverable.type})\n` +
    `Status: ${deliverable.status}\n` +
    `Live URL: ${deliverable.liveUrl || 'N/A'}\n\n` +
    `Managed via CreatorOps Agency Hub`
  );

  const dateStr = deliverable.targetLiveDate || deliverable.dueDate;
  // Format YYYYMMDD
  const formattedDate = dateStr.replace(/-/g, '');
  const dates = `${formattedDate}/${formattedDate}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

export function generateICSFeedContent(
  deliverables: Deliverable[],
  creators: Creator[],
  deals: Deal[]
): string {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CreatorOps Agency Hub//Roster Calendar Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:CreatorOps Agency Roster Schedule',
    'X-WR-TIMEZONE:Asia/Kolkata'
  ];

  deliverables.forEach(deliv => {
    const creator = creators.find(c => c.id === deliv.creatorId);
    const deal = deals.find(d => d.id === deliv.dealId);
    const dateStr = (deliv.targetLiveDate || deliv.dueDate).replace(/-/g, '');

    ics.push(
      'BEGIN:VEVENT',
      `UID:deliv_${deliv.id}@creatorops.agency`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:[${deliv.platform}] ${deliv.title} - ${creator?.name || 'Creator'}`,
      `DESCRIPTION:Brand: ${deal?.brandName || 'Organic Solo'}\\nCreator: ${creator?.name || 'N/A'}\\nStatus: ${deliv.status}`,
      `STATUS:${deliv.status === 'Live' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

export function downloadICSFile(
  deliverables: Deliverable[],
  creators: Creator[],
  deals: Deal[]
): void {
  const content = generateICSFeedContent(deliverables, creators, deals);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `creatorops_agency_schedule_${new Date().toISOString().split('T')[0]}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
