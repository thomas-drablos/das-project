// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { getJson, patchJson } from "../util";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { loading, userId } = useAppUser();
  const { apiToken } = useApiToken();
  const [vendors, setVendors] = useState<any>();
  const [users, setUsers] = useState<any>();
  const [userInfo, setUserInfo] = useState<any>();

  useEffect(() => {
    if (apiToken != undefined && userId != undefined) {
      getJson(`/api/user/${userId}`, apiToken).then(
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
      getJson(`/api/vendor/${userId}/all`, apiToken).then(
        setVendors
      );
      getJson(`/api/user/${userId}/all`, apiToken).then(
        setUsers
      );
    }
  }, [userInfo]);

  const [activeTab, setActiveTab] = useState<"none" | "users" | "vendors">(
    "none"
  );

  const toggleVisibility = (type: "vendor" | "user", index: number) => {
    // hiding the vendor
    if (type == "vendor") {
      const isHidden = vendors[index].hidden;
      const updatedVendors = [...vendors];
      updatedVendors[index] = { ...updatedVendors[index], hidden: !isHidden };

      patchJson(
        `/api/vendor/${vendors[index]._id}/hide`,
        {},
        apiToken
      ).then(() => setVendors(updatedVendors));
    }
    // hiding the user
    else {
      let isHidden = users[index].hidden;
      const updatedUsers = [...users];
      updatedUsers[index] = { ...updatedUsers[index], hidden: !isHidden };
      patchJson(
        `/api/user/${userId}/${users[index]._id}/hide`,
        {},
        apiToken
      ).then(() => {
        setUsers(updatedUsers);

        // OPTIONAL: if user is hidden also hide their vendor page if not already hidden
        if (
          updatedUsers[index].vendorId != null &&
          updatedUsers[index].hidden == true
        ) {
          const vendorPage = vendors.find(
            (vendor: { _id: any }) => vendor._id == users[index].vendorId
          );
          const idx = vendors.indexOf(vendorPage);
          if (vendorPage.hidden == false) {
            toggleVisibility("vendor", idx);
          }
        }
      });
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
            {users?.map((user: any, idx: number) => (
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
                  {user.name} {'–'}<em>{user.email}</em>
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
                className={`list-group-item d-flex justify-content-between align-items-center ${vendor.hidden} ? "bg-light text-muted" : ""`}
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
                  <span>{vendor.name}</span>
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
