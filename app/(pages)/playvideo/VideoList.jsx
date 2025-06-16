"use client";

import styles from "./playvideo.module.css";

function formatDate(isoString) {
  if (!isoString) return "";
  return isoString.split(".")[0].replace("T", " ");
}

const VideoList = ({ videoList, onClickTitle, currentVideoUrl }) => {
  return (
    <ul className={styles.videoList}>
      {videoList.map((video) => (
        <li
          key={video.id}
          className={`${styles.listItem} ${
            currentVideoUrl && currentVideoUrl.includes(video.storage_path)
              ? styles.active
              : ""
          }`}
        >
          <div className={styles.itemContent}>
            <button
              type="button"
              onClick={() => onClickTitle(video.storage_path)}
              className={styles.titleButton}
            >
              {video.title}
            </button>
            <span className={styles.timestamp}>
              {formatDate(video.created_at)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default VideoList;
