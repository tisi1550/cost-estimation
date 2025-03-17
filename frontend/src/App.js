import { useState } from "react";
import FormSection from "./components/FormSection";
import ChatHistory from "./components/ChatHistory";
import "./App.css";

function App() {
  const [chatHistory, setChatHistory] = useState([]);

  return (
    <div className="App">
      <FormSection setChatHistory={setChatHistory} />
      <ChatHistory chatHistory={chatHistory} />
    </div>
  );
}

export default App;
