import { MobileShell } from "@/components/mobile/mobile-shell";
import { ReportTable } from "@/components/mobile/report-table";
import styles from "@/components/mobile/mobile-ui.module.css";
import { getMobileReport } from "@/lib/mobile-api";

export default async function MobileReportPage() {
  const reportResult = await getMobileReport();
  const summaryStatusClass =
    reportResult.data.summary.status === "Approved"
      ? styles.statusApproved
      : reportResult.data.summary.status === "Exam"
        ? styles.statusExam
        : styles.statusProgress;

  return (
    <MobileShell pageTitle="Final report" pageSubtitle="Term grades snapshot">
      <section className={styles.section}>
        <article className={`${styles.reportHeader} ${styles.neoRaised}`}>
          <div>
            <p className={styles.subtitle}>Student</p>
            <p className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              {reportResult.data.student.name}
            </p>
            <p className={styles.hint}>
              Class: {reportResult.data.student.class_name} - ID {reportResult.data.student.student_id}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <div className={`${styles.statBox} ${styles.neoInset}`}>
              <span className={styles.statLabel}>Overall</span>
              <span className={styles.statValue}>{reportResult.data.summary.overall}</span>
            </div>
            <div className={`${styles.statBox} ${styles.neoInset}`}>
              <span className={styles.statLabel}>Status</span>
              <span className={`${styles.statValue} ${summaryStatusClass}`}>
                {reportResult.data.summary.status}
              </span>
            </div>
          </div>
        </article>
      </section>
      <ReportTable lines={reportResult.data.lines} />
      <section className={styles.section}>
        {reportResult.source === "fallback" ? (
          <p className={styles.hint}>
            API unavailable ({reportResult.error ?? "unknown"}). Showing fallback report data.
          </p>
        ) : (
          <p className={styles.hint}>Data loaded from backend endpoint /api/v1/mobile/report.</p>
        )}
      </section>
    </MobileShell>
  );
}
