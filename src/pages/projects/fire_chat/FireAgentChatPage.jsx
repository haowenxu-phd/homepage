import React from "react";
import FireAgentChat from "./FireAgentChat"; // adjust the path if FireAgentChat.jsx lives elsewhere

export default function FireAgentChatPage() {
  return (
    <div className="flex w-screen h-[calc(100vh-4rem)]  text-slate-50">
      {/* Chatbot fills the whole page */}
      <div className="flex-1">
        <FireAgentChat />
      </div>
    </div>
  );
}
