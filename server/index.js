
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from "cors";
import mongoConnect from './Config/mongoConnect.js';
import citizenAuthRoute from './Routes/Auth/citizenAuthRoutes.js';
import { verifyToken } from './Middlewares/auth.middleware.js';
import citizenRoute from './Routes/CitizenR/citizenRoutes.js';
import messageRoute from './Routes/CitizenR/messageRoutes.js';
import staffAuthRoutes from './Routes/Auth/staffAuthRoutes.js';
import getUserRoute from './Routes/Others/getUser.js';
import otpRoute from './Routes/Others/otpRoutes.js';
import adminRoute from './Routes/Admin/adminRoute.js';
import complaintRoute from './Routes/Complaint/complaintRoutes.js';
import notificationRoute from './Routes/Notification/notificationRoutes.js';
import { Message, Citizen } from './models/models.js';
import { isTokenValid } from './Utils/token.js';
import documentAnalysisRoute from './Routes/Others/documentAnalysisRoutes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const port = 3000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"], 
  allowedHeaders: ["Content-Type", "Authorization"] 
}));

mongoConnect();
app.use(express.json());
app.use(verifyToken);
app.use(getUserRoute);

// Routes
app.use("/otp", otpRoute);

// auth
app.use("/auth/citizen", citizenAuthRoute);
app.use("/auth/staff", staffAuthRoutes);

// citizen
app.use("/citizen", citizenRoute);
app.use("/citizen", messageRoute);

// admin
app.use("/admin", adminRoute);

app.use("/document", documentAnalysisRoute);

// complaints
app.use("/complaints", complaintRoute);

// notifications
app.use("/notifications", notificationRoute);

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = isTokenValid(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.userId = decoded.userId;
    socket.userType = decoded.type;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
const onlineUsers = new Map();

io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.userId}`);

  try {
    // Get user info
    const user = await Citizen.findById(socket.userId).select('displayName profilePicture');
    if (!user) {
      socket.disconnect();
      return;
    }

    const userInfo = {
      id: socket.userId,
      userId: socket.userId,
      displayName: user.displayName,
      profilePicture: user.profilePicture
    };

    // Add to online users
    onlineUsers.set(socket.userId, userInfo);
    
    // Join public room
    socket.join('public-room');

    // Notify others
    socket.to('public-room').emit('user-joined', userInfo);
    
    // Send online users list to the new user
    socket.emit('online-users', Array.from(onlineUsers.values()));

    // Broadcast updated online users list
    io.to('public-room').emit('online-users', Array.from(onlineUsers.values()));

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { content, room = 'public-room' } = data;
        
        if (!content || !content.trim()) {
          return;
        }

        const message = new Message({
          content: content.trim(),
          sender: socket.userId,
          senderName: user.displayName,
          room: room,
          messageType: 'text'
        });

        await message.save();

        const messageData = {
          _id: message._id,
          content: message.content,
          sender: message.sender,
          senderName: message.senderName,
          room: message.room,
          createdAt: message.createdAt,
          messageType: message.messageType
        };

        // Broadcast to room
        io.to(room).emit('new-message', messageData);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', () => {
      socket.to('public-room').emit('user-typing', userInfo);
    });

    socket.on('typing-stop', () => {
      socket.to('public-room').emit('user-stop-typing', userInfo);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      socket.to('public-room').emit('user-left', userInfo);
      io.to('public-room').emit('online-users', Array.from(onlineUsers.values()));
    });

  } catch (error) {
    console.error('Socket connection error:', error);
    socket.disconnect();
  }
});

httpServer.listen(port, () => { 
  console.log(`Server listening on port ${port}`);
  console.log(`Socket.io server ready`);
});