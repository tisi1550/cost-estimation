import "../styles/ChatArea.css";
import MessageBubble from "./MessageBubble";

export default function ChatArea({ chatHistory }) {
  return (
    <div className="chat-container">
      {chatHistory.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
    </div>
  );
}
