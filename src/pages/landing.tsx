// src/pages/LandingPage.tsx
import React from "react";
import SearchBar from "../components/Searchbar"; // Import SearchBar
import AllVendors from "../components/AllVendors";

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
      <div className="mt-5">
        {" "}
        {/* Add a top margin using Bootstrap */}
        <AllVendors />
      </div>
    </div>
  );
};

export default LandingPage;
