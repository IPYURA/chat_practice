"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./playvideo.module.css";
import { supabase } from "@/app/lib/supabaseClient";
import VideoList from "./VideoList";

const FASTAPI_URL = "http://34.47.116.47:9000";

const PlayVideo = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [clickedVideoID, setClickedVideoID] = useState(null);
  const [clickedVideoTitle, setClickedVideoTitle] = useState("");
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 채팅 관련 상태
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef(null);

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

  //비디오 제목 클릭
  const onClickTitle = useCallback(async (storage_path) => {
    setError(null);
    try {
      const { data, error: storageError } = await supabase.storage
        .from("video01")
        .createSignedUrl(storage_path, 60 * 60);

      const { data: videoInfo, error: videoInfoError } = await supabase
        .from("videos")
        .select("*")
        .eq("storage_path", storage_path)
        .single();

      if (storageError) throw storageError;
      if (videoInfoError) throw videoInfoError;

      if (!data?.signedUrl) throw new Error("Signed URL 생성 실패");
      setVideoUrl(data.signedUrl);
      setClickedVideoID(videoInfo.id);
      setClickedVideoTitle(videoInfo.title);
    } catch (err) {
      setError(err.message || "비디오를 불러오지 못했습니다.");
    }
  }, []);

  // 채팅 메시지 전송 핸들러 (백엔드 연동)
  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || !clickedVideoID) {
      if (!clickedVideoID) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "비디오를 먼저 선택해주세요.",
            sender: "bot",
          },
        ]);
      }
      return;
    }

    // 사용자 메시지 추가
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      // 로딩 메시지 추가
      const loadingMessage = {
        id: messages.length + 2,
        text: "답변을 생성 중입니다...",
        sender: "bot",
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // 백엔드 API 호출
      const response = await fetch(`${FASTAPI_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputValue,
          video_id: clickedVideoID,
        }),
      });

      if (!response.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await response.json();
      console.log("response: ", data);
      // 기존 로딩 메시지 제거
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));

      // 실제 응답 메시지 추가
      const botMessage = {
        id: messages.length + 3,
        text: data.response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // 기존 로딩 메시지 제거
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));

      // 에러 메시지 추가
      const errorMessage = {
        id: messages.length + 3,
        text: `오류 발생: ${error.message || "서버 연결 실패"}`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // 엔터 키로 메시지 전송
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // 채팅창 스크롤을 항상 아래로 유지
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    getVideoList();
  }, [getVideoList]);

  //   useEffect(() => {
  //     console.log(clickedVideoID);
  //   }, [clickedVideoID]);

  //   useEffect(() => {
  //     console.log(clickedVideoTitle);
  //   }, [clickedVideoTitle]);

  return (
    <div className={styles.container}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.mainContainer}>
        {/* 비디오 및 목록 섹션 */}
        <div className={styles.videoSection}>
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

        {/* 채팅 섹션 */}
        <div className={styles.chatSection}>
          <div className={styles.chatBox}>
            <div className={styles.chatHeader}>
              <h3>비디오 챗봇</h3>
              <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
              {clickedVideoTitle ? (
                <span>{clickedVideoTitle}</span>
              ) : (
                <span>비디오를 선택하세요...</span>
              )}
            </div>

            <div
              className={styles.messagesContainer}
              ref={messagesContainerRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.sender === "user"
                      ? styles.userMessage
                      : styles.botMessage
                  }`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>{message.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className={styles.chatInput}
              />
              <button onClick={handleSendMessage} className={styles.sendButton}>
                전송
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayVideo;
