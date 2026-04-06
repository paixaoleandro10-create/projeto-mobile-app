"use client";

import { useDeferredValue, useState } from "react";
import styles from "@/components/mobile/mobile-ui.module.css";
import type { SubjectCard } from "@/lib/mobile-data";

type SubjectsBrowserProps = {
  subjects: SubjectCard[];
};

export function SubjectsBrowser({ subjects }: SubjectsBrowserProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredSubjects = subjects.filter((item) => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) {
      return true;
    }
    return `${item.subject} ${item.teacher}`.toLowerCase().includes(needle);
  });

  return (
    <>
      <section className={styles.searchRow} aria-label="Subject filters">
        <label className={`${styles.searchWrap} ${styles.neoInset}`}>
          <span className={styles.icon} aria-hidden="true">
            SR
          </span>
          <input
            className={styles.input}
            type="search"
            value={query}
            placeholder="Search subjects"
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search subjects by name or teacher"
          />
        </label>
        <button type="button" className={`${styles.button} ${styles.neoRaised} ${styles.chipButton}`}>
          Semester 1
        </button>
      </section>

      <section className={styles.section} aria-labelledby="subjects-grid-title">
        <h2 id="subjects-grid-title" className="visually-hidden">
          Subjects grid
        </h2>
        <div className={styles.subjectGrid}>
          {filteredSubjects.map((item) => {
            const accentClass =
              item.accent === "primary" ? styles.subjectAccentPrimary : styles.subjectAccentTertiary;
            return (
              <article key={item.id} className={`${styles.subjectCard} ${styles.neoRaised}`}>
                <div className={styles.rowTop}>
                  <div>
                    <h3 className={styles.subjectTitle}>{item.subject}</h3>
                    <p className={styles.tiny}>{item.teacher}</p>
                  </div>
                  <span className={`${styles.pill} ${styles.neoRaised} ${accentClass}`}>{item.grade}</span>
                </div>

                <div>
                  <p className={styles.tiny}>Average grade</p>
                  <p className={styles.sectionTitle} style={{ marginBottom: "0.4rem" }}>
                    {item.average}%
                  </p>
                  <div className={styles.bar} aria-label={`Average ${item.average} percent`}>
                    <span style={{ width: `${item.average}%` }} className={accentClass} />
                  </div>
                </div>

                <div className={styles.rowTop}>
                  <p className={styles.tiny}>Students +{item.students}</p>
                  <button type="button" className={`${styles.button} ${styles.linkButton} ${styles.neoInset}`}>
                    Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
