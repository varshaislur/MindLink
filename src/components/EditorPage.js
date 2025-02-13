import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./MonacoEditor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import { executeCode } from "../api";
import { LANGUAGE_VERSIONS } from "../constants";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";

// List of supported languages
const LANGUAGES = Object.keys(LANGUAGE_VERSIONS);

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");

  const codeRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      function handleErrors(err) {
        console.error("Socket Error:", err);
        toast.error("Socket connection failed. Try again later.");
        navigate("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
    };
  }, [navigate, roomId, location.state]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied!");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Unable to copy the Room ID.");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await executeCode(selectedLanguage, codeRef.current);
      console.log("Execution response:", response);
      setOutput(response.run?.output || "No output returned");
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput("An error occurred while executing the code.");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column"  style={{backgroundColor:'#111518'}}>
      <div className="row flex-grow-1"  style={{backgroundColor:'#010101'}}>
        {/* Client Panel */}
        <div className="col-md-2 text-light d-flex flex-column"  style={{backgroundColor:'#14151c'}}>
          <img
            src="/images/logo.png"
            alt="Logo"
            className="img-fluid mx-auto"
            style={{ width: "300px", marginTop: "-45px", marginLeft:'30px' }}
          />
          <hr style={{ marginTop: "-3rem" }} />

          {/* Client List */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto" style={{backgroundColor:'#111518'}}>
            <span className="mb-2">Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button className="btn w-100 mb-2" style={{fontFamily: "'Montserrat', sans-serif", backgroundColor:'#0ffaf3', borderRadius:'15px'}} onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn w-100" style={{fontFamily: "'Montserrat', sans-serif", borderColor:'#0ffaf3', backgroundColor:"#14151c", color:'#fff', borderRadius:'15px'}} onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="col-md-10 text-light d-flex flex-column">
          {/* Language Selector */}
          <div className="p-2 d-flex justify-content-end"  style={{backgroundColor:'#010101'}}>
            <select
              className="form-select w-auto"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Code Editor */}
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>

      {/* Compiler Toggle Button */}
      <button
        className="btn btn-primary position-fixed bottom-0 end-0 m-3" 
        onClick={toggleCompileWindow}
        style={{ zIndex: 1050,fontFamily: "'Montserrat', sans-serif", backgroundColor:'#0ffaf3', borderRadius:'15px',color:"black" }}
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compiler Output */}
      <div
        className={`bg-dark text-light p-3 ${isCompileWindowOpen ? "d-block" : "d-none"}`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompileWindowOpen ? "30vh" : "0",
          transition: "height 0.3s ease-in-out",
          overflowY: "auto",
          zIndex: 1040,
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Compiler Output ({selectedLanguage})</h5>
          <div>
            <button className="btn btn-success me-2" style={{fontFamily: "'Montserrat', sans-serif", backgroundColor:'#0ffaf3', borderRadius:'15px',color:"black"}} onClick={runCode} disabled={isCompiling}>
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
            <button className="btn btn-secondary" style={{fontFamily: "'Montserrat', sans-serif", borderColor:'#0ffaf3', backgroundColor:"#14151c", color:'#fff', borderRadius:'15px'}} onClick={toggleCompileWindow}>
              Close
            </button>
          </div>
        </div>
        <pre className="bg-secondary p-3 rounded">
          {output || "Output will appear here after compilation"}
        </pre>
      </div>
    </div>
  );
}

export default EditorPage;