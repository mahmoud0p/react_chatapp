import dotenv from 'dotenv'
dotenv.config()
import express, { type Request, type Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"; 
import {router as userRouter} from '../routes/userRoutes' 
import path from "path"
import { Server } from "socket.io";
import http from "http"
import { addFriend,  addMessage,  getUser, seeMessage } from './dataBase_actions';
import {router as friendsRouter} from "../routes/friendsRoutes"
import {router as messagesRouter} from "../routes/messagesRoutes"
import bodyParser from 'body-parser';
const app = express();
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

app.use('/uploads' ,express.static(path.join(process.cwd(),'/uploads')));
app.use(cors({

  origin:['http://localhost:5173' , 'http://localhost:5174'] ,
  optionsSuccessStatus: 200 , 
  credentials: true
}));
const server = http.createServer(app)
export const io = new Server(server , { cors:{
  origin:['http://localhost:5173' , 'http://localhost:5174'] ,
  optionsSuccessStatus: 200 , 
  credentials: true
} });

app.use(cookieParser());
app.use('/api', userRouter);
app.use("/api" , friendsRouter)
app.use('/api' , messagesRouter)
const users = new Map()
const port = Number(process.env.APP_PORT) || 5000;
io.on('connection', (socket) => {
  
  socket.on("user_register", (data) => {
      const user_id = data;
      users.set(user_id, socket.id);
  });

  socket.on('join_chat', async(data) => {
      const chat_id = data.chat_id
      const user_id = data.user_id
      socket.join(chat_id );
      const messages =await seeMessage(chat_id ,user_id)
      if(messages?.length > 0){
        io.to(chat_id).emit('see_message')
      }
      console.log(`User ${socket.id} joined chat ${chat_id}`);
  });
 
  socket.on('send_friend_request', (data) => {
      const to = data.to;
      const from = data.from;
      addFriend(to, from);
      const friendSocketId = users.get(from);
      socket.to(friendSocketId).emit('receive_friend_request');
  });

  socket.on("send_message", async (data) => {     
      const from = data.from;
      const chat_id = data.chat_id;
      const content = data.content;
      const to  = data.to
      const socketId = users.get(to)
      const socketFrom = users.get(from)
      const room = io.sockets.adapter.rooms.get(chat_id)
      const isInRoom = room?.has(socketId)
      console.log("from " +from)
      if(isInRoom){
        const message = await addMessage(from, chat_id, content , to , "Seen");
        console.log('user is in room')
        io.to(chat_id).emit("receive_message", { 

          messageId: message ? message.id : crypto.randomUUID(), 
          sender_id: from, 
          content  , 
          status:"Seen"
        });

      }else{
        const message = await addMessage(from, chat_id, content ,to , "Delivered");

        io.to(chat_id).emit("receive_message", { 
          messageId: message ? message.id : crypto.randomUUID(), 
          sender_id: from, 
          content  , 
          status:"Delivered"
        });
      }
      io.to([socketId ,socketFrom ]).emit("receive_Notifications")
      
  });
  socket.on("leave_room" , (chat_id)=>{
    socket.leave(chat_id)
  })
  socket.on("disconnect", () => {
      console.log("user disconnected");
  });

});

server.listen(port ,()=>{
  console.log('SERVER RUNNING')
})