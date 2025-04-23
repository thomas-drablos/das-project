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
  const [, setShowPhotoInput] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState("");

  useEffect(() => {
    if (userId == undefined || userId == null) return;
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
      ).then((vendor: any) => {
        navigate(`/vendor/${vendor._id}`);
      });
    } else if (typeof userInfo === "object" && userInfo.vendorId) {
      navigate(`/vendor/${userInfo.vendorId}`);
    }
  };

  const handleProfilePicSave = () => {
    const cleanUrl = DOMPurify.sanitize(profilePicUrl.trim());
    if (!cleanUrl) return;

    patchJson(
      `http://localhost:8000/api/user/${userId}/profile-pic`,
      { profilePic: cleanUrl },
      apiToken
    ).then(() => {
      setUserInfo({ ...userInfo, profilePic: cleanUrl });
      setProfilePicUrl("");
      setShowModal(false); // Close the modal on successful save
      setShowPhotoInput(false);
    });
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
              cursor: "pointer",
            }}
            title="Click to update your profile picture"
            onClick={() => setShowModal(true)}
          />
        </div>

        {/* Modal */}
        {showModal && (
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "10px",
                width: "90%",
                maxWidth: "400px",
                textAlign: "center",
                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
              }}
            >
              <p style={{ fontWeight: "bold", fontSize: "1rem" }}>
                Do you have the image URL?
                <br />
                If not, you can use <strong>IMGBB</strong> to get one.
              </p>

              <input
                type="text"
                placeholder="Paste image URL here..."
                className="form-control mb-3"
                value={profilePicUrl}
                onChange={(e) => setProfilePicUrl(e.target.value)}
              />

              <div className="d-flex justify-content-center gap-2">
                <button
                  className="btn btn-success"
                  onClick={handleProfilePicSave}
                >
                  Save Photo
                </button>
                <button
                  className="btn btn-danger" // Changed to btn-danger for filled red
                  onClick={() => {
                    setShowModal(false);
                    setProfilePicUrl("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
                patchJson(
                  `http://localhost:8000/api/user/${userId}/name`,
                  { name: sanitizedNewName },
                  apiToken
                ).then(() => {
                  setUserInfo({ ...userInfo, name: sanitizedNewName });
                });
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
          <button className="btn btn-success" onClick={handleVendor}>
            {userInfo.vendorId == null
              ? "Create Vendor Page"
              : "Edit Vendor Page"}
          </button>
        ) : (
          <></>
        )}
      </div>
    )
  );
};

export default User;
