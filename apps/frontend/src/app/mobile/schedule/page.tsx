import { MobileShell } from "@/components/mobile/mobile-shell";
import styles from "@/components/mobile/mobile-ui.module.css";
import { SchedulePlanner } from "@/components/mobile/schedule-planner";
import { getMobileSchedule } from "@/lib/mobile-api";

export default async function MobileSchedulePage() {
  const scheduleResult = await getMobileSchedule();

  return (
    <MobileShell pageTitle="Schedule" pageSubtitle="Select a date and inspect upcoming events">
      <SchedulePlanner
        events={scheduleResult.data.events}
        monthLabel={scheduleResult.data.month_label}
        defaultDay={scheduleResult.data.default_day}
      />
      {scheduleResult.source === "fallback" ? (
        <section className={styles.section}>
          <p className={styles.hint}>
            API unavailable ({scheduleResult.error ?? "unknown"}). Showing fallback schedule.
          </p>
        </section>
      ) : null}
    </MobileShell>
  );
}
