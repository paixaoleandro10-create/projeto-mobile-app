import styles from "@/components/mobile/mobile-ui.module.css";
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav";
import type { ReactNode } from "react";

type MobileShellProps = {
  children: ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
};

export function MobileShell({ children, pageTitle, pageSubtitle }: MobileShellProps) {
  return (
    <div className={styles.mobileRoot}>
      <header className={`${styles.topBar} ${styles.neoRaised}`}>
        <div className={styles.brand}>
          <img
            className={`${styles.avatar} ${styles.neoRaised}`}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC28A9XDErKFMqE8l9Tl4VFZKYJkY5_rk9GfoZK4GoOgwWh4P7rM0Y6r856Crw-9nlxJwygCOVWl-_zuWqAzmukH87gBesZD5po_-YqzNzDaiazN1nE1urhroIYRxfCUzykii_pvxlf9L9scRE1alUGaccSpUmcowJhDA5VtlfW0I9L0Nf4d_OtXEkthS7WNadq3qsvZA-JCfelFvbElqG62RpTkaZWkLYPXlB_Fax2XRb03H1ZMyGqpI2NyQCMiQC6GRfwcW1Eqw"
            alt="Student profile"
          />
          <p className={styles.brandTitle}>Academic Pro</p>
        </div>

        <button
          type="button"
          className={`${styles.button} ${styles.neoRaised}`}
          aria-label="Open notifications"
        >
          <span className={styles.icon} aria-hidden="true">
            NT
          </span>
        </button>
      </header>

      <main id="main-content" className={styles.container}>
        <section className={styles.content}>
          <h1 className={styles.sectionTitle}>{pageTitle}</h1>
          {pageSubtitle ? <p className={styles.subtitle}>{pageSubtitle}</p> : null}
        </section>
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
