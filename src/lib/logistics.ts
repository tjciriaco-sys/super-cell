import type { LogisticsException, Schedule } from "@/lib/types";
const TIMEZONE = "America/Fortaleza";
function localParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { year: Number(value("year")), month: Number(value("month")), day: Number(value("day")), weekday: weekdays[value("weekday")] };
}
const dateKey = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
function fortalezaTimestamp(y: number, m: number, d: number, time: string) { const [h, min] = time.split(":").map(Number); return new Date(Date.UTC(y, m - 1, d, h + 3, min, 0)); }
export type RouteState = { departure: Date; cutoff: Date; label: string; departureLabel: string; nextSameDay: string | null; urgent: boolean };
export function calculateNextRoute(now: Date, schedules: Schedule[], exceptions: LogisticsException[]): RouteState | null {
  const base = localParts(now); const baseUtc = Date.UTC(base.year, base.month - 1, base.day);
  for (let offset = 0; offset < 15; offset++) {
    const cursor = new Date(baseUtc + offset * 86400000), y = cursor.getUTCFullYear(), m = cursor.getUTCMonth() + 1, d = cursor.getUTCDate(), weekday = cursor.getUTCDay();
    const exception = exceptions.find((item) => item.exception_date === dateKey(y, m, d)); if (exception?.no_routes) continue;
    const candidates = exception?.custom_routes?.length ? exception.custom_routes.map((r, index) => ({ id: `ex-${index}`, weekday, departure_time: r.time, cutoff_minutes: r.cutoff_minutes ?? 60, active: true })) : schedules.filter((s) => s.weekday === weekday && s.active);
    const sorted = [...candidates].sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    for (let index = 0; index < sorted.length; index++) {
      const schedule = sorted[index], departure = fortalezaTimestamp(y, m, d, schedule.departure_time), cutoff = new Date(departure.getTime() - schedule.cutoff_minutes * 60000);
      if (now.getTime() >= cutoff.getTime()) continue;
      const label = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", timeZone: TIMEZONE }).format(departure);
      const nextSameDay = sorted.slice(index + 1).map((r) => r.departure_time.slice(0, 5)).find((t) => fortalezaTimestamp(y, m, d, t).getTime() - schedule.cutoff_minutes * 60000 > now.getTime()) ?? null;
      return { departure, cutoff, label, departureLabel: schedule.departure_time.slice(0, 5), nextSameDay, urgent: cutoff.getTime() - now.getTime() <= 3600000 };
    }
  }
  return null;
}
