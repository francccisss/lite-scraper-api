"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https = __importStar(require("https"));
const auth_1 = require("./middlewares/auth");
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
require("dotenv/config");
const app = (0, express_1.default)();
const cookieParser = require("cookie-parser");
const api_routes = require("./routes/index");
const cors = require("cors");
const fs = require("fs");
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const chrome_extension_origin = "chrome-extension://pmnpcehiaohjmiklhlfnehlllnooijao";
const cors_options = {
    origin: chrome_extension_origin,
    methods: ["GET", "POST"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.set("trust proxy", true);
app.use(cors(cors_options));
app.use(cookieParser());
app.use(express_1.default.urlencoded());
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.DB_URI,
        collectionName: "sessions",
    }),
    secret: "1234",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 10000,
    },
}));
const http_options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
};
https.createServer(http_options, app).listen({ port: PORT, host: HOST }, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});
app.get("/", auth_1.auth, auth_1.create_client_session);
app.use("/api/v1/scraper", api_routes);
