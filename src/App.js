import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import Home from "./Components/Home/Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Room from "./Components/Room/Room";
import PageNotFound404 from "./Components/PageNotFound404/PageNotFound404";
import io from "socket.io-client";
import Peer from "peerjs";

function App() {
  const [outgoingCall, setOutgoingCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const socket = useRef();
  const [, setCam] = useState("user");
  const [notificationMsg, setNotificationMsg] = useState("");
  const [userInfo, setUserInfo] = useState({
    id: "",
    displayName: "",
    stream: null,
    videoCamOff: false,
    micOff: false,
  });
  const [myInfo, setMyInfo] = useState({
    id: "",
    displayName: "",
    stream: null,
    videoCamOff: false,
    micOff: false,
  });
  const myPeer = useRef(
    new Peer(/*undefined, { host: "localhost", port: 5000, path: "/myapp" }*/)
  );

  const answerCall = useCallback(() => {
    socket.current.emit("call-attended", myInfo, userInfo.id);
    setIncomingCall(false);
  }, [myInfo, userInfo.id]);

  const callUser = useCallback(
    (userID) => {
      if (myInfo.id === userID) {
        setNotificationMsg("Enter someone else ID");
        return;
      }
      socket.current.emit("call-user", { ...myInfo, stream: null }, userID);
      setOutgoingCall(true);
      setUserInfo((userInfo) => ({ ...userInfo, id: userID }));
    },
    [myInfo]
  );

  const displayNameHandler = useCallback((displayName) => {
    setMyInfo((myInfo) => ({ ...myInfo, displayName: displayName }));
  }, []);

  const endCall = useCallback(() => {
    socket.current.emit("end-call", userInfo.id);
    setUserInfo({
      id: "",
      displayName: "",
      stream: null,
      videoCamOff: false,
      micOff: false,
    });
  }, [userInfo.id]);

  const rejectCall = useCallback(() => {
    socket.current.emit("call-rejected", userInfo.id);
    setIncomingCall(false);
    setOutgoingCall(false);
    setUserInfo({
      id: "",
      displayName: "",
      stream: null,
      videoCamOff: false,
      micOff: false,
    });
  }, [userInfo.id]);

  const videoCamOffHandler = useCallback(() => {
    if (userInfo.stream) {
      socket.current.emit(
        "user-info",
        { ...myInfo, videoCamOff: !myInfo.videoCamOff },
        userInfo.id
      );
    }
    setMyInfo((myInfo) => ({ ...myInfo, videoCamOff: !myInfo.videoCamOff }));
  }, [myInfo, userInfo.id, userInfo.stream]);

  const micOffHandler = useCallback(() => {
    if (userInfo.stream) {
      socket.current.emit(
        "user-info",
        { ...myInfo, micOff: !myInfo.micOff },
        userInfo.id
      );
    }
    setMyInfo((myInfo) => ({ ...myInfo, micOff: !myInfo.micOff }));
  }, [userInfo.stream, userInfo.id, myInfo]);

  const switchCamera = useCallback(() => {
    const supported = navigator.mediaDevices.getSupportedConstraints();
    if (!supported["facingMode"]) {
      alert("Not supported by browser");
      return;
    }
    setCam((cam) => {
      if (cam === "user") {
        socket.current.emit("switch-cam", "environment", userInfo.id);
        return "environment";
      }
      socket.current.emit("switch-cam", "user", userInfo.id);
      return "user";
    });
  }, [userInfo.id]);

  //automatically hide notification message after some time.
  useEffect(() => {
    let timeOut = null;
    if (notificationMsg) {
      timeOut = setTimeout(() => {
        setNotificationMsg("");
      }, 4000);
    }
    return () => {
      clearTimeout(timeOut);
    };
  }, [notificationMsg]);

  //automatically cut the call after some time.
  useEffect(() => {
    let timeout = null;
    if (outgoingCall) {
      timeout = setTimeout(() => {
        rejectCall();
        setNotificationMsg(
          "User doesn't exist or user is not picking up your call"
        );
      }, 60000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [outgoingCall, rejectCall]);

  useEffect(() => {
    socket.current = io(`${process.env.REACT_APP_SERVER_URL}/media`);
    //socket.current = io("http://localhost:9000/media");

    let Stream;

    function CALL(userID, stream) {
      const call = myPeer.current.call(userID, stream);
      call.on("stream", (userStream) => {
        setUserInfo((userInfo) => ({ ...userInfo, stream: userStream }));
      });
      call.on("close", () => {
        setUserInfo({
          id: "",
          displayName: "",
          stream: null,
          videoCamOff: false,
          micOff: false,
        });
      });
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 },
          aspectRatio: { ideal: 1.7777777778 },
        },
        audio: {
          sampleRate: { ideal: 48000 },
          sampleSize: { ideal: 16 },
          channelCount: { ideal: 2, min: 1 },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((stream) => {
        setMyInfo((myInfo) => ({ ...myInfo, stream: stream }));
        Stream = stream;
        myPeer.current.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userStream) => {
            setUserInfo((userInfo) => ({ ...userInfo, stream: userStream }));
          });
        });
        socket.current.on("call--attended", (userInfo) => {
          setUserInfo((usrInfo) => ({ ...userInfo, stream: usrInfo.stream }));
          CALL(userInfo.id, stream);
          setOutgoingCall(false);
        });
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      });

    // on open will be launch when you successfully connect to PeerServer
    myPeer.current.on("open", (id) => {
      setMyInfo((myInfo) => ({ ...myInfo, id: id }));
      socket.current.emit("join-media", id);
      myPeer.current.on("error", (err) => {
        console.log(err);
        alert(err);
        setUserInfo((userInfo) => {
          socket.current.emit("end-call", userInfo.id);
          return {
            id: "",
            displayName: "",
            stream: null,
            videoCamOff: false,
            micOff: false,
          };
        });
      });
    });

    myPeer.current.on("disconnected", () => {
      setUserInfo((userInfo) => {
        socket.current.emit("end-call", userInfo.id);
        return {
          id: "",
          displayName: "",
          stream: null,
          videoCamOff: false,
          micOff: false,
        };
      });
    });

    myPeer.current.on("close", () => {
      setUserInfo((userInfo) => {
        socket.current.emit("end-call", userInfo.id);
        return {
          id: "",
          displayName: "",
          stream: null,
          videoCamOff: false,
          micOff: false,
        };
      });
    });

    socket.current.on("connect", () => {
      socket.current.on("incoming-call", (userInfo) => {
        setUserInfo((usrInfo) => {
          if (usrInfo.stream || usrInfo.id) {
            socket.current.emit("busy", userInfo.id);
            if (usrInfo.stream) {
              setIncomingCall(false);
            }
            return usrInfo;
          }
          setIncomingCall(true);
          return userInfo;
        });
      });

      socket.current.on("user-busy", () => {
        setOutgoingCall(false);
        setNotificationMsg("User is busy");
        setUserInfo({
          id: "",
          displayName: "",
          stream: null,
          videoCamOff: false,
          micOff: false,
        });
      });
      socket.current.on("user--info", (userInfo) => {
        setUserInfo((usrInfo) => ({ ...userInfo, stream: usrInfo.stream }));
      });
      socket.current.on("call--rejected", () => {
        setOutgoingCall(false);
        setIncomingCall(false);
        setUserInfo({
          id: "",
          displayName: "",
          stream: null,
          videoCamOff: false,
          micOff: false,
        });
      });
      socket.current.on("call-ended", () => {
        setUserInfo({
          id: "",
          displayName: "",
          stream: null,
          videoCamOff: false,
          micOff: false,
        });
      });

      socket.current.on("user-disconnected", (ID) => {
        setUserInfo((Info) => {
          if (ID === Info.id) {
            return { ...Info, stream: null };
          }
          return { ...Info };
        });
      });

      socket.current.on("switch-camera", (camera, userID) => {
        //stop the tracks
        const tracks = Stream.getTracks();
        tracks.forEach((tracks) => tracks.stop());
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: camera,
              width: { min: 160, ideal: 640, max: 1280 },
              height: { min: 120, ideal: 360, max: 720 },
              aspectRatio: { ideal: 1.7777777778 },
            },
            audio: {
              sampleRate: { ideal: 48000 },
              sampleSize: { ideal: 16 },
              channelCount: { ideal: 2, min: 1 },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          })
          .then((stream) => {
            Stream = stream;
            setMyInfo((myInfo) => ({ ...myInfo, stream: stream }));
            CALL(userID, stream);
          })
          .catch((err) => {
            console.log(err);
            alert(err);
          });
      });
    });

    const SOCKET = socket.current;
    return () => {
      SOCKET.removeAllListeners();
    };
  }, []);

  //to stop echo and mute my audio
  useEffect(() => {
    if (myInfo.stream && myInfo.stream.getAudioTracks().length > 0) {
      myInfo.stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }
  }, [myInfo.stream]);

  return (
    <div className="app">
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route path="/" exact>
            {!userInfo.stream ? (
              <Home
                answerCall={answerCall}
                incomingCall={incomingCall}
                outgoingCall={outgoingCall}
                callUser={callUser}
                myInfo={myInfo}
                userInfo={userInfo}
                rejectCall={rejectCall}
                videoCamOffHandler={videoCamOffHandler}
                micOffHandler={micOffHandler}
                displayNameHandler={displayNameHandler}
                notificationMsg={notificationMsg}
              />
            ) : (
              <Room
                myInfo={myInfo}
                userInfo={userInfo}
                endCall={endCall}
                videoCamOffHandler={videoCamOffHandler}
                micOffHandler={micOffHandler}
                switchCamera={switchCamera}
              />
            )}
          </Route>
          <Route path="*">
            <PageNotFound404 />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
