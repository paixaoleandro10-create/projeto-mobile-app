import { DashboardSections } from "@/components/mobile/dashboard-sections";
import { MobileShell } from "@/components/mobile/mobile-shell";
import styles from "@/components/mobile/mobile-ui.module.css";
import { getMobileDashboard } from "@/lib/mobile-api";

export default async function MobileDashboardPage() {
  const dashboardResult = await getMobileDashboard();

  return (
    <MobileShell pageTitle="Dashboard" pageSubtitle="Mobile academic overview">
      <DashboardSections
        overview={dashboardResult.data.overview}
        tasks={dashboardResult.data.tasks}
        performance={dashboardResult.data.performance}
      />
      {dashboardResult.source === "fallback" ? (
        <section className={styles.section}>
          <p className={styles.hint}>
            API unavailable ({dashboardResult.error ?? "unknown"}). Showing fallback mobile data.
          </p>
        </section>
      ) : null}
    </MobileShell>
  );
}
