// src/pages/User.tsx
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const User: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated && (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <img
          src={user?.picture}
          alt={user?.name ?? "User Profile"}
          style={{
            borderRadius: "50%",
            width: "150px",
            height: "150px",
            objectFit: "cover",
            marginBottom: "20px",
          }}
        />
        <h2>{user?.nickname}</h2>
        <p>Email: {user?.email}</p>
        <p>Nickname: {user?.nickname}</p> {/* Display nickname below email */}
      </div>
    )
  );
};

export default User;
