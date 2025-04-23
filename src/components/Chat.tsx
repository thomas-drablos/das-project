import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { getJson, postJson } from "../util";
import { getOtherName } from "../pages/messaging";
import DOMPurify from "dompurify"; // Import DOMPurify

const Chat = () => {
  const { id } = useParams();
  const { loading, userId } = useAppUser();
  const { apiToken } = useApiToken();
  const [userInfo, setUserInfo] = useState<any>();
  const [conversation, setConversation] = useState<any>();
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]); // Initialize as empty array
  const [newMsg, setNewMsg] = useState("");

  const bottomChat = useRef<HTMLDivElement | null>(null);

  // getting user information
  useEffect(() => {
    setSelectedPerson(null);
    bottomChat.current?.scrollIntoView({ behavior: "instant" });

    if (userId == undefined || userId == null) return
    getJson(`http://localhost:8000/api/user/${userId}`, apiToken)
      .then(setUserInfo)
      .catch((error) => {
        console.error("Error fetching user info:", error);
        // Optionally handle other errors here
      });

    if (id == undefined) return;
    getJson(`http://localhost:8000/api/chat/${id}/messages`, apiToken)
      .then((result) => {
        setMessages(result);
      })
      .catch((error) => {
        console.error(`Error fetching messages for chat ${id}:`, error);
        // Removed 403 handling here
      });
  }, [loading, id, apiToken]);

  // getting conversation information
  useEffect(() => {
    if (id == undefined || !userInfo) return;
    getJson(`http://localhost:8000/api/chat/${id}`, apiToken)
      .then((convo) => {
        setSelectedPerson(getOtherName(userInfo, convo));
        setConversation(convo);
      })
      .catch((error) => {
        console.error(`Error fetching conversation ${id}:`, error);
        // Optionally handle errors here
      });
  }, [userInfo, id, apiToken]);

  // auto scroll when new message
  useEffect(() => {
    bottomChat.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMsg.trim() === "" || !selectedPerson || !id || !apiToken) return;

    postJson(
      `http://localhost:8000/api/chat/${id}/messages`,
      { text: newMsg },
      apiToken
    )
      .then((result) => {
        const updatedMessages = [...messages, result];
        setMessages(updatedMessages);
        setConversation({ ...conversation, messages: updatedMessages });
        setNewMsg("");
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        // Optionally handle errors like network issues or backend validation failures
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: "15px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {userInfo && id ? (
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
            {messages?.map((m: any, idx: number) => (
              <div
                key={idx}
                style={{
                  textAlign:
                    m.vendor === userInfo.vendorId ||
                    m.vendor !== conversation?.user?._id
                      ? "right"
                      : "left",
                }}
              >
                <p
                  style={{
                    display: "inline-block",
                    backgroundColor:
                      m.vendor === userInfo.vendorId ||
                      m.vendor !== conversation?.user?._id
                        ? "#d1e7dd"
                        : "#e2e3e5",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    margin: "5px 0",
                  }}
                >
                  <strong>
                    {m.vendor === userInfo.vendorId ||
                    m.vendor !== conversation?.user?._id
                      ? "You"
                      : selectedPerson}
                  </strong>
                  :
                  <span
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(m.text),
                    }}
                  />
                </p>
              </div>
            ))}
            <div ref={bottomChat} />
          </div>
          <div className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
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
  );
};

export default Chat;
