// src/pages/User.tsx
import React, { useState, useEffect } from "react";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { getJson, patchJson, postJson } from "../util";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify"; // Import DOMPurify

const User: React.FC = () => {
  const { loading, userId, name } = useAppUser();
  const { apiToken } = useApiToken();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<any>();
  const [editName, setEditName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(name || "");

  useEffect(() => {
    getJson(`api/user/${userId}`, apiToken).then(setUserInfo);
  }, [loading, name]);

  if (loading) {
    return <div>Loading ...</div>;
  }

  const handleVendor = async () => {
    if (typeof userInfo === "object" && userInfo.vendorId == null) {
      await postJson(
        `http://localhost:8000/api/vendor/create`,
        { name: userInfo.name },
        apiToken
      ).then((vendor) => {
        navigate(`/vendor/${vendor._id}`);
      })
    } else if (typeof userInfo === "object") {
      navigate(`/vendor/${userInfo.vendorId}`);
    }
  };

  return (
    typeof userInfo === "object" && (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {/* Profile Picture */}
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <img
            src={userInfo.profilePic || "/default_profile.png"}
            alt="Profile"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ccc",
              marginBottom: "10px",
            }}
          />
          <br />
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            id="profileUpload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const fakeUrl = `../../public/images/${file.name}`; // Simulate image path
                postJson(
                  `http://localhost:8000/api/user/${userId}/profile-pic`,
                  { profilePic: fakeUrl },
                  apiToken
                );
                setUserInfo({ ...userInfo, profilePic: fakeUrl });
              }
            }}
          />
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => document.getElementById("profileUpload")?.click()}
          >
            Change Photo
          </button>
        </div>

        {/* Editable Name */}
        <div
          onClick={() => {
            setEditName(true);
            setNewName(userInfo.name);
          }}
        >
          {editName ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => {
                const sanitizedNewName = DOMPurify.sanitize(newName); // Sanitize before sending
                const response = patchJson(
                  `http://localhost:8000/api/user/${userId}/name`,
                  { name: sanitizedNewName },
                  apiToken
                );
                response.then((result) =>
                  console.log("try to change name:", result)
                );
                setUserInfo({ ...userInfo, name: sanitizedNewName });
                setEditName(false);
              }}
              autoFocus
            />
          ) : (
            <h2>
              <h2>
                <span
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(userInfo.name || ""),
                  }}
                />
              </h2>
            </h2>
          )}
        </div>

        {/* Email */}
        <p>Email: {userInfo.email}</p>

        {/* Vendor Link */}
        <br />
        {!userInfo.isAdmin ? (
          <button onClick={handleVendor}>Vendor Page</button>
        ) : (
          <></>
        )}
      </div>
    )
  );
};

export default User;
