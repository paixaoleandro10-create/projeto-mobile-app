import styles from "@/components/mobile/mobile-ui.module.css";
import type { DashboardOverview, DashboardTask, PerformanceEntry } from "@/lib/mobile-data";

type DashboardSectionsProps = {
  overview: DashboardOverview;
  tasks: DashboardTask[];
  performance: PerformanceEntry[];
};

export function DashboardSections({ overview, tasks, performance }: DashboardSectionsProps) {
  return (
    <>
      <section className={styles.section} aria-label="Overall performance">
        <article className={`${styles.heroCard} ${styles.neoRaised}`}>
          <div>
            <p className={styles.subtitle}>Overall performance</p>
            <p className={styles.heroMain}>Weighted GPA: {overview.weighted_gpa}</p>
            <p className={styles.heroSupport}>{overview.class_rank}</p>
          </div>
          <div className={styles.ring} aria-label={`Progress ${overview.progress_percent} percent`}>
            <div className={`${styles.ringInner} ${styles.neoInset}`}>
              {overview.progress_percent}%
              <small>Progress</small>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.section} aria-labelledby="tasks-title">
        <h2 id="tasks-title" className={styles.sectionTitle}>
          Ongoing tasks
        </h2>
        <div className={styles.taskGrid}>
          {tasks.map((task) => (
            <article key={task.id} className={`${styles.taskCard} ${styles.neoRaised}`}>
              <div className={styles.taskHeader}>
                <h3 className={styles.taskTitle}>{task.title}</h3>
                {task.priority === "high" ? (
                  <span className={`${styles.pill} ${styles.pillDanger}`}>High priority</span>
                ) : null}
              </div>
              <p className={styles.tiny}>{task.subtitle}</p>
              {typeof task.progress === "number" ? (
                <div className={styles.progressTrack} aria-label={`Task progress ${task.progress} percent`}>
                  <div className={styles.progressFill} style={{ width: `${task.progress}%` }} />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="performance-title">
        <h2 id="performance-title" className={styles.sectionTitle}>
          Recent performance
        </h2>
        <div className={styles.taskGrid}>
          {performance.map((item) => {
            const toneClass =
              item.tone === "primary" ? styles.scoreTonePrimary : styles.scoreToneSecondary;
            return (
              <article key={item.id} className={`${styles.scoreCard} ${styles.neoRaised}`}>
                <div className={`${styles.scoreBadge} ${styles.neoInset} ${toneClass}`}>{item.gradeLabel}</div>
                <div style={{ flex: 1 }}>
                  <h3 className={styles.taskTitle}>{item.subject}</h3>
                  <p className={styles.tiny}>{item.detail}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{item.score}</p>
                  <p className={styles.tiny}>{item.delta}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
