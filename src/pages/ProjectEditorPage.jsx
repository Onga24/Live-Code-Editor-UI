








// import ChatBox from "../components/ChatBox";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import CodeEditor from "../components/CodeEditor";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import io from "socket.io-client";
// import { Play, Terminal, Code, Globe, Users, Settings, Save } from "lucide-react";

// // small debounce (no dependency)
// function debounce(fn, wait = 500) {
//   let t;
//   return (...args) => {
//     clearTimeout(t);
//     t = setTimeout(() => fn(...args), wait);
//   };
// }

// const ProjectEditorPage = () => {
//   const { id } = useParams();
//   const { apiRequest } = useContext(AuthContext);
//   const [project, setProject] = useState(null);
//   const [code, setCode] = useState("");
//   const [language, setLanguage] = useState("javascript");
//   const [output, setOutput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [htmlPreview, setHtmlPreview] = useState(""); // for iframe srcDoc
//   const [isSaving, setIsSaving] = useState(false);

//   const socketRef = useRef();

//   // socket connection & listeners
//   useEffect(() => {
//     socketRef.current = io("http://localhost:3001");
//     socketRef.current.emit("joinProject", id);

//     socketRef.current.on("receiveCode", (newCode) => {
//       // only update editor if remote code differs
//       setCode((prev) => (prev !== newCode ? newCode : prev));
//       if (language === "html") setHtmlPreview(newCode);
//     });

//     socketRef.current.on("receiveOutput", (data) => {
//       setOutput(data);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   // fetch project
//   useEffect(() => {
//     const fetchProject = async () => {
//       try {
//         const res = await apiRequest(`/projects/${id}`, "GET");
//         if (res.success) {
//           setProject(res.project);
//           setCode(res.project.code || "");
//           if ((res.project.code || "") && language === "html") setHtmlPreview(res.project.code);
//         } else {
//           console.error("fetch project failed", res);
//         }
//       } catch (e) {
//         console.error("fetch project error", e);
//       }
//     };
//     fetchProject();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   // autosave (debounced)
//   const saveCodeToServer = useCallback(
//     async (newCode) => {
//       try {
//         setIsSaving(true);
//         await apiRequest(`/projects/${id}/save-code`, "POST", { code: newCode });
//         setTimeout(() => setIsSaving(false), 500);
//       } catch (e) {
//         console.error("save error", e);
//         setIsSaving(false);
//       }
//     },
//     [apiRequest, id]
//   );
//   const debouncedSave = useRef(debounce(saveCodeToServer, 1000)).current;

//   // handle code changes (local typing)
//   const handleCodeChange = (newCode) => {
//     setCode(newCode);
//     if (socketRef.current && socketRef.current.connected) {
//       socketRef.current.emit("codeChange", { projectId: id, code: newCode });
//     }
//     debouncedSave(newCode);

//     if (language === "html") {
//       setHtmlPreview(newCode); // update preview immediately
//     }
//   };

//   // run code -> handle HTML separately
//   const runCode = async () => {
//     if (language === "html") {
//       setOutput("🌐 HTML preview shown below.");
//       return;
//     }

//     setLoading(true);
//     setOutput("");

//     try {
//       const res = await apiRequest("/execute", "POST", {
//         language,
//         code,
//         stdin: "",
//       });

//       console.log("execute response:", res);

//       let resultText = "";

//       if (res && res.success) {
//         // try several shapes
//         if (res.result?.run) {
//           resultText = res.result.run.stdout || res.result.run.stderr || JSON.stringify(res.result.run);
//         } else if (res.result?.stdout || res.result?.stderr) {
//           resultText = res.result.stdout || res.result.stderr;
//         } else if (res.stdout || res.stderr) {
//           resultText = res.stdout || res.stderr;
//         } else {
//           resultText = JSON.stringify(res.result || res);
//         }

//         setOutput(String(resultText));
//         if (socketRef.current) {
//           socketRef.current.emit("codeOutput", { projectId: id, output: String(resultText) });
//         }
//       } else {
//         setOutput("Execution error: " + (res?.message || JSON.stringify(res)));
//       }
//     } catch (err) {
//       console.error("runCode error", err);
//       setOutput("Execution request failed: " + (err.message || err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // when user switches language, adjust preview/editor behavior
//   useEffect(() => {
//     if (language === "html") {
//       setHtmlPreview(code);
//     } else {
//       // clear preview if switching away
//       setHtmlPreview("");
//     }
//   }, [language, code]);

//   const getLanguageIcon = (lang) => {
//     switch (lang) {
//       case "html": return <Globe className="w-4 h-4" />;
//       case "javascript": return <Code className="w-4 h-4" />;
//       default: return <Terminal className="w-4 h-4" />;
//     }
//   };

