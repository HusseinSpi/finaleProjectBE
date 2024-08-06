require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const NodeCache = require("node-cache");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const multer = require("multer");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Routes
const storiesRoutes = require("./routes/storiesRoutes");
const musicRoutes = require("./routes/musicRoutes");
const animalsGameRoutes = require("./routes/animalsGameRoutes");
const usersRoutes = require("./routes/userRoutes");
const recentActivityRoutes = require("./routes/recentActivityRoutes");
const wordsRoute = require("./routes/wordsRoutes");
const booksRoute = require("./routes/booksRoutes");
const videosRoute = require("./routes/videosRoutes");
const articlesRoute = require("./routes/articlesRoutes");
const drawRoute = require("./routes/drawRoutes");
const videoCallRoute = require("./routes/videoCallRoutes");

// Models
const Message = require("./models/messageModel");
const Draw = require("./models/drawModel");

// OpenAI
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const cache = new NodeCache({ stdTTL: 600 });

const whitelist = ["http://localhost:5173", "https://kiddofun.netlify.app"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/images", express.static("images"));
app.use("/sounds", express.static("sounds"));
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/stories", storiesRoutes);
app.use("/api/v1/music", musicRoutes);
app.use("/api/v1/animalsGame", animalsGameRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/recent-activities", recentActivityRoutes);
app.use("/api/v1/words", wordsRoute);
app.use("/api/v1/books", booksRoute);
app.use("/api/v1/videos", videosRoute);
app.use("/api/v1/articles", articlesRoute);
app.use("/api/v1/draws", drawRoute);
app.use("/api/v1/video-call", videoCallRoute);

const generateRoomNumber = async () => {
  let roomNumber;
  let isUnique = false;

  while (!isUnique) {
    roomNumber = crypto.randomBytes(3).toString("hex");
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
      model: "gpt-4o-mini",
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

app.post("/api/v1/analyzeDrawing", async (req, res, next) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return next(new AppError("Image URL is required", 400));
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this child's drawing and describe in detail the feelings the child may feel. Please provide a comprehensive analysis that includes possible reasons for these feelings, any important phrases or words that stand out, and any contextual clues that may indicate the child's mental state",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    const responseContent = response.choices[0].message.content;

    res.status(200).json({
      status: "success",
      data: responseContent,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/api/v1/upload", upload.single("image"), async (req, res, next) => {
  try {
    const user = req.body.user;

    if (!user) {
      return next(new AppError("User is required", 400));
    }

    if (!req.file) {
      return next(new AppError("Image file is required", 400));
    }

    console.log(req.file.path);
    const imageUrl = `https://finaleprojectbe.onrender.com/${req.file.path}`;

    const response = await fetch(
      "https://finaleprojectbe.onrender.com/api/v1/analyzeDrawing",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      }
    );

    const responseData = await response.json();

    console.log(responseData);
    if (!response.ok) {
      throw new Error(responseData.message || "Error analyzing drawing");
    }

    const newDraw = await Draw.create({
      name: req.file.filename,
      user,
      analysis: responseData.data,
    });

    res.status(200).json({
      status: "success",
      message: "Image uploaded and data saved successfully",
      data: newDraw,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
