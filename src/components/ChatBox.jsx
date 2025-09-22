
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { X, MessageCircle } from "lucide-react"; // icons

export default function ChatBox({ projectId }) {
  const { authUser, apiRequest } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // popup toggle
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // connect socket + get old messages
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.emit("joinProject", projectId);

    // receive message broadcast (with duplicate check)
    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    socketRef.current.on("userTyping", (user) => {
      setTypingUsers((prev) => {
        if (prev.includes(user)) return prev;
        return [...prev, user];
      });
    });

    socketRef.current.on("userStopTyping", (user) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user));
    });

    // fetch saved messages
    (async () => {
      try {
        const res = await apiRequest(`/projects/${projectId}/messages`, "GET");
        if (res.success) {
          setMessages(res.messages || []);
          scrollToBottom();
        }
      } catch (e) {
        console.error("Fetch messages error", e);
      }
    })();

    return () => {
      socketRef.current.disconnect();
    };
  }, [projectId, apiRequest]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const sendMessage = async () => {
    const body = text.trim();
    if (!body) return;

    try {
      const res = await apiRequest(`/projects/${projectId}/messages`, "POST", { body });
      if (res.success) {
        const saved = res.message;
        setText("");

        if (socketRef.current?.connected) {
          socketRef.current.emit("newMessage", saved);
        }
      }
    } catch (err) {
      console.error("Send message error", err);
    }

    if (socketRef.current) {
      socketRef.current.emit("stopTyping", { projectId, user: authUser.name });
    }
  };

  const onChange = (e) => {
    setText(e.target.value);

    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { projectId, user: authUser.name });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("stopTyping", { projectId, user: authUser.name });
      }, 900);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border">
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-2xl">
            <div className="font-semibold">Project Chat</div>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.user?.id === authUser.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`${
                    m.user?.id === authUser.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 border"
                  } px-4 py-2 rounded-2xl max-w-[75%] shadow`}
                >
                  <div className="text-xs font-semibold mb-1 text-amber-500">
                    {m.user?.name || "Unknown"}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                  <div className="text-[10px] text-gray-400 mt-1 text-right">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-1 text-sm text-gray-500">
              {typingUsers.join(", ")} typing...
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t flex items-center gap-2 bg-white rounded-b-2xl">
            <textarea
              value={text}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Write a message..."
              className="flex-1 resize-none border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

