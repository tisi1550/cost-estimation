import { useEffect, useRef } from "react";
import "../styles/chatHistory.css";

function ChatHistory({ chatHistory }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="chat-container" ref={containerRef}>
      {chatHistory.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          {msg.role === "user" ? (
            <>
              <pre>{JSON.stringify(msg.data, null, 2)}</pre>
              <span className="timestamp">You • {new Date().toLocaleTimeString()}</span>
            </>
          ) : (
            <>
              {msg.text}
              <span className="timestamp">Assistant • {new Date().toLocaleTimeString()}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default ChatHistory;
