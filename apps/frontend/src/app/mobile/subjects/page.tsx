import { MobileShell } from "@/components/mobile/mobile-shell";
import styles from "@/components/mobile/mobile-ui.module.css";
import { SubjectsBrowser } from "@/components/mobile/subjects-browser";
import { getMobileSubjects } from "@/lib/mobile-api";

export default async function MobileSubjectsPage() {
  const subjectsResult = await getMobileSubjects();

  return (
    <MobileShell pageTitle="Subjects" pageSubtitle="Search and browse current classes">
      <SubjectsBrowser subjects={subjectsResult.data.subjects} />
      {subjectsResult.source === "fallback" ? (
        <section className={styles.section}>
          <p className={styles.hint}>
            API unavailable ({subjectsResult.error ?? "unknown"}). Showing fallback subjects.
          </p>
        </section>
      ) : null}
    </MobileShell>
  );
}
