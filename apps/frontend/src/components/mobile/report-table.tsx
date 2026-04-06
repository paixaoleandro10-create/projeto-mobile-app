import styles from "@/components/mobile/mobile-ui.module.css";
import type { ReportLine } from "@/lib/mobile-data";

type ReportTableProps = {
  lines: ReportLine[];
};

function statusClass(status: ReportLine["status"]) {
  if (status === "Approved") {
    return styles.statusApproved;
  }
  if (status === "In Progress") {
    return styles.statusProgress;
  }
  return styles.statusExam;
}

export function ReportTable({ lines }: ReportTableProps) {
  return (
    <section className={styles.section} aria-labelledby="report-table-title">
      <h2 id="report-table-title" className="visually-hidden">
        Report table
      </h2>
      <div className={`${styles.tableWrap} ${styles.neoRaised}`}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th>Subject</th>
              <th className={styles.right}>Term 1</th>
              <th className={styles.right}>Term 2</th>
              <th className={styles.right}>Term 3</th>
              <th className={styles.right}>Term 4</th>
              <th className={styles.right}>Avg</th>
              <th className={styles.right}>Status</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>{line.subject}</td>
                {line.terms.map((term, index) => (
                  <td key={`${line.id}-${index}`} className={styles.right}>
                    <span className={`${styles.metaPill} ${styles.neoInset}`}>{term}</span>
                  </td>
                ))}
                <td className={styles.right}>
                  <strong>{line.average}</strong>
                </td>
                <td className={`${styles.right} ${statusClass(line.status)}`}>{line.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
