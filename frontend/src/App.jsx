import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import "./App.css";

const App = () => {
  const [myId, setMyId] = useState("");
  const [friendId, setFriendId] = useState("");
  const [peer, setPeer] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const myVideoRef = useRef(null);
  const friendVideoRef = useRef(null);

  useEffect(() => {
    console.log("effect called");
    const peer = new Peer();

    peer.on("open", (id) => {
      setMyId(id);
      setPeer(peer);
    });
    console.log(myId);
    peer.on("connection", (conn) => {
      conn.on("data", (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });
    });

    peer.on("call", (call) => {
      const getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (stream) => {
        myVideoRef.current.srcObject = stream;
        myVideoRef.current.play();

        call.answer(stream);

        call.on("stream", (remoteStream) => {
          friendVideoRef.current.srcObject = remoteStream;
          friendVideoRef.current.play();
        });
      });
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const send = () => {
    const conn = peer.connect(friendId);

    conn.on("open", () => {
      const msgObj = {
        sender: myId,
        message: message,
      };

      conn.send(msgObj);

      setMessages((prevMessages) => [...prevMessages, msgObj]);
      setMessage("");
    });
  };

  const videoCall = () => {
    const getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (stream) => {
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play();

      const call = peer.call(friendId, stream);

      call.on("stream", (remoteStream) => {
        friendVideoRef.current.srcObject = remoteStream;
        friendVideoRef.current.play();
      });
    });
  };
  console.log(myId);
  return (
    <div className="wrapper">
      <div className="col">
        <h1>My ID: {myId}</h1>

        <label>Friend ID:</label>
        <input
          type="text"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />

        <br />
        <br />

        <label>Message:</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={send}>Send</button>

        <button onClick={videoCall}>Video Call</button>

        {messages.map((message, i) => (
          <div key={i}>
            <h3>{message.sender}:</h3>
            <p>{message.message}</p>
          </div>
        ))}
      </div>

      <div className="col">
        <div>
          <video ref={myVideoRef} />
        </div>
        <div>
          <video ref={friendVideoRef} />
        </div>
      </div>
    </div>
  );
};

export default App;
