import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";

export default function ConversationList({ onSelect }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const res = await axiosInstance.get("/conversations");
        setConversations(res.data);
      } catch (err) {
        console.error("Error loading conversations", err);
      }
    };
    fetchConvs();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Conversations</h2>
      <ul>
        {conversations.map((c) => (
          <li
            key={c.id}
            className="cursor-pointer p-2 border-b hover:bg-gray-100"
            onClick={() => onSelect(c)}
          >
            {c.is_direct
              ? c.users.map((u) => u.name).join(", ")
              : `Group #${c.id}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
