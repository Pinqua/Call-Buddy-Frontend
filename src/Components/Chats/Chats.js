import { Close, Send } from "@material-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import "./Chats.css";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

function Chats({
  chatsHandler,
  style,
  userID,
  myID,
  notifyHandler,
  displayName,
}) {
  const [chats, setChats] = useState([]);
  const [msg, setMsg] = useState("");
  const socket = useRef();
  const chatsContainer = useRef();

  const chatHandler = (e) => {
    e.preventDefault();
    const new_msg = {
      id: uuidv4(),
      name: displayName,
      msg: msg,
      time: moment().format("LLL"),
    };
    socket.current.emit("chat-message", new_msg, userID);
    setChats((chats) => [...chats, new_msg]);
    setMsg("");

    chatsContainer.current.scrollTo(
      0,
      chatsContainer.current.scrollHeight - chatsContainer.current.clientHeight
    );
  };

  useEffect(() => {
    socket.current = io("https://call-buddy.herokuapp.com/chats");
    //socket.current = io("https://localhost:9000/chats");
    socket.current.on("connect", () => {
      socket.current.emit("join-chat", myID);
      socket.current.on("chat-msg", (msg) => {
        setChats((chats) => [...chats, msg]);
        notifyHandler();
        chatsContainer.current.scrollTo(
          0,
          chatsContainer.current.scrollHeight -
            chatsContainer.current.clientHeight
        );
      });
    });

    chatsContainer.current.scrollTo(
      0,
      chatsContainer.current.scrollHeight - chatsContainer.current.clientHeight
    );

    const Socket = socket.current;
    return () => {
      Socket.removeAllListeners();
    };
  }, [myID, notifyHandler]);

  return (
    <div className="chats__container" style={style}>
      <div className="chats__top">
        Chats
        <Close onClick={chatsHandler} className="chats__close" />
      </div>
      <div className="chats" ref={chatsContainer}>
        {chats.map((msg) => (
          <div className="chats__message" key={msg.id}>
            <div className="chats__username">{msg.name}</div>
            {msg.msg}
            <div className="chats__time">{msg.time}</div>
          </div>
        ))}
      </div>
      <div className="chats__bottom">
        <form onSubmit={chatHandler}>
          <input
            type="text"
            placeholder="Type a message"
            value={msg}
            required
            onChange={(e) => setMsg(e.target.value)}
          />
          <button type="submit" className="chat__submit">
            <Send />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chats;
