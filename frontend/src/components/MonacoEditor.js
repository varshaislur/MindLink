import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { ACTIONS } from "../Actions";

function MonacoEditor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && code !== value) {
          setValue(code);
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [socketRef, value]);

  const handleEditorChange = (newValue) => {
    setValue(newValue);
    onCodeChange(newValue);
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: newValue,
      });
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

    // Define a custom theme
    monaco.editor.defineTheme("customDark", {
      base: "vs-dark", // Can be "vs", "vs-dark", or "hc-black"
      inherit: true, // Inherit settings from base theme
      rules: [
        { token: "comment", foreground: "7F848E" },
        { token: "keyword", foreground: "C792EA" },
        { token: "string", foreground: "A3BE8C" },
        { token: "number", foreground: "F78C6C" },
        { token: "function", foreground: "82AAFF" },
        { token: "variable", foreground: "D8DEE9" },
      ],
      colors: {
        "editor.background": "#14151c", // Background color
        "editor.foreground": "#D8DEE9", // Default text color
        "editorCursor.foreground": "#0ffaf3", // Cursor color
        "editor.lineHighlightBackground": "#2A2A3A", // Line highlight color
        "editor.selectionBackground": "#3E4451", // Selection color
        "editor.inactiveSelectionBackground": "#292D3E",
      },
    });

    // Apply the custom theme
    monaco.editor.setTheme("customDark");
  };

  return (
    <div style={{ height: "600px", paddingTop:'10px'}}>
      <Editor
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
        }}
        height="100%"
        theme="customDark"
        language="javascript"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount} 
      />
    </div>
  );
}

export default MonacoEditor;
