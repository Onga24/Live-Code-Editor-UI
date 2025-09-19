



// import { useEffect, useRef } from "react";
// import * as monaco from "monaco-editor";

// const CodeEditor = ({ code, onCodeChange }) => {
//   const editorRef = useRef(null);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (containerRef.current) {
//       editorRef.current = monaco.editor.create(containerRef.current, {
//         value: code,
//         language: "javascript",
//         automaticLayout: true,
//       });

//       editorRef.current.onDidChangeModelContent(() => {
//         const newCode = editorRef.current.getValue();
//         onCodeChange(newCode);
//       });
//     }

//     return () => {
//       editorRef.current?.dispose();
//     };
//   }, [containerRef]);

//   // update editor if code prop changes from parent
//   useEffect(() => {
//     if (editorRef.current && editorRef.current.getValue() !== code) {
//       editorRef.current.setValue(code);
//     }
//   }, [code]);

//   return <div ref={containerRef} style={{ height: "70vh", width: "100%" }} />;
// };

// export default CodeEditor;









import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

const langMap = {
  javascript: "javascript",
  python: "python",
  php: "php",
  java: "java",
  cpp: "cpp",
  c: "cpp",
  html: "html",
};

export default function CodeEditor({ code, onCodeChange, language = "javascript" }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const modelRef = useRef(null);
  const updatingFromProp = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // create model once
    const monacoLang = langMap[language] || "plaintext";
    modelRef.current = monaco.editor.createModel(code || "", monacoLang);

    editorRef.current = monaco.editor.create(containerRef.current, {
      model: modelRef.current,
      automaticLayout: true,
      theme: "vs-dark",
      minimap: { enabled: false },
      fontSize: 14,
    });

    const disposable = editorRef.current.onDidChangeModelContent(() => {
      if (updatingFromProp.current) return;
      const val = editorRef.current.getValue();
      onCodeChange && onCodeChange(val);
    });

    return () => {
      disposable.dispose();
      editorRef.current.dispose();
      modelRef.current.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // create only once

  // update editor value when parent prop changes (but avoid clobbering while typing)
  useEffect(() => {
    if (!editorRef.current || !modelRef.current) return;
    const current = editorRef.current.getValue();
    if (current !== code) {
      updatingFromProp.current = true;
      // keep cursor position - setValue resets cursor, so use applyEdits for smoother behaviour could be added.
      modelRef.current.setValue(code || "");
      // small timeout to allow onDidChangeModelContent to ignore this programmatic change
      setTimeout(() => {
        updatingFromProp.current = false;
      }, 0);
    }
  }, [code]);

  // change language dynamically
  useEffect(() => {
    if (!modelRef.current) return;
    const monacoLang = langMap[language] || "plaintext";
    try {
      monaco.editor.setModelLanguage(modelRef.current, monacoLang);
    } catch (e) {
      // ignore if language not supported
      console.warn("setModelLanguage failed", e);
    }
  }, [language]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