//   const getLanguageColor = (lang) => {
//     switch (lang) {
//       case "javascript": return "from-yellow-500 to-orange-500";
//       case "python": return "from-blue-500 to-green-500";
//       case "html": return "from-orange-500 to-red-500";
//       case "java": return "from-red-500 to-orange-600";
//       case "cpp": return "from-blue-600 to-purple-600";
//       case "c": return "from-gray-600 to-gray-800";
//       case "php": return "from-purple-500 to-indigo-600";
//       default: return "from-gray-500 to-gray-700";
//     }
//   };

//   if (!project) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-500 text-lg">Loading project...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Enhanced Header */}
//       <header className="bg-white shadow-lg border-b border-gray-200">
//         <div className="px-6 py-4">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className={`p-2 rounded-lg bg-gradient-to-r ${getLanguageColor(language)}`}>
//                 {getLanguageIcon(language)}
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                   <Users className="w-4 h-4" />
//                   <span>{project.members?.length || 1} collaborators</span>
//                   {isSaving && (
//                     <div className="flex items-center gap-1 text-blue-600">
//                       <Save className="w-3 h-3 animate-pulse" />
//                       <span>Saving...</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex gap-3 items-center">
//               {/* Language Selector */}
//               <div className="relative">
//                 <select
//                   value={language}
//                   onChange={(e) => setLanguage(e.target.value)}
//                   className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
//                 >
//                   <option value="javascript">JavaScript</option>
//                   <option value="python">Python</option>
//                   <option value="php">PHP</option>
//                   <option value="java">Java</option>
//                   <option value="cpp">C++</option>
//                   <option value="c">C</option>
//                   <option value="html">HTML</option>
//                 </select>
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
//                   <Settings className="w-4 h-4 text-gray-400" />
//                 </div>
//               </div>

//               {/* Run Button */}
//               <button
//                 onClick={runCode}
//                 disabled={loading}
//                 className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg
//                   ${loading 
//                     ? 'bg-gray-400 cursor-not-allowed' 
//                     : `bg-gradient-to-r ${getLanguageColor(language)} hover:shadow-xl`
//                   }`}
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Running...
//                   </>
//                 ) : (
//                   <>
//                     <Play className="w-4 h-4" />
//                     Run Code
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 p-6 overflow-hidden">
//         <div className="h-full flex flex-col gap-6">
          
//           {/* Code Editor Section */}
//           <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="flex gap-1">
//                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                 </div>
//                 <span className="text-gray-300 text-sm font-medium ml-2">
//                   main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language}
//                 </span>
//               </div>
//               <div className="text-gray-400 text-xs">
//                 {code.length} characters
//               </div>
//             </div>
//             <div style={{ height: "calc(100% - 40px)" }}>
//               <CodeEditor code={code} onCodeChange={handleCodeChange} language={language} />
//             </div>
//           </div>

//           {/* Output/Preview Section */}
//           <div className="h-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 flex items-center gap-2">
//               {language === "html" ? (
//                 <>
//                   <Globe className="w-4 h-4 text-orange-400" />
//                   <span className="text-gray-300 text-sm font-medium">Live Preview</span>
//                 </>
//               ) : (
//                 <>
//                   <Terminal className="w-4 h-4 text-green-400" />
//                   <span className="text-gray-300 text-sm font-medium">Console Output</span>
//                 </>
//               )}
//             </div>
            
//             <div className="h-[calc(100%-40px)]">
//               {language === "html" ? (
//                 <iframe
//                   title="html-preview"
//                   srcDoc={htmlPreview}
//                   className="w-full h-full border-none bg-white"
//                 />
//               ) : (
//                 <div className="h-full bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-y-auto">
//                   <pre className="whitespace-pre-wrap">
//                     {output || "⚡ Output will appear here after running your code..."}
//                   </pre>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//          <div className="grid grid-cols-3 gap-4">
//   <div className="col-span-2">
//  </div>
//   <div className="col-span-1 h-[70vh]">
//    <ChatBox projectId={id} />
//   </div>
// </div>
// <CodeEditor
//   code={code}
//   onCodeChange={handleCodeChange}
//   language={language}
// />


//       </main>
//     </div>
//   );
// };

// export default ProjectEditorPage;


import ChatBox from "../components/ChatBox";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";
import { Play, Terminal, Code, Globe, Users, Settings, Save } from "lucide-react";

// small debounce (no dependency)
function debounce(fn, wait = 500) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

