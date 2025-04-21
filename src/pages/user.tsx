// src/pages/User.tsx
import React from "react";
import { useAppUser } from "../contexts/appUserContext";
import { useApiToken } from "../contexts/apiTokenContext";
import { useState, useEffect } from "react";
import { getJson, postJson } from "../util";
import { useNavigate } from "react-router-dom";

const User: React.FC = () => {
  const { loading, userId, name } = useAppUser()
  const { apiToken } = useApiToken()
  const navigate = useNavigate()

  const [userInfo, setUserInfo] = useState<any>()
  const [editName, setEditName] = useState<boolean>(false)
  const [newName, setNewName] = useState<string>(name || '')

  useEffect(() => {
    getJson(`api/user/${userId}`, apiToken).then(setUserInfo)
  }, [loading, name])

  if (loading) {
    return <div>Loading ...</div>;
  }
  
  // if there is a vendor page --> go to page
  // no vendor page --> make one --> go to page
  const handleVendor = async () => {
    if (typeof(userInfo) == 'object' && userInfo.vendorId == null) {
      await postJson(`http://localhost:8000/api/vendor/create`, {name: userInfo.name}, apiToken)
      window.location.reload()
    }
    else if (typeof(userInfo) == 'object') {
      navigate(`/vendor/${userInfo.vendorId}`)
    }
  }

  return (
    typeof(userInfo) == 'object' && (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div onClick={() => {setEditName(true); setNewName(userInfo.name)}}>
          {editName ? (
            <>
              <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => {
                const response = postJson(`http://localhost:8000/api/user/${userId}/name`, {name: newName}, apiToken)
                response.then((result) => console.log('try to change name:', result))
                setUserInfo({...userInfo, name: newName})
                setEditName(false)
              }}
              autoFocus
              />
            </>
          ) : (<h2>{userInfo.name}</h2>)}
        
        </div>
        <p>Email: {userInfo.email}</p>

        <br/>
        <button onClick={handleVendor}>Vendor Page</button>
      </div>
    )
  );
};

export default User;
