// src/components/common/ChatWindow.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sendMessage } from '../../services/mockDataService';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import MessageBubble from './MessageBubble';

function ChatWindow({ selectedChat, currentUser }) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    // Set initial messages
    setMessages(selectedChat?.messages || []);

    // Listen for real-time updates to messages
    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(updatedMessages);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      text: newMessage,
      sender: currentUser.id,
      timestamp: new Date().toISOString(),
    };

    try {
      await sendMessage(selectedChat.id, newMsg);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleProfileClick = () => {
    if (selectedChat?.type === 'private' && userRole === 'mentor') {
      const menteeId = selectedChat.participants.find((id) => id !== currentUser.id);
      if (menteeId) {
        navigate(`/mentor/mentee/${menteeId}`);
      }
    }
  };

  return (
    <div className="chat-window">
      <div
        className="chat-header"
        onClick={handleProfileClick}
        style={{
          cursor:
            selectedChat?.type === 'private' && userRole === 'mentor'
              ? 'pointer'
              : 'default',
        }}
      >
        <h3>{selectedChat?.name}</h3>
        <span className="chat-type">{selectedChat?.type}</span>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.sender === currentUser.id}
          />
        ))}
      </div>

      <div className="message-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;