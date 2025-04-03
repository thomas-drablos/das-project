// src/components/SearchBar.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {}

const SearchBar: React.FC<SearchBarProps> = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/results/${searchTerm}`);
  };

  useEffect(() => {
    if (searchTerm) {
      const fetchSuggestions = async () => {
        const simulatedSuggestions = [
          `Product: ${searchTerm} 1`, //replace later with actual suggestion logic
          `Product: ${searchTerm} 2`,
          `Category: ${searchTerm} 3`,
          `Brand: ${searchTerm} 4`,
        ].filter((suggestion) =>
          suggestion.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSuggestions(simulatedSuggestions);
      };

      const timeoutId = setTimeout(() => {
        fetchSuggestions();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  return (
    <div
      style={{
        width: "50%",
        maxWidth: "1200px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleFormSubmit}
        className="d-flex"
        style={{ flexGrow: 1, marginRight: "10px", position: "relative" }} // Added position: relative
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search. . ."
          value={searchTerm}
          onChange={handleInputChange}
          style={{ width: "100%" }}
        />
        {suggestions.length > 0 && (
          <ul
            className="list-group"
            style={{
              position: "absolute", // Added position: absolute
              width: "100%", // Added width: 100%
              top: "100%", // Added top: 100%
              left: 0, // Added left: 0
              zIndex: 1, // Added zIndex: 1
            }}
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="list-group-item list-group-item-action"
                onClick={() => {
                  setSearchTerm(suggestion);
                  setSuggestions([]);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>
      <button
        type="submit"
        className="btn btn-success"
        style={{ flexShrink: 0 }}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
