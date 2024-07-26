const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/messageModel");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, ":", err.message);
  server.close(() => {
    process.exit(1);
  });
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
});

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const closedRooms = new Set();

io.on("connection", (socket) => {
  socket.on("joinRoom", async (userId, roomNumber) => {
    socket.join(roomNumber);
    console.log(`User ${userId} joined room ${roomNumber}`);
    const messages = await Message.find({
      roomNumber: roomNumber,
    }).sort({ timestamp: 1 });

    socket.emit("loadMessages", messages);
    if (closedRooms.has(roomNumber)) {
      socket.emit("roomEnded", roomNumber);
    }
  });

  socket.on("sendMessage", async ({ senderId, roomNumber, message }) => {
    if (!roomNumber || !senderId || !message) {
      console.error(
        "Missing required fields: senderId, roomNumber, or message."
      );
      return;
    }

    if (closedRooms.has(roomNumber)) {
      console.error(`Room ${roomNumber} is closed. No new messages allowed.`);
      socket.emit("roomClosed", roomNumber);
      return;
    }

    try {
      const newMessage = await Message.create({
        senderId,
        message,
        roomNumber,
      });
      io.to(roomNumber).emit("receiveMessage", newMessage);
    } catch (error) {
      if (error.code === 11000) {
        console.error("Duplicate key error: ", error.message);
      } else {
        console.error("Error creating message: ", error.message);
      }
    }
  });

  socket.on("getRooms", async () => {
    const rooms = await Message.aggregate([
      {
        $group: {
          _id: "$roomNumber",
          firstMessage: { $first: "$message" },
          firstMessageDate: { $first: "$timestamp" },
        },
      },
      {
        $match: {
          _id: { $nin: Array.from(closedRooms) },
        },
      },
    ]);

    socket.emit("loadRooms", rooms);
  });

  socket.on("getUserRooms", async (userId) => {
    try {
      const userRooms = await Message.aggregate([
        { $match: { senderId: userId } },
        {
          $group: {
            _id: "$roomNumber",
            firstMessage: { $first: "$message" },
            firstMessageDate: { $first: "$timestamp" },
          },
        },
      ]);
      socket.emit("loadUserRooms", userRooms);
    } catch (error) {
      console.error("Error fetching user rooms: ", error.message);
    }
  });

  socket.on("endRoom", async (roomNumber) => {
    closedRooms.add(roomNumber);
    io.to(roomNumber).emit("roomEnded", roomNumber);
  });
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, ":", err.message);
  server.close(() => {
    process.exit(1);
  });
});
