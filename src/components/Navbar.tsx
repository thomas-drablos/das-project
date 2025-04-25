// src/components/Navbar.tsx
import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { useAppUser } from "../contexts/appUserContext";

const NavBar: React.FC = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const user = useAppUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <button className="btn" onClick={() => (window.location.href = "/")}>
          <i className="fas fa-home" style={{ fontSize: "1.5em" }} />
        </button>
        <div className="d-flex align-items-center">
          {isAuthenticated && (
            <Link to="/dms" className="btn" style={{ marginRight: "15px" }}>
              <i className="fas fa-envelope" style={{ fontSize: "1.5em" }} />
            </Link>
          )}
          {isAuthenticated ? (
            <div
              className="dropdown"
              style={{ position: "relative", marginRight: "30px" }}
            >
              <button
                className="btn btn-success dropdown-toggle"
                type="button"
                onClick={toggleDropdown}
              >
                {user.loading ? (
                  "..."
                ) : (
                  <span>{user.name}</span>
                )}
              </button>
              {dropdownOpen && (
                <ul className="dropdown-menu show">
                  <li>
                    <Link
                      to={user.name === "CometAdmin" ? "/admin" : "/profile"}
                      className="dropdown-item"
                    >
                      {user.name === "CometAdmin"
                        ? "Admin Dashboard"
                        : "Profile"}
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() =>
                        void logout({
                          logoutParams: { returnTo: window.location.origin },
                        })
                      }
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <button
              className="btn btn-outline-success"
              onClick={() => void loginWithRedirect()}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
