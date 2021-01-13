import React from "react";
import "./CallUI.css";
import {
  Call,
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
} from "@material-ui/icons";
import { truncate } from "../../Utils/truncate";

function CallUI({
  displayName,
  id,
  incoming,
  music,
  answerCall,
  rejectCall,
  myInfo,
  videoCamOffHandler,
  micOffHandler,
}) {
  return (
    <div
      className={`${
        incoming ? "call__incomingCall" : "call__outgoingCall"
      } callUI`}
    >
      <div className="call__user">
        {truncate(displayName, 30)}
        <div className="call__userID">ID - {id}</div>
        <span className="call__info">{incoming ? "Incoming" : "Calling"}</span>
      </div>
      <div className="call__options">
        {incoming && (
          <div className="call__option call__answer" onClick={answerCall}>
            <Call />
          </div>
        )}
        {!incoming && (
          <div className="call__option call__end" onClick={rejectCall}>
            <CallEnd />
          </div>
        )}
        <div className="call__option" onClick={videoCamOffHandler}>
          {myInfo.videoCamOff ? <VideocamOff /> : <Videocam />}
        </div>
        <div className="call__option" onClick={micOffHandler}>
          {myInfo.micOff ? <MicOff /> : <Mic />}
        </div>
        {incoming && (
          <div className="call__option call__end" onClick={rejectCall}>
            <CallEnd />
          </div>
        )}
      </div>
      {/* music for incoming and outgoing calls */}
      <audio
        src={music}
        autoPlay
        loop
        style={{ maxWidth: "0", maxHeight: "0", width: "0", height: "0" }}
      ></audio>
    </div>
  );
}

export default CallUI;
