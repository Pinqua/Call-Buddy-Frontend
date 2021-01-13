import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import logo from "../../Images/logo.png";
import { Link } from "react-router-dom";
import Video from "../Video/Video";
import {
  Call,
  FileCopy,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
} from "@material-ui/icons";
import music from "../../Audio/music.mp3";
import OutgoingMusic from "../../Audio/outgoing.mp3";
import CallUI from "../CallUI/CallUI";
import Loader from "react-loader-spinner";

function Home({
  callUser,
  answerCall,
  rejectCall,
  incomingCall,
  outgoingCall,
  myInfo,
  userInfo,
  videoCamOffHandler,
  micOffHandler,
  displayNameHandler,
  notificationMsg,
}) {
  const [inputUserID, setInputUserID] = useState("");
  const [inputDisplayName, setInputDisplayName] = useState("");
  const itemToCopy = useRef();
  const [copied, setCopied] = useState(false);

  const formHandler = (e) => {
    e.preventDefault();
    callUser(inputUserID);
    setInputUserID("");
  };

  //user display name
  const DisplayNameHandler = (e) => {
    e.preventDefault();
    displayNameHandler(inputDisplayName);
  };

  //copy text to clipboard
  const copyToClipboard = () => {
    const str = itemToCopy.current.innerText;
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
  };

  useEffect(() => {
    let timeout = null;
    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [copied]);

  return (
    <div className="home">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="" />
        </Link>
      </div>
      <div className="home__content">
        <div className="home__box">
          <div className="video__box">
            <Video
              stream={myInfo.stream}
              volumeOff={true}
              videoCamOff={myInfo.videoCamOff}
              micOff={myInfo.micOff}
              you
              addStyle={{
                transform: "scale(1.05)",
                minHeight: "180px",
                maxHeight: "250px",
              }}
            />
            <div className="home__callOptions">
              <div className="home__callOption" onClick={videoCamOffHandler}>
                {myInfo.videoCamOff ? <VideocamOff /> : <Videocam />}
              </div>
              <div className="home__callOption" onClick={micOffHandler}>
                {myInfo.micOff ? <MicOff /> : <Mic />}
              </div>
            </div>
          </div>
          <div className={`myUserID ${!myInfo.id ? "generating__id" : ""}`}>
            {myInfo.id ? (
              <>
                <h3>My ID</h3>
                <span ref={itemToCopy}>{myInfo.id}</span>
                <FileCopy className="copyIcon" onClick={copyToClipboard} />
              </>
            ) : (
              <>
                <h3>Generating ID</h3>
                <Loader type="Oval" color="#5277f0" height={30} width={30} />
              </>
            )}
          </div>
          <form onSubmit={formHandler}>
            <input
              type="text"
              required
              placeholder="Enter User ID"
              value={inputUserID}
              onChange={(e) => setInputUserID(e.target.value)}
            />
            <button type="submit">
              <Call />
              &nbsp;Call
            </button>
          </form>
        </div>
      </div>
      {incomingCall && (
        <CallUI
          id={userInfo.id}
          displayName={userInfo.displayName}
          incoming
          myInfo={myInfo}
          music={music}
          answerCall={answerCall}
          rejectCall={rejectCall}
          videoCamOffHandler={videoCamOffHandler}
          micOffHandler={micOffHandler}
        />
      )}
      {outgoingCall && (
        <CallUI
          id={userInfo.id}
          displayName={userInfo.displayName}
          myInfo={myInfo}
          music={OutgoingMusic}
          rejectCall={rejectCall}
          videoCamOffHandler={videoCamOffHandler}
          micOffHandler={micOffHandler}
        />
      )}
      {!myInfo.displayName && (
        <div className="model">
          <div className="model__content">
            <h3>
              Welcome to <span>Call Buddy</span>.
            </h3>
            <form onSubmit={DisplayNameHandler}>
              <input
                type="text"
                required
                placeholder="Your display name"
                value={inputDisplayName}
                onChange={(e) => {
                  setInputDisplayName(e.target.value);
                }}
              />
              <button>Submit</button>
            </form>
            <p>Build with ❤️ by Piyush Sati</p>
          </div>
        </div>
      )}
      {(notificationMsg || copied) && (
        <div className="notification">
          <p>{notificationMsg ? notificationMsg : "Copied"}</p>
        </div>
      )}
    </div>
  );
}

export default Home;
