import styles from './common.module.css';

const Loading = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.spinner}></div>
    <span className={styles.text}>Loading...</span>
  </div>
);

export default Loading;
