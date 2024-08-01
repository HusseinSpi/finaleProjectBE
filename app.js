require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const NodeCache = require("node-cache");
const crypto = require("crypto");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tesseract = require("tesseract.js");
const axios = require("axios");

const storiesRoutes = require("./routes/storiesRoutes");
const musicRoutes = require("./routes/musicRoutes");
const animalsGameRoutes = require("./routes/animalsGameRoutes");
const usersRoutes = require("./routes/userRoutes");
const recentActivityRoutes = require("./routes/recentActivityRoutes");
const wordsRoute = require("./routes/wordsRoutes");
const booksRoute = require("./routes/booksRoutes");
const videosRoute = require("./routes/videosRoutes");

const Message = require("./models/messageModel");

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const cache = new NodeCache({ stdTTL: 600 });

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/images", express.static("images"));
app.use("/sounds", express.static("sounds"));

app.use("/api/v1/stories", storiesRoutes);
app.use("/api/v1/music", musicRoutes);
app.use("/api/v1/animalsGame", animalsGameRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/recent-activities", recentActivityRoutes);
app.use("/api/v1/words", wordsRoute);
app.use("/api/v1/books", booksRoute);
app.use("/api/v1/videos", videosRoute);

const generateRoomNumber = async () => {
  let roomNumber;
  let isUnique = false;

  while (!isUnique) {
    roomNumber = crypto.randomBytes(3).toString("hex");
    console.log(roomNumber);
    const existingRoom = await Message.findOne({ room: roomNumber });
    if (!existingRoom) {
      isUnique = true;
    }
  }

  return roomNumber;
};

app.get("/api/v1/getRoomNumber", async (req, res) => {
  try {
    const roomNumber = await generateRoomNumber();
    res.status(200).json({ roomNumber });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate room number" });
  }
});

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      'To create an account, click on the "Sign Up" button on the top right corner and fill in the required details.',
  },
  {
    question: "How do I reset my password?",
    answer:
      'To reset your password, click on "Forgot Password" on the login page and follow the instructions.',
  },
];

app.post("/api/v1/openai", async (req, res, next) => {
  try {
    if (!req.body.message) {
      return next(new AppError("Message content is required", 400));
    }

    const userMessage = req.body.message;

    const faq = faqs.find(
      (f) => f.question.toLowerCase() === userMessage.toLowerCase()
    );
    if (faq) {
      return res.status(200).json({
        status: "success",
        data: faq.answer,
      });
    }

    const cachedResponse = cache.get(userMessage);
    if (cachedResponse) {
      return res.status(200).json({
        status: "success",
        data: cachedResponse,
      });
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: userMessage }],
      model: "gpt-4",
      max_tokens: 100,
    });

    const responseContent = completion.choices[0].message.content;
    cache.set(userMessage, responseContent);

    res.status(200).json({
      status: "success",
      data: responseContent,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post(
  "/api/v1/analyzeDrawing",
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError("Image file is required", 400));
      }

      const imageBuffer = await sharp(req.file.buffer)
        .resize({ width: 512, height: 512 })
        .toBuffer();

      const {
        data: { text },
      } = await tesseract.recognize(imageBuffer, "eng");

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `${req.file} Analyze this child's drawing and describe in detail the feelings the child may feel. Please provide a comprehensive analysis that includes possible reasons for these feelings, any important phrases or words that stand out, and any contextual clues that may indicate the child's mental state`,
          },
        ],
        model: "gpt-4",
        max_tokens: 500,
      });

      const responseContent = completion.choices[0].message.content;

      res.status(200).json({
        status: "success",
        data: {
          text,
          analysis: responseContent,
        },
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
