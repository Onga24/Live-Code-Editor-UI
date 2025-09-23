
// import { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { X, MessageCircle } from "lucide-react"; // icons

// export default function ChatBox({ projectId }) {
//   const { authUser, apiRequest } = useContext(AuthContext);
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [isOpen, setIsOpen] = useState(false); // popup toggle
//   const socketRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   // connect socket + get old messages
//   useEffect(() => {
//     socketRef.current = io("http://localhost:3001");
//     socketRef.current.emit("joinProject", projectId);

//     // receive message broadcast (with duplicate check)
//     socketRef.current.on("receiveMessage", (msg) => {
//       setMessages((prev) => {
//         if (prev.find((m) => m.id === msg.id)) return prev;
//         return [...prev, msg];
//       });
//       scrollToBottom();
//     });

//     socketRef.current.on("userTyping", (user) => {
//       setTypingUsers((prev) => {
//         if (prev.includes(user)) return prev;
//         return [...prev, user];
//       });
//     });

//     socketRef.current.on("userStopTyping", (user) => {
//       setTypingUsers((prev) => prev.filter((u) => u !== user));
//     });

//     // fetch saved messages
//     (async () => {
//       try {
//         const res = await apiRequest(`/projects/${projectId}/messages`, "GET");
//         if (res.success) {
//           setMessages(res.messages || []);
//           scrollToBottom();
//         }
//       } catch (e) {
//         console.error("Fetch messages error", e);
//       }
//     })();

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, [projectId, apiRequest]);

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 50);
//   };

//   const sendMessage = async () => {
//     const body = text.trim();
//     if (!body) return;

//     try {
//       const res = await apiRequest(`/projects/${projectId}/messages`, "POST", { body });
//       if (res.success) {
//         const saved = res.message;
//         setText("");

//         if (socketRef.current?.connected) {
//           socketRef.current.emit("newMessage", saved);
//         }
//       }
//     } catch (err) {
//       console.error("Send message error", err);
//     }

//     if (socketRef.current) {
//       socketRef.current.emit("stopTyping", { projectId, user: authUser.name });
//     }
//   };

//   const onChange = (e) => {
//     setText(e.target.value);

//     if (socketRef.current?.connected) {
//       socketRef.current.emit("typing", { projectId, user: authUser.name });

//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = setTimeout(() => {
//         socketRef.current.emit("stopTyping", { projectId, user: authUser.name });
//       }, 900);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <>
//       {/* Floating chat button */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
//         >
//           <MessageCircle size={24} />
//         </button>
//       )}

//       {/* Chat popup */}
//       {isOpen && (
//         <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border">
//           {/* Header */}
//           <div className="px-4 py-3 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-2xl">
//             <div className="font-semibold">Project Chat</div>
//             <button onClick={() => setIsOpen(false)}>
//               <X size={20} />
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
//             {messages.map((m) => (
//               <div
//                 key={m.id}
//                 className={`flex ${m.user?.id === authUser.id ? "justify-end" : "justify-start"}`}
//               >
//                 <div
//                   className={`${
//                     m.user?.id === authUser.id
//                       ? "bg-blue-600 text-white"
//                       : "bg-white text-gray-900 border"
//                   } px-4 py-2 rounded-2xl max-w-[75%] shadow`}
//                 >
//                   <div className="text-xs font-semibold mb-1 text-amber-500">
//                     {m.user?.name || "Unknown"}
//                   </div>
//                   <div className="text-sm whitespace-pre-wrap">{m.body}</div>
//                   <div className="text-[10px] text-gray-400 mt-1 text-right">
//                     {new Date(m.created_at).toLocaleTimeString()}
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Typing indicator */}
//           {typingUsers.length > 0 && (
//             <div className="px-4 py-1 text-sm text-gray-500">
//               {typingUsers.join(", ")} typing...
//             </div>
//           )}

//           {/* Input */}
//           <div className="p-3 border-t flex items-center gap-2 bg-white rounded-b-2xl">
//             <textarea
//               value={text}
//               onChange={onChange}
//               onKeyDown={handleKeyDown}
//               rows={1}
//               placeholder="Write a message..."
//               className="flex-1 resize-none border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
//             />
//             <button
//               onClick={sendMessage}
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }






import { useEffect, useRef, useState, useContext } from "react";
import io from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { X, MessageCircle, Send, Users, Minimize2, Maximize2 } from "lucide-react";

export default function ChatBox({ projectId }) {
  const { authUser, apiRequest } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.emit("joinProject", projectId);

    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }

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
  }, [projectId, apiRequest, isOpen]);

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

  const getUserAvatar = (username) => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-purple-400 to-purple-600",
      "from-green-400 to-green-600",
      "from-pink-400 to-pink-600",
      "from-yellow-400 to-orange-500",
      "from-indigo-400 to-indigo-600",
    ];
    const colorIndex = username?.length % colors.length || 0;
    return colors[colorIndex];
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
      <button
  onClick={() => {
    setIsOpen(true);
    setUnreadCount(0);
  }}
  className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
>

          <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </div>
          )}
        </button>
      )}

      {/* Chat popup */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-40 w-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[500px]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Project Chat</div>
                <div className="flex items-center gap-1 text-blue-100 text-xs">
                  <Users className="w-3 h-3" />
                  <span>Team collaboration</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white" />
                )}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No messages yet</p>
                    <p className="text-gray-400 text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${getUserAvatar(
                          m.user?.name
                        )} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-white text-xs font-semibold">
                          {m.user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">
                            {m.user?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`rounded-lg rounded-tl-none px-3 py-2 shadow-sm border ${
                            m.user?.id === authUser?.id
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-800 border-gray-200"
                          }`}
                        >
                          <p className="text-sm break-words whitespace-pre-wrap">{m.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span>{typingUsers.join(", ")} typing...</span>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      value={text}
                      onChange={onChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Type your message..."
                      className="w-full resize-none border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm bg-gray-50"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!text.trim()}
                    className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
