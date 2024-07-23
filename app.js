require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const NodeCache = require("node-cache");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const storiesRoutes = require("./routes/storiesRoutes");
const musicRoutes = require("./routes/musicRoutes");
const animalsGameRoutes = require("./routes/animalsGameRoutes");
const usersRoutes = require("./routes/userRoutes");

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const cache = new NodeCache({ stdTTL: 600 });

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again later",
});

app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(limiter);

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
      // temperature: 0.7, // Example of adding creativity level
      // top_p: 0.9,       // Example of using nucleus sampling
      // n: 1,             // To get a single response
      // stop: ["\n"],     // Example of specifying a stop sequence
      // presence_penalty: 0.5,  // To reduce topic repetition
      // frequency_penalty: 0.5  // To reduce word repetition
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

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
