// src/components/AllVendors.tsx
import { useEffect, useState } from "react";
import { getJson } from "../util";
import { useNavigate } from "react-router-dom";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import DOMPurify from "dompurify"; // Import DOMPurify
import "./AllVendors.css"; // Import a CSS file for this component

const AllVendors = () => {
  const { loading, userId } = useAppUser();
  const { apiToken } = useApiToken();
  const [all, setAll] = useState<any[]>([]); // Initialize as an empty array
  const [userInfo, setUserInfo] = useState<any>();
  const navigate = useNavigate();

  useEffect(() => {
    getJson(`http://localhost:8000/api/vendor/`).then((data) => {
      if (Array.isArray(data)) {
        setAll(
          data.filter((vendor) => vendor.photos && vendor.photos.length > 0)
        );
      }
    });
  }, []);

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
        (data) => {
          if (Array.isArray(data)) {
            setAll(
              data.filter((vendor) => vendor.photos && vendor.photos.length > 0)
            );
          }
        }
      );
    }
  }, [userInfo]);

  return (
    <>
      <h4
        className="heading-center"
        style={{ textDecoration: "underline", textAlign: "center" }}
      >
        Available Vendors
      </h4>
      {all?.map((vendor: any) => (
        <div
          key={vendor._id}
          onClick={() => navigate(`/vendor/${vendor._id}`)}
          className="vendor-name-item" // Add this class
          style={{ cursor: "pointer" }} // Ensure it looks clickable
        >
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(vendor.name),
            }}
          />
        </div>
      ))}
    </>
  );
};

export default AllVendors;
