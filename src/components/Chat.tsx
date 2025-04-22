import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { getJson, postJson } from "../util";
import { getOtherName } from "../pages/messaging";

const Chat = () => {
  const { id } = useParams();
  const { loading, userId } = useAppUser()
  const { apiToken } = useApiToken()
  const [userInfo, setUserInfo] = useState<any>()
  const [conversation, setConversation] = useState<any>()
  const [selectedPerson, setSelectedPerson] = useState<any>(null)

  const [messages, setMessages] = useState<any>();
  const [newMsg, setNewMsg] = useState("");

  const bottomChat = useRef<HTMLDivElement | null>(null)

  // getting user information
  useEffect(() => {
    setSelectedPerson(null)
    bottomChat.current?.scrollIntoView({ behavior: "instant" });

    getJson(`http://localhost:8000/api/user/${userId}`, apiToken).then(setUserInfo)
    if (id == undefined) return
    getJson(`http://localhost:8000/api/chat/${id}/messages`, apiToken).then((result) => {
      setMessages(result)
    })
  }, [loading, id])

  // getting converation information
  useEffect(() => {
    if (id == undefined) return
    getJson(`http://localhost:8000/api/chat/${id}`, apiToken).then((convo) => {
      setSelectedPerson(getOtherName(userInfo, convo))
      setConversation(convo)
    })
  }, [userInfo])

  // auto scroll when new message
  useEffect(() => {
    bottomChat.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages])

  const handleSend = () => {
    if (newMsg.trim() == '' || !selectedPerson) return;

    postJson(`http://localhost:8000/api/chat/${id}/messages`, { text: newMsg }, apiToken).then((result) => {
      //console.log('SENT MESSAGE', result)
      const updatedMessages = [...messages, result]
      //console.log(updatedMessages)
      setMessages(updatedMessages)
      setConversation({ ...conversation, messages: updatedMessages })
      setNewMsg('')
    })
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key == 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div style={{ flex: 1, padding: "15px", display: "flex", flexDirection: "column" }}>
        {userInfo != undefined && id != undefined ? (
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
              {messages?.map((m, idx: number) => (
                <div key={idx} style={{ textAlign: (m.vendor == userInfo.vendorId || m.vendor != conversation?.user._id) ? "right" : "left" }}>
                  <p
                    style={{
                      display: "inline-block",
                      backgroundColor: (m.vendor == userInfo.vendorId || m.vendor != conversation?.user._id) ? "#d1e7dd" : "#e2e3e5",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      margin: "5px 0",
                    }}
                  >
                    <strong>{(m.vendor == userInfo.vendorId || m.vendor != conversation?.user._id) ? "You" : selectedPerson}</strong>: {m.text}
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
    </>
  )
}

export default Chat