import React, { useState, useEffect, useCallback } from "react";
import "./Room.css";
import Video from "../Video/Video";
import VideocamIcon from "@material-ui/icons/Videocam";
import {
  CallEnd,
  Chat,
  FiberManualRecord,
  FlipCameraIos,
  Mic,
  MicOff,
  VideocamOff,
  VolumeOff,
  VolumeUp,
} from "@material-ui/icons";
import Chats from "../Chats/Chats";

function Room({
  myInfo,
  userInfo,
  endCall,
  videoCamOffHandler,
  micOffHandler,
  switchCamera,
}) {
  const [notificationIndicator, setNotificationIndicator] = useState(false);
  const [showChats, setShowChat] = useState(false);
  const [volumeOff, setVolumeOff] = useState(false);
  const [hide, setHide] = useState(false);
  const [switchIcon, setSwitchIcon] = useState(false);

  //show red dot on top of chat icon on receiving new messages
  const notifyHandler = useCallback(() => {
    if (!showChats) {
      setNotificationIndicator(true);
    }
  }, [showChats]);

  //automatically hide icons after some time
  useEffect(() => {
    const show = () => {
      setHide((hide) => !hide);
    };
    window.addEventListener("click", show);
    let timeOut = null;
    if (!hide) {
      timeOut = setTimeout(() => {
        setHide(true);
      }, 10000);
    }
    return () => {
      if (timeOut) {
        clearTimeout(timeOut);
      }
      window.removeEventListener("click", show);
    };
  }, [hide]);

  //show icon only in mobile
  useEffect(() => {
    //no of cameras in a device.
    let cameras = 0;
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices.forEach((device) => {
        if (device.kind === "videoinput") {
          cameras++;
        }
        if (cameras > 1) {
          setSwitchIcon(true);
        }
      });
    });
  }, []);

  return (
    <div className="room">
      <div className="room__userVideo">
        <Video
          stream={myInfo.stream}
          userName={"You"}
          volumeOff={true}
          videoCamOff={myInfo.videoCamOff}
          micOff={myInfo.micOff}
          you
        />
      </div>
      <div className="room__box">
        <Video
          full
          id={userInfo.id}
          stream={userInfo.stream}
          videoCamOff={userInfo.videoCamOff}
          userName={hide ? false : userInfo.displayName}
          micOff={userInfo.micOff}
          volumeOff={volumeOff}
        />
      </div>
      <div className={`room__options ${hide && "hide"}`}>
        <div className="room__optionsContainer">
          <div className="room__icon" onClick={micOffHandler}>
            {myInfo.micOff ? <MicOff /> : <Mic />}
          </div>
          <div className="room__icon" onClick={videoCamOffHandler}>
            {myInfo.videoCamOff ? <VideocamOff /> : <VideocamIcon />}
          </div>
          <div className="room__icon endCall" onClick={endCall}>
            <CallEnd />
          </div>
          <div
            className={`room__icon ${switchIcon ? "volumeOff__icon" : ""}`}
            onClick={() => {
              setVolumeOff(!volumeOff);
            }}
          >
            {volumeOff ? <VolumeOff /> : <VolumeUp />}
          </div>

          {switchIcon && (
            <div
              className="room__icon switch__camera__mobile"
              onClick={switchCamera}
            >
              <FlipCameraIos />
            </div>
          )}
          <div
            className="room__icon chatIcon"
            onClick={() => {
              setShowChat(!showChats);
              setNotificationIndicator(false);
            }}
          >
            <Chat />
            {notificationIndicator && !showChats && (
              <FiberManualRecord className="chat__notify" />
            )}
          </div>
        </div>
      </div>
      <Chats
        addStyle={
          showChats ? { border: "solid 0.2px #a0a0a026" } : { maxHeight: "0px" }
        }
        displayName={myInfo.displayName}
        userID={userInfo.id}
        myID={myInfo.id}
        chatsHandler={() => setShowChat(!showChats)}
        notifyHandler={notifyHandler}
      />
    </div>
  );
}

export default Room;
