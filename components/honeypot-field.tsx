import styles from "./honeypot-field.module.css";

export function HoneypotField() {
  return <label className={styles.honeypot} aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>;
}
