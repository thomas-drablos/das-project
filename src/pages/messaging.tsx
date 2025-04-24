// src/pages/messaging.tsx
import React from "react";
import Inbox from "../components/Inbox";
import Chat from "../components/Chat";

export const getOtherName = (userInfo: any, conv: any) => {
  if (userInfo!?.vendorId == conv.vendor._id) {
    return conv.user.name;
  }
  return conv.vendor.name;
};

const Messaging: React.FC = () => {
  return (
    <>
      <div style={{ display: "flex", height: "90vh", width: "90vw" }}>
        <Inbox />
        <Chat />
      </div>
    </>
  );
};

export default Messaging;
