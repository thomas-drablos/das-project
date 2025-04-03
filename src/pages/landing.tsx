// src/pages/LandingPage.tsx
import React from "react";
import SearchBar from "../components/Searchbar"; // Import SearchBar

const LandingPage: React.FC = () => {
  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img
        src="/logo.png"
        alt="Site Logo"
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          maxWidth: "400px",
          height: "auto",
        }}
      />
      <SearchBar />
    </div>
  );
};

export default LandingPage;
