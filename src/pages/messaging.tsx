// src/pages/messaging.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Messaging: React.FC = () => {
  const { person } = useParams();
  const { user } = useAuth0();

  const currentUser = user?.nickname || "you";

  const initialConversations = [
    {
      person: "jane",
      messages: [
        { from: "jane", text: "Hi! Can I help you?" },
        { from: "you", text: "I'm interested in a portrait commission." },
      ],
    },
    {
      person: "john",
      messages: [
        { from: "john", text: "Audio delivery completed!" },
        { from: "you", text: "Thanks, I’ll check it out!" },
      ],
    },
  ];

  const [conversations, setConversations] = useState(initialConversations);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(person || null);
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    const conv = conversations.find((c) => c.person === selectedPerson);
    if (conv) {
      setMessages(conv.messages);
    } else {
      setMessages([]);
    }
  }, [selectedPerson]);

  const handlePersonClick = (p: string) => {
    setSelectedPerson(p);
  };

  const handleSend = () => {
    if (!newMsg.trim() || !selectedPerson) return;

    const newMessage = { from: currentUser, text: newMsg.trim() };
    let updatedConversations = [...conversations];
    const index = updatedConversations.findIndex((c) => c.person === selectedPerson);

    if (index >= 0) {
      updatedConversations[index].messages.push(newMessage);
    } else {
      updatedConversations.push({ person: selectedPerson, messages: [newMessage] });
    }

    setConversations(updatedConversations);
    setMessages((prev) => [...prev, newMessage]);
    setNewMsg("");
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #ccc",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h5>Inbox</h5>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {conversations.map((conv) => (
            <li
              key={conv.person}
              onClick={() => handlePersonClick(conv.person)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background:
                  selectedPerson === conv.person ? "#f0f0f0" : "transparent",
              }}
            >
              {conv.person}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, padding: "15px", display: "flex", flexDirection: "column" }}>
        {selectedPerson ? (
          <>
            <h5>Chat with {selectedPerson}</h5>
            <div
              style={{
                flexGrow: 1,
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "10px",
                marginBottom: "10px",
                overflowY: "auto",
              }}
            >
              {messages.map((m, idx) => (
                <div key={idx} style={{ textAlign: m.from === currentUser ? "right" : "left" }}>
                  <p
                    style={{
                      display: "inline-block",
                      backgroundColor: m.from === currentUser ? "#d1e7dd" : "#e2e3e5",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      margin: "5px 0",
                    }}
                  >
                    <strong>{m.from === currentUser ? "You" : m.from}</strong>: {m.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message..."
              />
              <button className="btn btn-success" onClick={handleSend}>
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a conversation to start messaging.</p>
        )}
      </div>
    </div>
  );
};

export default Messaging;
