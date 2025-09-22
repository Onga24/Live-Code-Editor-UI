import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import io from "socket.io-client";

export default function ChatPage() {
  const { id } = useParams(); // conversation id
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const endRef = useRef();

  // connect socket once
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // join conversation & listen
  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;

    sock.emit("joinConversation", id);

    sock.on("receiveConversationMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      sock.off("receiveConversationMessage");
    };
  }, [id]);

  // load conversation messages once
  useEffect(() => {
    const fetchConv = async () => {
      const res = await api.get(`/conversations/${id}`);
      setMessages(res.data.messages || res.data);
    };
    fetchConv();
  }, [id]);

  const send = async () => {
    if (!text.trim()) return;
    const res = await api.post(`/conversations/${id}/messages`, { body: text });
    const msg = res.data.message || res.data;
    setMessages((prev) => [...prev, msg]);
    socketRef.current?.emit("newConversationMessage", msg);
    setText("");
  };

  return (
    <div className="p-6">
      <div className="h-96 overflow-y-auto border p-3">
        {messages.map((m) => (
          <div key={m.id}>
            <b>{m.user?.name}</b>: {m.body}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border p-2"
        />
        <button onClick={send} className="bg-blue-500 px-3 text-white">
          Send
        </button>
      </div>
    </div>
  );
}
