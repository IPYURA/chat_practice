"use client";

import { usePathname } from "next/navigation";
import styles from "./common.module.css";
import Link from "next/link";

const navigationList = ["/uploadvideo", "/playvideo", "/graph"];

const Gnb = () => {
  const pathname = usePathname();
  return (
    <nav className={styles.gnb}>
      <Link
        href="/"
        className={`${styles.path} ${pathname === "/" && styles.active}`}
      >
        HOME
      </Link>
      {navigationList.map((path) => (
        <Link
          href={path}
          key={path}
          className={`${styles.path} ${pathname === path && styles.active}`}
        >
          {path.replace("/", "").toUpperCase()}
        </Link>
      ))}
    </nav>
  );
};
export default Gnb;
