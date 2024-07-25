import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MessageContent.css'; // CSS 파일을 import

const MyContentsContent = ({ userName }) => {
  const [following, setFollowing] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await axios.get('https://192.168.6.45:3001/profiles', { withCredentials: true });
        const currentUser = response.data.find(user => user.username === userName);
        if (currentUser && Array.isArray(currentUser.following)) {
          const followingList = currentUser.following;
          setFollowing(followingList);

          // 사용자 ID와 이름을 매핑
          const userMap = {};
          for (let userId of followingList) {
            const userResponse = await axios.get(`https://192.168.6.45:3001/user/${userId}`, { withCredentials: true });
            userMap[userId] = userResponse.data.username;
          }
          setUserMap(userMap);
        } else {
          setFollowing([]);
        }
      } catch (error) {
        console.error('팔로잉 리스트를 가져오는 중 오류 발생:', error);
      }
    };

    fetchFollowing();
  }, [userName]);

  const fetchChatMessages = async (recipientId) => {
    try {
      const response = await axios.get(`https://192.168.6.45:3001/chat/${recipientId}`, { withCredentials: true });
      setChatMessages(response.data);
    } catch (error) {
      console.error('채팅 메시지를 가져오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (selectedUser) {
      interval = setInterval(() => fetchChatMessages(selectedUser), 3000);
    }
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleUserClick = async (userId) => {
    setSelectedUser(userId);
    fetchChatMessages(userId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      await axios.post('https://192.168.6.45:3001/chat', {
        content: newMessage,
        recipientId: selectedUser
      }, { withCredentials: true });

      setChatMessages([...chatMessages, { content: newMessage, sender: userName, recipient: userMap[selectedUser], is_read: false, date: new Date().toISOString() }]);
      setNewMessage('');

      // 상대방에게 알림 전송
      await axios.post('https://192.168.6.45:3001/notify', {
        recipientId: selectedUser,
        message: `${userName}님이 새 메시지를 보냈습니다.`, // 알림 메시지 수정
        type: 'message' // 알림 타입 추가
      }, { withCredentials: true });

    } catch (error) {
      console.error('메시지 전송 중 오류 발생:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.post('https://192.168.6.45:3001/chat/read', { messageId }, { withCredentials: true });
    } catch (error) {
      console.error('메시지를 읽음으로 표시하는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    chatMessages.forEach(msg => {
      if (msg.sender !== userName && !msg.is_read) {
        markAsRead(msg.id);
      }
    });
  }, [chatMessages, userName]);

  return (
    <div className="chat-container">
      <h1>메세지</h1>
      <div className="following-section">
        <h2 className="following-header">팔로잉</h2>
        <ul className="following-list">
          {following.map(userId => (
            <li key={userId} className="user-item">
              <button className="user-button" onClick={() => handleUserClick(userId)}>
                {userMap[userId] || '나'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selectedUser && (
        <div className="chat-section">
          <h2 className="chat-header">채팅 with {userMap[selectedUser] || '나'}</h2>
          <div className="chat-window">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.sender === userName ? 'sent' : 'received'}`}>
                <p>({msg.sender === userName ? '나' : userMap[msg.sender] || '나'}) {msg.content}</p>
                <span className="chat-time">{new Date(msg.date).toLocaleString()} {msg.is_read ? '✔️' : '✖️'}</span>
              </div>
            ))}
          </div>
          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
            />
            <button className="send-button" onClick={handleSendMessage}>전송</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyContentsContent;
