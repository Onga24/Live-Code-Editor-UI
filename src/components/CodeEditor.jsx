// import React, { useRef, useState, useEffect } from "react";
// import Editor from "@monaco-editor/react";
// import io from "socket.io-client";

// // Connect socket server
// const socket = io("http://localhost:3001");

// export default function CodeEditor({ code, onCodeChange, language, projectId, currentUser }) {
//   const editorRef = useRef(null);
//   const [aiSuggestion, setAiSuggestion] = useState("");
//   const debounceTimer = useRef(null);
//   const [typingUser, setTypingUser] = useState(null);
//   const [isTyping, setIsTyping] = useState(false);

//   // --------- SOCKET JOIN ----------
//   useEffect(() => {
//     if (!projectId || !currentUser) return;

//     socket.emit("joinProject", projectId);

//     socket.on("userTyping", (user) => {
//       setTypingUser(user);
//     });

//     socket.on("userStopTyping", (user) => {
//       setTypingUser(null);
//     });

//     return () => {
//       socket.off("userTyping");
//       socket.off("userStopTyping");
//     };
//   }, [projectId, currentUser]);

//   // --------- MONACO MOUNT ----------
//   const handleEditorDidMount = (editor, monaco) => {
//     editorRef.current = editor;

//     editor.onDidChangeModelContent(() => {
//       const value = editor.getValue();
//       onCodeChange(value);

//       setIsTyping(true);
//       socket.emit("typing", { projectId, user: currentUser });

//       clearTimeout(debounceTimer.current);
//       debounceTimer.current = setTimeout(() => {
//         setIsTyping(false);
//         socket.emit("stopTyping", { projectId, user: currentUser });
//       }, 1000);

//       debounceGetAISuggestion(value);
//     });

//     editor.onDidChangeCursorPosition((e) => {
//       socket.emit("cursorMove", { projectId, user: currentUser, position: e.position });
//     });

//     editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
//       if (aiSuggestion) {
//         editor.executeEdits("", [
//           { range: editor.getSelection(), text: aiSuggestion, forceMoveMarkers: true },
//         ]);
//         setAiSuggestion("");
//       }
//     });
//   };

//   // --------- AI SUGGESTION ----------
//   const debounceGetAISuggestion = (codeValue) => {
//     if (debounceTimer.current) clearTimeout(debounceTimer.current);
//     debounceTimer.current = setTimeout(() => {
//       if (codeValue.trim()) getAISuggestion(codeValue);
//     }, 1200);
//   };

//   const getAISuggestion = async (codeSnippet) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:8000/api/ai-autocomplete", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ code: codeSnippet }),
//       });

//       if (!res.ok) throw new Error("Request failed");
//       const data = await res.json();
//       setAiSuggestion(data.suggestion || "");
//     } catch (err) {
//       console.error("AI error:", err.message);
//       setAiSuggestion("");
//     }
//   };

//   return (
//     <div style={{ position: "relative" }}>
//       <Editor
//         height="400px"
//         theme="vs-dark"
//         defaultLanguage={language}
//         value={code}
//         onMount={handleEditorDidMount}
//       />

//       {isTyping && (
//         <div style={{ color: "yellow", marginTop: 5 }}>Saving...</div>
//       )}

//       {typingUser && (
//         <div style={{ color: "lightgreen", marginTop: 5 }}>
//           {typingUser.name} is editing...
//         </div>
//       )}

//       {/* AI Suggestion box */}
//       {aiSuggestion && (
//         <div
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             backgroundColor: "#252526",
//             color: "#dcdcaa",
//             padding: "8px 12px",
//             borderRadius: 6,
//             fontFamily: "monospace",
//             fontSize: 13,
//             maxWidth: "60%",
//             whiteSpace: "pre-wrap",
//           }}
//         >
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             <strong>AI Suggestion</strong>
//             <button
//               onClick={() => setAiSuggestion("")}
//               style={{
//                 background: "transparent",
//                 border: "none",
//                 color: "#f87171",
//                 cursor: "pointer",
//                 fontWeight: "bold",
//                 fontSize: "14px",
//               }}
//             >
//               ✖
//             </button>
//           </div>
//           <pre style={{ margin: 0 }}>{aiSuggestion}</pre>
//           <small style={{ display: "block", marginTop: 4 }}>
//             Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to insert
//           </small>
//         </div>
//       )}
//     </div>
//   );
// }









import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, onCodeChange, language }) {
  const editorRef = useRef(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const debounceTimer = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onCodeChange(value);
      debounceGetAISuggestion(value);
    });

    // Ctrl+Enter → insert suggestion
    editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter,
      () => {
        if (aiSuggestion) {
          editor.executeEdits("", [
            {
              range: editor.getSelection(),
              text: aiSuggestion,
              forceMoveMarkers: true,
            },
          ]);
          setAiSuggestion(""); // clear after insert
        }
      }
    );
  };

  // Debounce
  const debounceGetAISuggestion = (codeValue) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      if (codeValue.trim()) {
        getAISuggestion(codeValue);
      }
    }, 1200);
  };

  // Call Laravel API
  const getAISuggestion = async (codeSnippet) => {
    try {
      const token = localStorage.getItem("token"); 
      const res = await fetch("http://localhost:8000/api/ai-autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: codeSnippet }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server returned error:", errorText);
        throw new Error("Request failed");
      }

      const data = await res.json();
      setAiSuggestion(data.suggestion || "");
    } catch (err) {
      console.error("AI error:", err.message);
      setAiSuggestion("");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <Editor
        height="400px"
        theme="vs-dark"
        defaultLanguage={language}
        value={code}
        onMount={handleEditorDidMount}
      />

      {aiSuggestion && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            backgroundColor: "#252526",
            color: "#dcdcaa",
            padding: "8px 12px",
            borderRadius: 6,
            fontFamily: "monospace",
            fontSize: 13,
            maxWidth: "60%",
            whiteSpace: "pre-wrap",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>AI Suggestion</strong>
            <button
              onClick={() => setAiSuggestion("")}
              style={{
                background: "transparent",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              ✖
            </button>
          </div>
          <pre style={{ margin: 0 }}>{aiSuggestion}</pre>
          <small style={{ display: "block", marginTop: 4 }}>
            Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to insert
          </small>
        </div>
      )}
    </div>
  );
}
