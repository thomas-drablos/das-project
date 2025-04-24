// src/pages/removed.tsx
import React from "react";

const RemovedPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 60px)", // Adjust 60px based on your NavBar height
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "4em", marginBottom: "10px", color: "#e87500" }}>
        Oops!
      </h1>
      <p style={{ fontSize: "1.5em", marginBottom: "20px" }}>
        If you are seeing this page, then you have been blacklisted, and your
        profile has been removed.
      </p>
      <p style={{ marginBottom: "30px" }}>
        Please contact the admin if you would like to appeal this decision.
      </p>
    </div>
  );
};

export default RemovedPage;