const ProjectEditorPage = () => {
  const { id } = useParams();
  const { apiRequest } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState(""); // for iframe srcDoc
  const [isSaving, setIsSaving] = useState(false);

  const socketRef = useRef();

  // socket connection & listeners
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.emit("joinProject", id);

    socketRef.current.on("receiveCode", (newCode) => {
      setCode((prev) => (prev !== newCode ? newCode : prev));
      if (language === "html") setHtmlPreview(newCode);
    });

    socketRef.current.on("receiveOutput", (data) => {
      setOutput(data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id, language]);

  // fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await apiRequest(`/projects/${id}`, "GET");
        if (res.success) {
          setProject(res.project);
          setCode(res.project.code || "");
          if ((res.project.code || "") && language === "html") {
            setHtmlPreview(res.project.code);
          }
        } else {
          console.error("fetch project failed", res);
        }
      } catch (e) {
        console.error("fetch project error", e);
      }
    };
    fetchProject();
  }, [id, apiRequest, language]);

  // autosave (debounced)
  const saveCodeToServer = useCallback(
    async (newCode) => {
      try {
        setIsSaving(true);
        await apiRequest(`/projects/${id}/save-code`, "POST", { code: newCode });
        setTimeout(() => setIsSaving(false), 500);
      } catch (e) {
        console.error("save error", e);
        setIsSaving(false);
      }
    },
    [apiRequest, id]
  );
  const debouncedSave = useRef(debounce(saveCodeToServer, 1000)).current;

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("codeChange", { projectId: id, code: newCode });
    }
    debouncedSave(newCode);

    if (language === "html") {
      setHtmlPreview(newCode);
    }
  };

  const runCode = async () => {
    if (language === "html") {
      setOutput("🌐 HTML preview shown below.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const res = await apiRequest("/execute", "POST", {
        language,
        code,
        stdin: "",
      });

      let resultText = "";

      if (res && res.success) {
        if (res.result?.run) {
          resultText = res.result.run.stdout || res.result.run.stderr || JSON.stringify(res.result.run);
        } else if (res.result?.stdout || res.result?.stderr) {
          resultText = res.result.stdout || res.result.stderr;
        } else if (res.stdout || res.stderr) {
          resultText = res.stdout || res.stderr;
        } else {
          resultText = JSON.stringify(res.result || res);
        }

        setOutput(String(resultText));
        if (socketRef.current) {
          socketRef.current.emit("codeOutput", { projectId: id, output: String(resultText) });
        }
      } else {
        setOutput("Execution error: " + (res?.message || JSON.stringify(res)));
      }
    } catch (err) {
      setOutput("Execution request failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (language === "html") {
      setHtmlPreview(code);
    } else {
      setHtmlPreview("");
    }
  }, [language, code]);

  const getLanguageIcon = (lang) => {
    switch (lang) {
      case "html":
        return <Globe className="w-4 h-4" />;
      case "javascript":
        return <Code className="w-4 h-4" />;
      default:
        return <Terminal className="w-4 h-4" />;
    }
  };

  const getLanguageColor = (lang) => {
    switch (lang) {
      case "javascript":
        return "from-yellow-500 to-orange-500";
      case "python":
        return "from-blue-500 to-green-500";
      case "html":
        return "from-orange-500 to-red-500";
      case "java":
        return "from-red-500 to-orange-600";
      case "cpp":
        return "from-blue-600 to-purple-600";
      case "c":
        return "from-gray-600 to-gray-800";
      case "php":
        return "from-purple-500 to-indigo-600";
      default:
        return "from-gray-500 to-gray-700";
    }
  };

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getLanguageColor(language)}`}>
                {getLanguageIcon(language)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{project.members?.length || 1} collaborators</span>
                  {isSaving && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Save className="w-3 h-3 animate-pulse" />
                      <span>Saving...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="php">PHP</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="html">HTML</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Settings className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <button
                onClick={runCode}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg
                  ${loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : `bg-gradient-to-r ${getLanguageColor(language)} hover:shadow-xl`
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex gap-6">
          {/* Left Side: Code + Output */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Code Editor */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 flex items-center justify-between">
                <span className="text-gray-300 text-sm font-medium">
                  main.{language === "javascript" ? "js" : language === "python" ? "py" : language}
                </span>
                <div className="text-gray-400 text-xs">{code.length} characters</div>
              </div>
              <div style={{ height: "calc(100% - 40px)" }}>
                <CodeEditor code={code} onCodeChange={handleCodeChange} language={language} />
              </div>
            </div>

            {/* Output Section */}
            <div className="h-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 flex items-center gap-2">
                {language === "html" ? (
                  <>
                    <Globe className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm font-medium">Live Preview</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm font-medium">Console Output</span>
                  </>
                )}
              </div>
              <div className="h-[calc(100%-40px)]">
                {language === "html" ? (
                  <iframe
                    title="html-preview"
                    srcDoc={htmlPreview}
                    className="w-full h-full border-none bg-white"
                  />
                ) : (
                  <div className="h-full bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {output || "⚡ Output will appear here after running your code..."}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

<div className="w-[350px]">
  <ChatBox projectId={id} />
</div>
        </div>
      </main>
    </div>
  );
};

export default ProjectEditorPage;


