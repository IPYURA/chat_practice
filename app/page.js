import styles from "./page.module.css";
import ChatBox from "./components/ChatBox";

export default function Home() {
  return (
    <div className={styles.page}>
      <ChatBox/>
    </div>
  );
}
