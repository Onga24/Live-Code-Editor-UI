// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import CodeEditor from "../components/CodeEditor";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import debounce from "lodash.debounce";
// import io from "socket.io-client";

// const ProjectEditorPage = () => {
//   const { id } = useParams();
//   const { apiRequest } = useContext(AuthContext);
//   const [project, setProject] = useState(null);
//   const [code, setCode] = useState("");
//   const [language, setLanguage] = useState("javascript");
//   const [output, setOutput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const socketRef = useRef();

//   useEffect(() => {
//     socketRef.current = io("http://localhost:3001");
//     socketRef.current.emit("joinProject", id);

//     socketRef.current.on("receiveCode", (newCode) => {
//       setCode(newCode);
//     });

//     socketRef.current.on("receiveOutput", (data) => {
//       setOutput(data);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, [id]);

//   useEffect(() => {
//     const fetchProject = async () => {
//       const res = await apiRequest(`/projects/${id}`, "GET");
//       if (res.success) {
//         setProject(res.project);
//         setCode(res.project.code || "");
//       }
//     };
//     fetchProject();
//   }, [id]);

//   const saveCode = async (newCode) => {
//     await apiRequest(`/projects/${id}/save-code`, "POST", { code: newCode });
//   };

//   const debouncedSave = useRef(debounce(saveCode, 1000)).current;

//   const handleCodeChange = (newCode) => {
//     setCode(newCode);
//     socketRef.current.emit("codeChange", { projectId: id, code: newCode });
//     debouncedSave(newCode);
//   };

//   const runCode = async () => {
//     setLoading(true);
//     setOutput("");

//     const res = await apiRequest("/execute", "POST", {
//       language,
//       code,
//       stdin: "",
//     });

//     if (res.success) {
//       const runResult = res.result.run;
//       const resultText = runResult.stdout || runResult.stderr || "No output";
//       setOutput(resultText);

//       socketRef.current.emit("codeOutput", {
//         projectId: id,
//         output: resultText,
//       });
//     } else {
//       setOutput("Execution error: " + res.message);
//     }

//     setLoading(false);
//   };

//   if (!project)
//     return <p className="text-center mt-10 text-gray-500">Loading...</p>;
// return (
//   <div className="h-screen flex flex-col bg-gray-100">
//     {/* Header */}
//     <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
//       <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
//       <div className="flex gap-3">
//         <select
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//           className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="javascript">JavaScript</option>
//           <option value="python">Python</option>
//           <option value="php">PHP</option>
//           <option value="java">Java</option>
//           <option value="cpp">C++</option>
//           <option value="c">C</option>
//         </select>
//         <button
//           onClick={runCode}
//           disabled={loading}
//           className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
//         >
//           {loading ? (
//             <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
//           ) : (
//             "▶ Run Code"
//           )}
//         </button>
//       </div>
//     </header>

//     {/* Main Editor + Output */}
//     <main className="flex-1 grid grid-rows-2 gap-4 p-6">
//       {/* Editor */}
//       <div className="bg-white rounded-lg shadow overflow-hidden border">
//         <CodeEditor code={code} onCodeChange={handleCodeChange} />
//       </div>

//       {/* Output */}
//       <div className="bg-black text-green-400 rounded-lg shadow-inner p-4 font-mono overflow-y-auto">
//         {output || "⚡ Output will appear here..."}
//       </div>
//     </main>
//   </div>
// );

// };

// export default ProjectEditorPage;



















import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";

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

  const socketRef = useRef();

  // socket connection & listeners
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    socketRef.current.emit("joinProject", id);

    socketRef.current.on("receiveCode", (newCode) => {
      // only update editor if remote code differs
      setCode((prev) => (prev !== newCode ? newCode : prev));
      if (language === "html") setHtmlPreview(newCode);
    });

    socketRef.current.on("receiveOutput", (data) => {
      setOutput(data);
    });

    return () => {
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await apiRequest(`/projects/${id}`, "GET");
        if (res.success) {
          setProject(res.project);
          setCode(res.project.code || "");
          if ((res.project.code || "") && language === "html") setHtmlPreview(res.project.code);
        } else {
          console.error("fetch project failed", res);
        }
      } catch (e) {
        console.error("fetch project error", e);
      }
    };
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // autosave (debounced)
  const saveCodeToServer = useCallback(
    async (newCode) => {
      try {
        await apiRequest(`/projects/${id}/save-code`, "POST", { code: newCode });
      } catch (e) {
        console.error("save error", e);
      }
    },
    [apiRequest, id]
  );
  const debouncedSave = useRef(debounce(saveCodeToServer, 1000)).current;

  // handle code changes (local typing)
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("codeChange", { projectId: id, code: newCode });
    }
    debouncedSave(newCode);

    if (language === "html") {
      setHtmlPreview(newCode); // update preview immediately
    }
  };

  // run code -> handle HTML separately
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

      console.log("execute response:", res);

      let resultText = "";

      if (res && res.success) {
        // try several shapes
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
      console.error("runCode error", err);
      setOutput("Execution request failed: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // when user switches language, adjust preview/editor behavior
  useEffect(() => {
    if (language === "html") {
      setHtmlPreview(code);
    } else {
      // clear preview if switching away
      setHtmlPreview("");
    }
  }, [language, code]);

  if (!project) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
        <div className="flex gap-3 items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="php">PHP</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="html">HTML</option>
          </select>
          <button
            onClick={runCode}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            ) : (
              "▶ Run Code"
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-rows-[70%_30%] gap-4 p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <div style={{ height: "100%", minHeight: "100%" }}>
            <CodeEditor code={code} onCodeChange={handleCodeChange} language={language} />
          </div>
        </div>

        {language === "html" ? (
          <div className="bg-white rounded-lg shadow-inner p-2 border">
            <iframe
              title="html-preview"
              srcDoc={htmlPreview}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        ) : (
          <div className="bg-black text-green-400 rounded-lg shadow-inner p-4 font-mono overflow-y-auto">
            <pre className="whitespace-pre-wrap">{output || "⚡ Output will appear here..."}</pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectEditorPage;
