import styles from "@/components/mobile/mobile-ui.module.css";

export default function MobileLoading() {
  return (
    <main id="main-content" className={styles.mobileRoot}>
      <section className={styles.container}>
        <article className={`${styles.heroCard} ${styles.neoRaised}`}>
          <p className={styles.sectionTitle}>Loading mobile data...</p>
          <p className={styles.subtitle}>Please wait while we fetch the latest backend payload.</p>
        </article>
      </section>
    </main>
  );
}
