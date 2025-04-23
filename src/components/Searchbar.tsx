// src/components/SearchBar.tsx
import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getJson } from "../util";
import DOMPurify from "dompurify"; // Import DOMPurify
import "./SearchBar.css"; // Import the CSS file

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any>([]);
  const [searchType, setSearchType] = useState<"all" | "name" | "tags">("all");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/results/${searchTerm}`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const listTag = value.split(" ");
    if (
      value === "" ||
      (suggestions.length === 1 &&
        listTag[listTag.length - 1].toLowerCase().trim() === suggestions[0])
    ) {
      setSuggestions([]);
      return;
    }
    const response = getJson(
      `http://localhost:8000/api/vendor/suggestions/${value}/${searchType}`
    );
    response.then((results) => {
      setSuggestions(results);
    });
  };

  return (
    <div style={{ width: "60%", position: "relative" }}>
      <div style={{ paddingBottom: "10px" }}>
        Search by:&nbsp;
        <label>
          <input
            type="radio"
            name="searchType"
            value="all"
            checked={searchType === "all"}
            onChange={() => setSearchType("all")}
            className="custom-radio-input"
          />
          All&nbsp;
        </label>
        <label>
          <input
            type="radio"
            name="searchType"
            value="name"
            checked={searchType === "name"}
            onChange={() => setSearchType("name")}
            className="custom-radio-input"
          />
          Name&nbsp;
        </label>
        <label>
          <input
            type="radio"
            name="searchType"
            value="tag"
            checked={searchType === "tags"}
            onChange={() => setSearchType("tags")}
            className="custom-radio-input"
          />
          Tag
        </label>
      </div>
      <form onSubmit={handleSubmit} className="d-flex">
        <input
          type="text"
          className="form-control"
          ref={inputRef}
          placeholder="Search. . ."
          value={searchTerm}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="btn btn-success ms-2"
          style={{ backgroundColor: "#008540", borderColor: "#008540" }}
        >
          {" "}
          {/* UTD Green for button */}
          Search
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="list-group position-absolute w-100 z-3">
          {suggestions.map((s: any) => (
            <li
              key={s}
              className="list-group-item list-group-item-action"
              onClick={() => {
                const terms = searchTerm.trim().split(" ");
                terms[terms.length - 1] = s;
                setSearchTerm(terms.join(" ") + " ");
                setSuggestions([]);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(s || ""),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
