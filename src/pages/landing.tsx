// src/pages/LandingPage.tsx
import React from "react";
import SearchBar from "../components/Searchbar"; // Import SearchBar

const LandingPage: React.FC = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img
        src="/logo_banner.png"
        alt="Comet Commerce Logo"
        style={{
          marginTop: "120px",
          marginBottom: "30px",
          maxWidth: "400px",
          height: "auto",
          transform: "scale(1.5)",
        }}
      />
      <SearchBar />
    </div>
  );
};

export default LandingPage;
