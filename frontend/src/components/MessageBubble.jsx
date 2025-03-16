import "../styles/MessageBubble.css";

export default function MessageBubble({ message }) {
  return (
    <div className={`message ${message.role}`}>
      {message.role === "user" ? (
        <>
          <strong>Submitted Data:</strong>
          <pre>{JSON.stringify(message.data, null, 2)}</pre>
        </>
      ) : (
        message.text
      )}
    </div>
  );
}
