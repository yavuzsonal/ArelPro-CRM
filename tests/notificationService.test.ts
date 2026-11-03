import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Activity, Meeting } from '../src/types';
import { getCrmNotifications } from '../src/services/notificationService';

function activity(id: string, date: string, status: Activity['status']): Activity {
  return {
    id,
    code: id,
    title: `Activity ${id}`,
    type: 'Teknik Gezi',
    companyId: 'company',
    companyName: 'Example Co.',
    date,
    timeRange: '10:00',
    location: 'Campus',
    department: 'Engineering',
    coordinationUnit: 'TTO',
    coordinator: 'Coordinator',
    targetStudents: 10,
    status,
    academicTerm: '2025-2026',
    createdAt: date,
  };
}

function meeting(id: string, date: string, status: Meeting['status']): Meeting {
  return {
    id,
    code: id,
    title: `Meeting ${id}`,
    companyId: 'company',
    companyName: 'Example Co.',
    date,
    timeRange: '10:00',
    durationMinutes: 60,
    format: 'Yüz Yüze',
    location: 'Campus',
    companyAttendees: 'Company team',
    arelAttendees: 'Arel team',
    moderator: 'Moderator',
    agendaItems: 'Agenda',
    decisionsAndActions: 'Actions',
    actionItemsCount: 0,
    status,
    meetingType: 'Genel Kurumsal',
    department: 'Engineering',
    createdAt: date,
  };
}

test('notifications include approval and upcoming records only within the next 14 days', () => {
  const notifications = getCrmNotifications(
    [
      activity('approval', '2026-04-30', 'Onay Bekliyor'),
      activity('upcoming', '2026-04-18', 'Planlandı'),
      activity('outside', '2026-04-19', 'Planlandı'),
      activity('completed', '2026-04-10', 'Tamamlandı'),
    ],
    [
      meeting('meeting', '2026-04-18', 'Planlandı'),
      meeting('postponed', '2026-04-10', 'Ertelendi'),
    ],
    new Date(2026, 3, 4, 12),
  );

  assert.deepEqual(notifications.map(item => item.id), [
    'activity:upcoming',
    'meeting:meeting',
    'activity:approval',
  ]);
  assert.equal(notifications[2].priority, 'urgent');
});
