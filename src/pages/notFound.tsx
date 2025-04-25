// src/pages/notFound.tsx
import React from "react";

const NotFoundPage: React.FC = () => {
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
        404
      </h1>
      <p style={{ fontSize: "1.5em", marginBottom: "20px" }}>
        Oops! You seem to have lost your way!
      </p>
      <p style={{ marginBottom: "30px" }}>
        The page you're looking for could not be found, and might have been
        moved or deleted. That, or you might have entered an incorrect URL.
      </p>
    </div>
  );
};

export default NotFoundPage;
