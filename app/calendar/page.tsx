import { isAuthenticated, getCalendarEvents } from '@/lib/google-calendar';
import { getDb } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 30;

// Google Calendar colorId → hex
const GCAL_COLORS: Record<string, string> = {
  '1': '#7986cb', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73',
  '5': '#f6bf26', '6': '#f4511e', '7': '#039be5', '8': '#616161',
  '9': '#3f51b5', '10': '#0b8043', '11': '#d50000',
};
const DEFAULT_GCAL_COLOR = '#22c55e';

interface RawEvent {
  id?: string | null;
  summary?: string | null;
  colorId?: string | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null } | null;
}

interface CronJob {
  job_id: string;
  name: string;
  enabled: number;
  schedule_kind: string;
  schedule_expr: string | null;
  every_ms: number | null;
  next_run_at_ms: number | null;
  payload_message: string | null;
  agent_id: string | null;
}

interface EventSlot {
  event: RawEvent;
  position: 'solo' | 'start' | 'continue' | 'end';
  isAllDay: boolean;
  color: string;
  showTitle: boolean;
}

function getCronJobs(): CronJob[] {
  try {
    const db = getDb();
    return db.prepare(`
      SELECT job_id, name, enabled, schedule_kind, schedule_expr,
             every_ms, next_run_at_ms, payload_message, agent_id
      FROM cron_jobs ORDER BY next_run_at_ms ASC
    `).all() as CronJob[];
  } catch { return []; }
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildEventMap(events: RawEvent[]): Map<string, EventSlot[]> {
  const map = new Map<string, EventSlot[]>();

  for (const event of events) {
    const startRaw = event.start?.dateTime ?? event.start?.date;
    const endRaw = event.end?.dateTime ?? event.end?.date;
    if (!startRaw) continue;

    const isAllDay = !event.start?.dateTime;
    const color = event.colorId ? (GCAL_COLORS[event.colorId] ?? DEFAULT_GCAL_COLOR) : DEFAULT_GCAL_COLOR;

    const startDate = startRaw.slice(0, 10);
    let endDate: string;
    if (isAllDay && endRaw) {
      const d = new Date(endRaw + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      endDate = toDateKey(d);
    } else {
      endDate = (endRaw ?? startRaw).slice(0, 10);
    }

    const isSolo = startDate === endDate;

    const cur = new Date(startDate + 'T00:00:00');
    const last = new Date(endDate + 'T00:00:00');
    let dayIdx = 0;
    while (cur <= last) {
      const key = toDateKey(cur);
      const isStart = dayIdx === 0;
      const isEnd = toDateKey(cur) === endDate;
      let position: EventSlot['position'];
      if (isSolo) position = 'solo';
      else if (isStart) position = 'start';
      else if (isEnd) position = 'end';
      else position = 'continue';

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({
        event, position, isAllDay, color,
        showTitle: position === 'solo' || position === 'start',
      });
      cur.setDate(cur.getDate() + 1);
      dayIdx++;
    }
  }
  return map;
}

function buildCalendarGrid(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const cells: { date: Date; inMonth: boolean }[] = [];
  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) cells.push({ date: new Date(year, month, -i), inMonth: false });
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push({ date: new Date(year, month, d), inMonth: true });
  const endPad = 6 - lastDay.getDay();
  for (let i = 1; i <= endPad; i++) cells.push({ date: new Date(year, month + 1, i), inMonth: false });
  return cells;
}

function formatEveryMs(ms: number): string {
  const m = ms / 60000;
  if (m < 60) return `every ${m}m`;
  const h = m / 60;
  if (h < 24) return `every ${h}h`;
  return `every ${h / 24}d`;
}

function formatNextRun(ms: number | null): string {
  if (!ms) return 'unknown';
  const date = new Date(ms);
  const diff = date.getTime() - Date.now();
  if (diff < 0) return 'overdue';
  if (diff < 60000) return 'in <1m';
  if (diff < 3600000) return `in ${Math.round(diff / 60000)}m`;
  if (diff < 86400000) return `in ${Math.round(diff / 3600000)}h`;
  return date.toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' });
}

function scheduleTypeBadge(kind: string, enabled: number) {
  if (!enabled) return { label: 'DISABLED', color: '#475569' };
  if (kind === 'cron') return { label: 'CRON', color: '#7c3aed' };
  if (kind === 'every') return { label: 'RECURRING', color: '#7c3aed' };
  if (kind === 'at') return { label: 'ONE-SHOT', color: '#ec4899' };
  return { label: kind.toUpperCase(), color: '#475569' };
}

const DAY_HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MAX_VISIBLE_EVENTS = 3;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; connected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const authed = isAuthenticated();
  const cronJobs = getCronJobs();

  const today = new Date();
  const todayKey = toDateKey(today);

  let displayYear = today.getFullYear();
  let displayMonth = today.getMonth();

  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split('-').map(Number);
    displayYear = y;
    displayMonth = m - 1;
  }

  const currentParam = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;
  const todayParam = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = currentParam === todayParam;

  const monthStart = new Date(displayYear, displayMonth, 1);
  const monthEnd = new Date(displayYear, displayMonth + 1, 1);
  const prevDate = new Date(displayYear, displayMonth - 1, 1);
  const nextDate = new Date(displayYear, displayMonth + 1, 1);
  const prevParam = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const nextParam = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = monthStart.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

  let gcalError: string | null = null;
  let eventMap = new Map<string, EventSlot[]>();

  if (authed) {
    try {
      const events = (await getCalendarEvents(monthStart, monthEnd)) ?? [];
      eventMap = buildEventMap(events as RawEvent[]);
    } catch (err: unknown) {
      gcalError = err instanceof Error ? err.message : 'Failed to load events';
    }
  }

  const calendarCells = buildCalendarGrid(displayYear, displayMonth);

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: '1200px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em',
          color: '#475569', textTransform: 'uppercase', marginBottom: '6px',
        }}>
          Schedule
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
              📅 {monthLabel}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Link href={`/calendar?month=${prevParam}`} style={{
                color: '#94a3b8', textDecoration: 'none', fontSize: '16px',
                padding: '4px 8px', borderRadius: '4px', lineHeight: 1,
                border: '1px solid #1e2435',
              }}>
                ‹
              </Link>
              <Link href={`/calendar?month=${nextParam}`} style={{
                color: '#94a3b8', textDecoration: 'none', fontSize: '16px',
                padding: '4px 8px', borderRadius: '4px', lineHeight: 1,
                border: '1px solid #1e2435',
              }}>
                ›
              </Link>
              {!isCurrentMonth && (
                <Link href={`/calendar?month=${todayParam}`} style={{
                  color: '#94a3b8', textDecoration: 'none', fontSize: '11px',
                  padding: '3px 10px', borderRadius: '4px',
                  border: '1px solid #1e2435', marginLeft: '4px',
                }}>
                  Today
                </Link>
              )}
            </div>
          </div>
          <div>
            {!authed ? (
              <Link href="/api/auth/google" style={{
                fontSize: '11px', color: '#7c3aed', textDecoration: 'none',
                border: '1px solid #7c3aed', borderRadius: '4px', padding: '4px 12px',
              }}>
                Connect Google Calendar
              </Link>
            ) : (
              <span style={{ fontSize: '11px', color: '#22c55e' }}>● Google Calendar connected</span>
            )}
          </div>
        </div>
      </div>

      {/* Banners */}
      {params.connected === '1' && (
        <div style={{
          background: '#14532d', border: '1px solid #16a34a', borderRadius: '6px',
          padding: '10px 14px', marginBottom: '16px', color: '#86efac', fontSize: '13px',
        }}>
          Google Calendar connected.
        </div>
      )}
      {params.error && (
        <div style={{
          background: '#450a0a', border: '1px solid #dc2626', borderRadius: '6px',
          padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px',
        }}>
          Auth error: {params.error}.{' '}
          <a href="/api/auth/google" style={{ color: '#f87171' }}>Try again</a>
        </div>
      )}
      {authed && gcalError && (
        <div style={{
          background: '#0d1117', border: '1px solid #dc2626', borderRadius: '6px',
          padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px',
        }}>
          {gcalError}
        </div>
      )}

      {/* Calendar grid — single flat grid, headers + all cells */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        border: '1px solid #1e2435',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '48px',
      }}>
        {/* Day header row */}
        {DAY_HEADERS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', padding: '8px 0',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            color: '#475569', textTransform: 'uppercase',
            background: '#0a0d12',
            borderBottom: '1px solid #1e2435',
            borderRight: i < 6 ? '1px solid #1e2435' : undefined,
          }}>
            {d}
          </div>
        ))}

        {/* Day cells */}
        {calendarCells.map((cell, idx) => {
          const cellKey = toDateKey(cell.date);
          const isToday = cellKey === todayKey;
          const col = idx % 7;
          const slots = eventMap.get(cellKey) ?? [];
          const visible = slots.slice(0, MAX_VISIBLE_EVENTS);
          const overflow = slots.length - MAX_VISIBLE_EVENTS;

          return (
            <div key={cellKey} style={{
              background: cell.inMonth ? '#0d1117' : '#090c12',
              borderRight: col < 6 ? '1px solid #1e2435' : undefined,
              borderTop: '1px solid #1e2435',
              padding: '6px 4px 8px',
              minHeight: '100px',
              verticalAlign: 'top',
            }}>
              {/* Day number */}
              <div style={{ marginBottom: '4px', paddingLeft: '2px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: isToday ? '#7c3aed' : 'transparent',
                  fontSize: '11px', fontWeight: isToday ? 700 : 400,
                  color: !cell.inMonth ? '#2d3748' : isToday ? '#fff' : '#94a3b8',
                }}>
                  {cell.date.getDate()}
                </span>
              </div>

              {/* Event bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {visible.map((slot, evIdx) => {
                  const { position, color, showTitle, event } = slot;
                  const isStart = position === 'start' || position === 'solo';
                  const isEnd = position === 'end' || position === 'solo';
                  const isContinue = position === 'continue';

                  return (
                    <div
                      key={`${event.id ?? evIdx}-${cellKey}`}
                      title={event.summary ?? ''}
                      style={{
                        background: `${color}30`,
                        borderLeft: isStart ? `3px solid ${color}` : `3px solid transparent`,
                        borderRadius: isStart && isEnd ? '3px' : isStart ? '3px 0 0 3px' : isEnd ? '0 3px 3px 0' : '0',
                        color: showTitle ? color : 'transparent',
                        fontSize: '10px',
                        fontWeight: 500,
                        lineHeight: '1.4',
                        padding: '1px 4px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        marginLeft: isContinue ? '-4px' : '0',
                        marginRight: isEnd && !isStart ? '-4px' : '0',
                        minHeight: '16px',
                        userSelect: 'none',
                      }}
                    >
                      {showTitle ? (event.summary ?? '(no title)') : ' '}
                    </div>
                  );
                })}
                {overflow > 0 && (
                  <div style={{
                    fontSize: '10px', color: '#64748b',
                    paddingLeft: '4px', cursor: 'default',
                  }}>
                    +{overflow} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cron jobs */}
      <div>
        <div style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em',
          color: '#475569', textTransform: 'uppercase', marginBottom: '14px',
        }}>
          Cron jobs ({cronJobs.length})
        </div>

        {cronJobs.length === 0 && (
          <div style={{
            background: '#0d1117', border: '1px solid #1e2435', borderRadius: '8px',
            padding: '24px', color: '#475569', fontSize: '13px', textAlign: 'center',
          }}>
            No scheduled jobs yet.
          </div>
        )}

        {cronJobs.map((job) => {
          const badge = scheduleTypeBadge(job.schedule_kind, job.enabled);
          return (
            <div key={job.job_id} style={{
              background: '#0d1117', border: '1px solid #1e2435',
              borderLeft: `3px solid ${job.enabled ? '#7c3aed' : '#334155'}`,
              borderRadius: '6px', padding: '12px 16px', marginBottom: '8px',
              opacity: job.enabled ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 500 }}>{job.name}</div>
                <span style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                  color: badge.color, background: `${badge.color}20`,
                  padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap', marginLeft: '12px',
                }}>
                  {badge.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {job.schedule_expr && (
                  <code style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>
                    {job.schedule_expr}
                  </code>
                )}
                {job.every_ms && (
                  <code style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>
                    {formatEveryMs(job.every_ms)}
                  </code>
                )}
                {job.next_run_at_ms && (
                  <span style={{ color: '#64748b', fontSize: '11px' }}>
                    next: {formatNextRun(job.next_run_at_ms)}
                  </span>
                )}
                {job.agent_id && (
                  <span style={{ color: '#64748b', fontSize: '11px' }}>agent: {job.agent_id}</span>
                )}
              </div>
              {job.payload_message && (
                <div style={{
                  color: '#475569', fontSize: '11px', marginTop: '6px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {job.payload_message.slice(0, 120)}{job.payload_message.length > 120 ? '…' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
