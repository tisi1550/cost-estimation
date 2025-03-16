import { useState } from "react";
import "./App.css";
import ConfigForm from "./components/ConfigForm";
import ChatArea from "./components/ChatArea";

function App() {
  const [chatHistory, setChatHistory] = useState([]);

  return (
    <div className="App">
      <ConfigForm setChatHistory={setChatHistory} chatHistory={chatHistory} />
      <ChatArea chatHistory={chatHistory} />
    </div>
  );
}

export default App;