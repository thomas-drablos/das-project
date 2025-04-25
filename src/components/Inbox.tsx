import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { getJson } from "../util";
import { getOtherName } from "../pages/messaging";

const Inbox = () => {
  const { id } = useParams();
  const { loading, userId } = useAppUser();
  const { apiToken } = useApiToken();

  const [userInfo, setUserInfo] = useState<any>();
  const [conversations, setConversations] = useState<any>([]); // Initialize as empty array

  const navigate = useNavigate();

  // getting the user and all conversation information
  useEffect(() => {
    if (userId == undefined) return
    getJson(`/api/user/${userId}`, apiToken).then(
      setUserInfo
    );
    getJson(`/api/chat`, apiToken)
      .then((result) => {
        setConversations(result);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
        // Optionally handle errors (e.g., display a message to the user)
      });
  }, [loading, id, apiToken, userId]);

  // clicking on the name should go to chat page
  const handlePersonClick = (conv: any) => {
    navigate(`/dms/${conv._id}`);
  };

  return (
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
        {conversations?.map((conv: any) => (
          <li
            key={conv._id}
            onClick={() => handlePersonClick(conv)}
            style={{
              padding: "8px",
              cursor: "pointer",
              background: conv._id === id ? "#f0f0f0" : "transparent",
            }}
          >
            {/* Sanitize the name obtained from getOtherName */}
            <span>{getOtherName(userInfo, conv)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inbox;
