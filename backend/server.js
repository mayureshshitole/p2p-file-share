import express from "express";
import { createServer } from "http";
import { route } from "./routes/routes.js";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });
const jwtSecret = "secretjwt";
// const roomCreators=new Map()

app.use(cors({ origin: "http://localhost:5173" }));
app.use("/", route);

io.on("connection", (socket) => {
  console.log("a user connected->" + socket.id);
  console.log("--------------------------");

  socket.on("message", (msg) => {
    console.log(msg);
    socket.broadcast.emit("receive", msg);
  });

  socket.on("create-room", (data) => {
    socket.join(data.uid);
    let roomArray = io.sockets.adapter.rooms.get(data.uid);
    let otherUsers = Array.from(roomArray).filter((id) => id !== socket.id);
    io.to(data.uid).emit("other-users", otherUsers);
    console.log(data);
    // socket.to(data.uid).emit("fs-meta", data.buffer);
    // roomCreators.set(data.uid, socket.id);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log("user joined the room ->" + room);
    let roomArray = io.sockets.adapter.rooms.get(room);
    let otherUsers = Array.from(roomArray).filter((id) => id !== socket.id);
    // io.to(room).emit("user-count", roomArray.size);
    io.to(room).emit("other-users", otherUsers);
    io.to(room).emit("my-id", socket.id);
    // console.log(io.sockets.adapter.rooms['join-room'].length)
  });

  socket.on("file-meta", (data) => {
    console.log(data);
    socket.to(data.uid).emit("fs-meta", data);
  });

  socket.on("fileBuffer", (data) => {
    const { room, buffer } = data;
    // Relay the buffer to all users in the room
    io.to(room).emit("fileBuffer", buffer);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server started on 5000");
});
