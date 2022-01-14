import styles from "./styles.module.css";

export default function Index() {
  return (
    <div>
      <svg
        className={styles.checkmark}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
      >
        <circle
          className={styles.checkmarkCircle}
          cx="26"
          cy="26"
          r="25"
          fill="none"
        />
        <path
          className={styles.checkmarkCheck}
          fill="none"
          d="M16 16 36 36 M36 16 16 36"
        />
      </svg>
    </div>
  );
}