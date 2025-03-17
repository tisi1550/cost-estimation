import "../styles/chatHistory.css";

function ChatHistory({ chatHistory }) {
  return (
    <div className="chat-container">
      {chatHistory.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          {msg.role === "user" ? (
            <pre>{JSON.stringify(msg.data, null, 2)}</pre>
          ) : (
            msg.text
          )}
        </div>
      ))}
    </div>
  );
}

export default ChatHistory;
