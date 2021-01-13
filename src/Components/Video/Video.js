import { MicOff, VideocamOff } from "@material-ui/icons";
import React, { useEffect, useRef } from "react";
import "./Video.css";
import { truncate } from "../../Utils/truncate";

function Video({
  stream,
  id,
  userName,
  volumeOff,
  videoCamOff,
  micOff,
  full,
  you,
  addStyle,
}) {
  const Video = useRef();

  useEffect(() => {
    if (videoCamOff) {
      if (stream && stream.getVideoTracks().length > 0) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
      }
    } else {
      if (stream && stream.getVideoTracks().length > 0) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
      }
    }
    if (micOff || volumeOff) {
      if (stream && stream.getAudioTracks().length > 0) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
    } else {
      if (stream && stream.getAudioTracks().length > 0) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
      }
    }
    Video.current.srcObject = stream;
    const playVideo = () => {
      Video.current.play();
      if (volumeOff) {
        Video.current.muted = true;
      }
    };
    Video.current.addEventListener("loadedmetadata", playVideo);
    const VideoElement = Video.current;
    return () => {
      VideoElement.removeEventListener("loadedmetadata", playVideo);
    };
  }, [stream, volumeOff, micOff, videoCamOff]);

  return (
    <div className={`video ${full ? "fullScreen" : ""}`}>
      <video //controls
        style={addStyle}
        autoPlay
        ref={Video}
        muted={volumeOff}
      ></video>
      {videoCamOff && (
        <div className="video__stopped">{you && <VideocamOff />}</div>
      )}
      {userName && (
        <div className="video__user">
          {!you && (
            <div className="video__info">
              {videoCamOff && <VideocamOff />}
              {micOff && <MicOff />}
            </div>
          )}
          <div className="video__userName">
            {truncate(userName, 30)}
            {id && <div className="video__userID">ID : {id}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Video;
