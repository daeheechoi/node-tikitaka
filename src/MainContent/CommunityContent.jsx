import React, { useState, useEffect } from 'react';
import './CommunityContent.css'; // CSS 파일을 import

const CommunityContent = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(''); // 현재 로그인한 사용자명 또는 아이디
  const [error, setError] = useState(''); // 에러 상태 추가

  useEffect(() => {
    fetchMessages();
    checkAuth(); // 로그인 상태 확인
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('메시지를 가져오는 데 실패했습니다.'); // 사용자에게 에러 메시지 표시
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/authcheck');
      if (!response.ok) {
        throw new Error('Failed to check authentication');
      }
      const data = await response.json();
      if (data.isLogin === "True") {
        setUser(data.name);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message, author: user }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      fetchMessages(); // Refresh the message list after sending a new message
      setMessage(''); // Clear the message input
    } catch (error) {
      console.error('Error sending message:', error);
      setError('메시지 전송에 실패했습니다.'); // 사용자에게 에러 메시지 표시
    }
  };

  return (
    <div className="cm-container">
      <h1 className="cm-header">커뮤니티</h1>
      <p className="cm-subheader">짧은 한마디를 남겨보세요.</p>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="내용을 입력하세요."
          required
          rows="4"
          className="textarea"
        />
        <button type="submit" className="submit-button">확인</button>
      </form>
      <ul className="message-list">
        {messages.map((msg) => (
          <li key={msg.id} className="message-item">
            <div>
              <span>{msg.content}</span>
            </div>
            <span className="username">by {msg.author}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityContent;
