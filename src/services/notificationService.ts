import { Activity, Meeting } from '../types';

export interface CrmNotification {
  id: string;
  title: string;
  detail: string;
  date: string;
  kind: 'activity' | 'meeting';
  recordId: string;
  priority: 'urgent' | 'normal';
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCrmNotifications(
  activities: Activity[],
  meetings: Meeting[],
  now = new Date(),
): CrmNotification[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 14);
  const todayKey = localDateKey(today);
  const cutoffKey = localDateKey(cutoff);
  const notifications: CrmNotification[] = [];

  for (const activity of activities) {
    const awaitingApproval = activity.status === 'Onay Bekliyor';
    const isUpcoming = activity.status === 'Planlandı'
      && activity.date >= todayKey
      && activity.date <= cutoffKey;
    if (!awaitingApproval && !isUpcoming) continue;
    notifications.push({
      id: `activity:${activity.id}`,
      title: awaitingApproval ? 'Faaliyet onay bekliyor' : 'Yaklaşan faaliyet',
      detail: `${activity.title} · ${activity.companyName || 'Firma belirtilmedi'}`,
      date: activity.date,
      kind: 'activity',
      recordId: activity.id,
      priority: awaitingApproval ? 'urgent' : 'normal',
    });
  }

  for (const meeting of meetings) {
    const isUpcoming = (meeting.status === 'Planlandı' || meeting.status === 'İmza Aşamasında')
      && meeting.date >= todayKey
      && meeting.date <= cutoffKey;
    if (!isUpcoming) continue;
    notifications.push({
      id: `meeting:${meeting.id}`,
      title: meeting.status === 'İmza Aşamasında' ? 'Toplantı imza sürecinde' : 'Yaklaşan toplantı',
      detail: `${meeting.title} · ${meeting.companyName || 'Firma belirtilmedi'}`,
      date: meeting.date,
      kind: 'meeting',
      recordId: meeting.id,
      priority: 'normal',
    });
  }

  return notifications.sort((left, right) =>
    left.date.localeCompare(right.date)
      || (left.priority === 'urgent' ? -1 : right.priority === 'urgent' ? 1 : 0),
  );
}
