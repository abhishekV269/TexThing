import React, { useState, useEffect } from "react";
import socket from "./socket";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const msgData = {
      user: username,
      message: message,
    };

    socket.emit("send_message", msgData);

    setMessage("");
  };

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, []);

  /* ---------- JOIN SCREEN ---------- */

  if (!joined) {
    return (
      <div className="join-screen">
        <h2>Join TexThing</h2>

        <input
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button
          onClick={() => {
            if (username.trim() !== "") {
              setJoined(true);
            }
          }}
        >
          Join Chat
        </button>
      </div>
    );
  }

  /* ---------- CHAT UI ---------- */

  return (
    <div className="chat-container">
      <div className="chat-header">TexThing</div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.user === username
                ? "message my-message"
                : "message other-message"
            }
          >
            <strong>{msg.user}</strong>
            <div>{msg.message}</div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
