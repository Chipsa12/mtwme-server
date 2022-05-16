require('dotenv').config();
const express = require('express');
const fileUpload = require("express-fileupload");
const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT;
const authRouter = require("./routes/auth.routes")
const logRouter = require("./routes/log.routes")
const fileRouter = require("./routes/file.routes")
const postRoutes = require("./routes/post.routes")
const messageRoutes = require("./routes/message.routes")
const conversationRoutes = require("./routes/conversation.routes")
const corsMiddleware = require('./middleware/cors.middleware');
const filePathMiddleware = require('./middleware/filePath.middleware');
const path = require('path');
app.use(fileUpload({}))
app.use(corsMiddleware)
app.use(filePathMiddleware(path.resolve(__dirname, 'static')))
app.use(express.json())
app.use(express.static('static'))
app.use("/api/auth", authRouter)
app.use("/api/log", logRouter)
app.use("/api/files", fileRouter)
app.use("/api/post", postRoutes)
app.use("/api/message", messageRoutes)
app.use("/api/conversation", conversationRoutes)

const io = require("socket.io")(process.env.PORT_SOCKET, {
    cors: {
      origin: process.env.CLIENT_URL,
      method: ["GET", "POST"],
    },
  });
  
  let users = [];
  let chats = [];

  const addUser = (userId, socketId, currentRoom) => {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId, currentRoom });
  };
  
  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };
  
  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  
  io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.");
  
    socket.on("join_room", (data) => {
      const {userId, roomId} = data;
      addUser(userId, socket.id, roomId);
      console.log(users)
      const chat = chats.filter(chat => chat.userId === userId)
      if (chat.length) {
        chats = chats.filter(chat => chat.userId !== userId)
        chats.push(data)
        socket.leave(chat[0].roomId)
        socket.join(roomId);
      } else{
        chats.push(data)
        socket.join(roomId);
      }
      console.log(chats)
      console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    });
  
    socket.on("send_message", (data) => {
      socket.to(data.roomId).emit("receive_message", data);
    });
  
    //when disconnect
    socket.on("disconnect", () => {
      const user = users.filter(user => user.socketId === socket.id);
      if (user.length) {
        const chat = chats.filter(chat => chat.userId === user[0].userId)
        if (chat.length) {
          socket.leave(chat[0].roomId)
        }
        removeUser(socket.id);
      }
      console.log("a user disconnected!");
    });
});


const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log('Server started on port ', PORT)
        })
        
    } catch (e) {
        console.log(e)
    }
}

start()