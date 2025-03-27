function ChatList({ chats, onSelectChat, currentUser }) {
    return (
      <div className="chat-list">
        <h3>Conversations</h3>
        <div className="chats">
          {chats.map(chat => (
            <div 
              key={chat.id}
              className="chat-item"
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-info">
                <h4>{chat.name}</h4>
                <p className="last-message">
                  {chat.lastMessage?.text || 'No messages yet'}
                </p>
              </div>
              <span className="chat-status">
                {chat.unread > 0 && <span className="unread-count">{chat.unread}</span>}
                <span className={`chat-type ${chat.type}`}>{chat.type}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default ChatList;