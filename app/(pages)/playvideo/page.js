"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./playvideo.module.css";
import { supabase } from "@/app/lib/supabaseClient";
import VideoList from "./VideoList";

const PlayVideo = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getVideoList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: getListError } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (getListError) throw getListError;
      setVideoList(data || []);
    } catch (err) {
      setError(err.message || "비디오 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onClickTitle = useCallback(async (storage_path) => {
    setError(null);
    try {
      const { data, error: storageError } = await supabase.storage
        .from("video01")
        .createSignedUrl(storage_path, 60 * 60);

      if (storageError) throw storageError;
      if (!data?.signedUrl) throw new Error("Signed URL 생성 실패");
      setVideoUrl(data.signedUrl);
    } catch (err) {
      setError(err.message || "비디오를 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    getVideoList();
  }, [getVideoList]);

  return (
    <div className={styles.container}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.playerSection}>
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            className={styles.videoPlayer}
            onError={() => setError("비디오 재생에 실패했습니다.")}
          />
        ) : (
          <div className={styles.placeholder}>
            {loading ? "Loading..." : "비디오를 선택하세요"}
          </div>
        )}
      </div>

      <div className={styles.listSection}>
        {loading ? (
          <div className={styles.loading}>비디오 목록을 불러오는 중...</div>
        ) : (
          <VideoList
            videoList={videoList}
            onClickTitle={onClickTitle}
            currentVideoUrl={videoUrl}
          />
        )}
      </div>
    </div>
  );
};

export default PlayVideo;
