"use client";

import React, { useRef, useState, useEffect } from "react";
import * as tus from "tus-js-client";
import { supabase } from "@/app/lib/supabaseClient";
import styles from "./uploadvideo.module.css";
import { v4 as uuidv4 } from "uuid";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const UPLOAD_URL = SUPABASE_URL + "/storage/v1/upload/resumable";

const FASTAPI_URL = "http://127.0.0.1:8000";

const UploadVideo = () => {
  const [progress, setProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [subtitleFile, setSubtitleFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoInputRef = useRef(null);
  const subtitleInputRef = useRef(null);

  useEffect(() => {
    console.log("videoFile", videoFile);
    console.log("subtitleFile", subtitleFile);
  }, [videoFile, subtitleFile]);

  // 파일 선택 핸들러
  const handleVideoChange = (e) => {
    setVideoFile(e.target.files?.[0] || null);
  };

  const handleSubtitleChange = (e) => {
    setSubtitleFile(e.target.files?.[0] || null);
  };
  // 영상 업로드 + videos 테이블 저장
  const handleUploadVideo = async (videoId) => {
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession();
    // if (!session) throw new Error("로그인이 필요합니다");

    // 1. Supabase Storage에 영상 업로드
    const videoPath = `videos/${videoId}/${encodeURIComponent(videoFile.name)}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("video01")
      .upload(videoPath, videoFile, {
        cacheControl: "3600",
        upsert: true,
        contentType: videoFile.type,
      });

    if (uploadError)
      throw new Error(`영상 업로드 실패: ${uploadError.message}`);

    // 2. videos 테이블에 메타데이터 저장
    const { error: dbError } = await supabase.from("videos").insert([
      {
        id: videoId,
        title: videoFile.name.replace(/\.[^/.]+$/, ""), // 확장자 제거한 제목
        // uploader_id: session.user.id,
        storage_path: videoPath,
        file_size: videoFile.size,
        content_type: videoFile.type,
      },
    ]);

    if (dbError) throw new Error(`DB 저장 실패: ${dbError.message}`);

    return uploadData;
  };

  // 자막 파일을 FastAPI로 전송
  const handleUploadSubtitle = async (videoId) => {
    const formData = new FormData();
    formData.append("subtitle_file", subtitleFile);
    formData.append("video_id", videoId);

    const response = await fetch(`${FASTAPI_URL}/upload-subtitle`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `자막 처리 실패: ${errorData.detail || response.statusText}`
      );
    }

    return await response.json();
  };

  // 전체 업로드 처리
  const handleUpload = async () => {
    // if (!videoFile || !subtitleFile) {
    //   alert("영상과 자막 파일을 모두 선택해주세요");
    //   return;
    // }
    // if (!videoFile) {
    //   alert("영상 파일을 첨부해주세요");
    //   return;
    // }
    if (!subtitleFile) {
      alert("영상 파일을 첨부해주세요");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // 1. 고유 video_id 생성
      const videoId = uuidv4();

      // 2. 영상 업로드 (Supabase Storage + videos 테이블)
      setProgress(20);
      await handleUploadSubtitle(videoId); //백엔드 구축 후 실행
      setProgress(60);

      // 3. 자막 처리 (FastAPI로 전송)
      setProgress(80);
        await handleUploadVideo(videoId); // 비디오 업로드
      setProgress(100);

      alert("업로드 및 처리 완료!");

      // 파일 선택 초기화
      setVideoFile(null);
      setSubtitleFile(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (subtitleInputRef.current) subtitleInputRef.current.value = "";
    } catch (error) {
      console.error("업로드 에러:", error);
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.fileLabel} tabIndex={0}>
        영상 파일 선택
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          className={styles.fileInput}
          onChange={handleVideoChange}
          disabled={isUploading}
        />
      </label>
      {videoFile && (
        <div className={styles.selectedFile}>
          {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)}MB)
        </div>
      )}

      <label className={styles.fileLabel} tabIndex={0}>
        자막 파일 선택 (.srt)
        <input
          type="file"
          accept=".srt,.vtt,.txt"
          ref={subtitleInputRef}
          className={styles.fileInput}
          onChange={handleSubtitleChange}
          disabled={isUploading}
        />
      </label>
      {subtitleFile && (
        <div className={styles.selectedFile}>
          {subtitleFile.name} ({(subtitleFile.size / 1024).toFixed(2)}KB)
        </div>
      )}

      {/* <button
        onClick={handleUpload}
        className={styles.button}
        disabled={!videoFile || !subtitleFile || isUploading}
        style={{
          opacity: videoFile && subtitleFile && !isUploading ? 1 : 0.5,
          cursor:
            videoFile && subtitleFile && !isUploading
              ? "pointer"
              : "not-allowed",
        }}
      >
        {isUploading ? "업로드 중..." : "업로드"}
      </button> */}
      <button
        onClick={handleUpload}
        className={styles.button}
        style={{
          opacity: videoFile && subtitleFile && !isUploading ? 1 : 0.5,
          cursor: "pointer",
        }}
      >
        {isUploading ? "업로드 중..." : "업로드"}
      </button>

      {isUploading && (
        <div className={styles.progress}>진행률: {progress}%</div>
      )}
    </div>
  );
};

export default UploadVideo;
