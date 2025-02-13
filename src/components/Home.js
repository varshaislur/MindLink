import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div>
       <StyledWrapper>
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6">\
            <div className="card-body text-center" style={{backgroundColor:'#010101', padding:'30px', borderRadius:'40px',height:'50vh'}}>
              {/* <img
                src="/images/codecast.png"
                alt="Logo"
                className="img-fluid mx-auto d-block"
                style={{ maxWidth: "150px" }}
              /> */}
              <h4 style={{fontFamily: "'Montserrat', sans-serif", paddingTop:'20px', color:'#0ffaf3'}}>Enter the Room ID</h4>

              <div className="form-group">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                   className="form-control mb-2 custom-input"
                  placeholder="Room Id"
                  style={{fontFamily: "'Montserrat', sans-serif", backgroundColor:'#14151c', borderColor:'#9dfcfa', color:'#fff', borderRadius:'15px', marginTop:'20px'}}
                  onKeyUp={handleInputEnter}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={username}
                  style={{fontFamily: "'Montserrat', sans-serif", backgroundColor:'#14151c', borderColor:'#9dfcfa', color:'#fff', borderRadius:'15px', marginTop:'15px'}}
                  onChange={(e) => setUsername(e.target.value)}
                 className="form-control mb-2 custom-input"
                  placeholder="Username"
                  onKeyUp={handleInputEnter}
                />
              </div>
              <button
                onClick={joinRoom}
                style={{fontFamily: "'Montserrat', sans-serif", backgroundColor:'#0ffaf3', color:'#010101', marginTop:'30px', borderRadius:'20px', width:'120px'}}
                className="btn btn-success btn-lg btn-block"
              >
                JOIN
              </button>
              <p className="mt-3 text-light" style={{fontFamily: "'Montserrat', sans-serif"}}>
                Don't have a room ID?
                <span
                  onClick={generateRoomId}
                  className=" text-success p-2"
                  style={{ cursor: "pointer", fontFamily: "'Montserrat', sans-serif"}}
                >
                  <p style={{ color:'#0ffaf3'}}>Create New Room</p>
                </span>
              </p>
            </div>
          </div>
      </div>
      </StyledWrapper>
    </div>
  );
}

const StyledWrapper = styled.div`
  
  `;

export default Home;

