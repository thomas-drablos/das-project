// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { getJson, patchJson } from "../util";
import DOMPurify from "dompurify";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { loading, userId } = useAppUser();
  const { apiToken } = useApiToken();
  const [vendors, setVendors] = useState<any>();
  const [userInfo, setUserInfo] = useState<any>();

  useEffect(() => {
    if (apiToken != undefined) {
      getJson(`http://localhost:8000/api/user/${userId}`, apiToken).then(
        setUserInfo
      );
    }
  }, [loading]);

  useEffect(() => {
    if (
      typeof userInfo == "object" &&
      userInfo.isAdmin &&
      apiToken != undefined
    ) {
      getJson(`http://localhost:8000/api/vendor/${userId}/all`, apiToken).then(
        setVendors
      );
    }
  }, [userInfo]);

  const [users, setUsers] = useState([
    { id: 1, name: "Jane Doe", email: "jane@example.com", hidden: false },
    { id: 2, name: "John Smith", email: "john@example.com", hidden: true },
  ]);

  const [activeTab, setActiveTab] = useState<"none" | "users" | "vendors">(
    "none"
  );

  const toggleVisibility = (type: "vendor" | "user", index: number) => {
    if (type == "vendor") {
      const isHidden = vendors[index].hidden;
      const updatedVendors = [...vendors];
      updatedVendors[index] = { ...updatedVendors[index], hidden: !isHidden };
      setVendors(updatedVendors);
      patchJson(
        `http://localhost:8000/api/vendor/${vendors[index]._id}/hide`,
        {},
        apiToken
      );
    } else {
      const isHidden = users[index].hidden;
      const updatedUsers = [...users];
      updatedUsers[index] = { ...updatedUsers[index], hidden: !isHidden };
      setUsers(updatedUsers);
      // insert db call
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Admin Dashboard</h2>

      <div className="d-flex justify-content-center gap-3 mb-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </button>
        <button
          className="btn btn-outline-success"
          onClick={() => setActiveTab("vendors")}
        >
          Manage Vendors
        </button>
      </div>

      {activeTab === "users" && (
        <section className="mb-5">
          <h4>All Users</h4>
          <ul className="list-group">
            {users.map((user, idx: number) => (
              <li
                key={user.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  user.hidden ? "bg-light text-muted" : ""
                }`}
                style={{
                  opacity: user.hidden ? 0.6 : 1,
                  fontStyle: user.hidden ? "italic" : "normal",
                  boxShadow: user.hidden
                    ? "inset 0 0 4px rgba(0,0,0,0.2)"
                    : "none",
                }}
              >
                <span
                  onClick={() => navigate(`/user/${user.id}`)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(user.name || ""),
                    }}
                  />{" "}
                  – <em>{user.email}</em>
                </span>
                <button
                  className={`btn btn-sm ${
                    user.hidden ? "btn-secondary" : "btn-warning"
                  }`}
                  onClick={() => toggleVisibility("user", idx)}
                >
                  {user.hidden ? "Unhide" : "Hide"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === "vendors" && (
        <section>
          <h4>All Vendors</h4>
          <ul className="list-group">
            {vendors?.map((vendor: any, index: number) => (
              <li
                key={vendor._id}
                className={`list-group-item d-flex justify-content-between align-items-center ${
                  vendor.hidden ? "bg-light text-muted" : ""
                }`}
                style={{
                  opacity: vendor.hidden ? 0.6 : 1,
                  fontStyle: vendor.hidden ? "italic" : "normal",
                  boxShadow: vendor.hidden
                    ? "inset 0 0 4px rgba(0,0,0,0.2)"
                    : "none",
                }}
              >
                <span
                  onClick={() => navigate(`/vendor/${vendor._id}`)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(vendor.name || ""),
                    }}
                  />
                </span>
                <button
                  className={`btn btn-sm ${
                    vendor.hidden ? "btn-secondary" : "btn-warning"
                  }`}
                  onClick={() => toggleVisibility("vendor", index)}
                >
                  {vendor.hidden ? "Unhide" : "Hide"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
