function MessageBubble({ message, isCurrentUser }) {
    return (
      <div className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}>
        <div className="message-content">
          <p>{message.text}</p>
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  }
  
  export default MessageBubble;