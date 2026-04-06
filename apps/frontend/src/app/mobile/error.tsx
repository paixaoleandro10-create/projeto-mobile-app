"use client";

import styles from "@/components/mobile/mobile-ui.module.css";

type MobileErrorProps = {
  error: Error;
  reset: () => void;
};

export default function MobileError({ error, reset }: MobileErrorProps) {
  return (
    <main id="main-content" className={styles.mobileRoot}>
      <section className={styles.container}>
        <article className={`${styles.heroCard} ${styles.neoRaised}`}>
          <p className={styles.sectionTitle}>Could not load mobile data</p>
          <p className={styles.subtitle}>{error.message}</p>
          <button
            type="button"
            className={`${styles.button} ${styles.neoRaised} ${styles.chipButton}`}
            onClick={reset}
          >
            Try again
          </button>
        </article>
      </section>
    </main>
  );
}
