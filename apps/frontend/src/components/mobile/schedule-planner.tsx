"use client";

import { useState } from "react";
import styles from "@/components/mobile/mobile-ui.module.css";
import type { ScheduleEvent } from "@/lib/mobile-data";

type SchedulePlannerProps = {
  events: ScheduleEvent[];
  monthLabel: string;
  defaultDay: number;
};

const days = Array.from({ length: 31 }, (_, index) => index);
const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SchedulePlanner({ events, monthLabel, defaultDay }: SchedulePlannerProps) {
  const [selectedDay, setSelectedDay] = useState<number>(defaultDay);

  const visibleEvents = events.filter((item) => item.day === selectedDay);

  return (
    <>
      <section className={`${styles.section} ${styles.calendar} ${styles.neoRaised}`} aria-label="Calendar">
        <div className={styles.calendarHeader}>
          <p className={styles.subtitle}>{monthLabel}</p>
          <div>
            <button type="button" className={`${styles.button} ${styles.neoRaised}`} aria-label="Previous month">
              {"<"}
            </button>
            <button type="button" className={`${styles.button} ${styles.neoRaised}`} aria-label="Next month">
              {">"}
            </button>
          </div>
        </div>

        <div className={styles.calendarGrid}>
          {labels.map((label) => (
            <p key={label} className={styles.dow}>
              {label}
            </p>
          ))}
          {days.map((item) => {
            const dayNumber = item + 1;
            const isActive = dayNumber === selectedDay;
            return (
              <button
                key={dayNumber}
                type="button"
                className={`${styles.dayButton} ${styles.neoRaised} ${isActive ? styles.dayButtonActive : ""}`}
                onClick={() => setSelectedDay(dayNumber)}
                aria-pressed={isActive}
                aria-label={`Select day ${dayNumber}`}
              >
                {dayNumber}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="events-title">
        <h2 id="events-title" className={styles.sectionTitle}>
          Events for day {selectedDay}
        </h2>
        <div className={styles.taskGrid}>
          {visibleEvents.length === 0 ? (
            <article className={`${styles.eventCard} ${styles.neoRaised}`}>
              <p className={styles.subtitle}>No events for this day yet.</p>
            </article>
          ) : (
            visibleEvents.map((event) => (
              <article key={event.id} className={`${styles.eventCard} ${styles.neoRaised}`}>
                <div className={`${styles.eventTime} ${styles.neoInset}`}>
                  <strong>{event.time}</strong>
                  <p className={styles.tiny}>{event.meridiem}</p>
                </div>
                <div>
                  <div className={styles.eventHeader}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    {event.priority === "high" ? (
                      <span className={`${styles.pill} ${styles.pillDanger}`}>Priority</span>
                    ) : null}
                  </div>
                  <div className={styles.eventMeta}>
                    <span className={`${styles.metaPill} ${styles.neoInset}`}>{event.place}</span>
                    <span className={`${styles.metaPill} ${event.detail === "Optional" ? styles.metaDanger : ""}`}>
                      {event.detail}
                    </span>
                  </div>
                </div>
                <button type="button" className={`${styles.button} ${styles.neoInset}`} aria-label="Open event menu">
                  ...
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
