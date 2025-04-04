// src/pages/Messaging.tsx
import React, { useState } from "react";

const Messaging: React.FC = () => {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]); // Placeholder for messages

  // Placeholder data - replace with actual data fetching
  const conversations = [
    { person: "person1", messages: ["Hello!", "How are you?"] },
    { person: "person2", messages: ["Hi there!", "What's up?"] },
    // Add more conversations
  ];

  const handlePersonClick = (person: string) => {
    setSelectedPerson(person);
    const conversation = conversations.find((c) => c.person === person);
    if (conversation) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <h2>Conversations</h2>
        <ul style={{ listStyle: "none" }}>
          {conversations.map((conversation) => (
            <li
              key={conversation.person}
              style={{
                cursor: "pointer",
                padding: "5px",
                background:
                  selectedPerson === conversation.person
                    ? "#f0f0f0"
                    : "transparent",
              }}
              onClick={() => handlePersonClick(conversation.person)}
            >
              {conversation.person}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, padding: "10px" }}>
        {selectedPerson ? (
          <div>
            <h2>Messages with {selectedPerson}</h2>
            <div
              style={{
                height: "300px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              {messages.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
            {/* Add input for sending messages here */}
          </div>
        ) : (
          <p style={{ marginTop: "15px" }}>
            Select a conversation to view messages.
          </p>
        )}
      </div>
    </div>
  );
};

export default Messaging;
