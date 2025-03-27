// src/components/common/ChatDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getChatsForUser } from '../../services/mockDataService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

function ChatDashboard() {
  const { currentUser } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userChats = await getChatsForUser(currentUser.id);
        setChats(userChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchChats();

      // Listen for real-time updates to chats
      const chatsRef = collection(db, 'chats');
      const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
        const updatedChats = await getChatsForUser(currentUser.id);
        setChats(updatedChats);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-dashboard">
      <div className="chat-container">
        <ChatList
          chats={chats}
          onSelectChat={setSelectedChat}
          currentUser={currentUser}
        />
        {selectedChat ? (
          <ChatWindow selectedChat={selectedChat} currentUser={currentUser} />
        ) : (
          <div className="chat-placeholder">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
}

export default ChatDashboard;