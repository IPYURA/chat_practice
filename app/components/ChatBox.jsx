'use client';

import { useState } from 'react';
import styles from './ChatWindow.module.css';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleAIMessage(prompt) {
    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.devaidsoft.net/webhook/553f7db5-efd7-4b48-b39d-0b2c05f692ba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
      }
  
      // n8n 응답이 JSON인지 텍스트인지 확인
      const contentType = response.headers.get('content-type');
      const isJSON = contentType?.includes('application/json');
  
      const data = isJSON ? await response.json() : await response.text();
      console.log('AI 응답:', data);
  
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: isJSON ? data.result : data // 구조에 맞게 처리
      }]);
  
    } catch (error) {
      console.error('에러 상세:', error); // 상세 에러 로깅
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `⚠️ 오류: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }
  
  

  async function handleSend() {
    var userInput = input.trim();
    if (!userInput) return;
    setMessages(function (prev) {
      return prev.concat({
        sender: 'user',
        text: userInput,
      });
    });
    setInput('');
    await handleAIMessage(userInput);
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMessages}>
        {messages.map(function (msg, idx) {
          return (
            <div
              key={idx}
              className={
                styles.messageRow +
                ' ' +
                (msg.sender === 'user' ? styles.user : styles.ai)
              }
            >
              <div className={styles.messageBubble}>{msg.text}</div>
            </div>
          );
        })}
        {isLoading && (
          <div className={styles.messageRow + ' ' + styles.ai}>
            <div className={styles.messageBubble}>✍️ 답변을 생성 중입니다...</div>
          </div>
        )}
      </div>

      <div className={styles.chatInputArea}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder={isLoading ? '응답을 기다리는 중...' : '메시지를 입력하세요...'}
          value={input}
          onChange={function (e) { setInput(e.target.value); }}
          onKeyDown={function (e) { if (e.key === 'Enter' && !isLoading) handleSend(); }}
          disabled={isLoading}
        />
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? '전송 중...' : '보내기'}
        </button>
      </div>
    </div>
  );
}
