import { useState } from "react";
import FormSection from "./components/FormSection";
import ChatHistory from "./components/ChatHistory";
import "./App.css";

function App() {
  const [chatHistory, setChatHistory] = useState([]);

  return (
    <div className="App">
      <header>AI Training Cost & Time Estimator</header>
      <div className="main-content">
        <FormSection setChatHistory={setChatHistory} />
        <ChatHistory chatHistory={chatHistory} />
      </div>
    </div>
  );
}

export default App;
