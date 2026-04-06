"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/mobile/mobile-ui.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { href: "/mobile", label: "Dashboard", icon: "DB" },
  { href: "/mobile/subjects", label: "Subjects", icon: "SB" },
  { href: "/mobile/schedule", label: "Calendar", icon: "CL" },
  { href: "/mobile/report", label: "Report", icon: "RP" }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} aria-label="Mobile sections">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${isActive ? `${styles.neoInset} ${styles.navLinkActive}` : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={styles.icon} aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
