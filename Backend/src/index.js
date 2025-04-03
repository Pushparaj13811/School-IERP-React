import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "15kb" }));

app.use(cookieParser());

app.use(express.static("public"));

app.use(helmet());

app.use(xss());

app.use(mongoSanitize());   

app.use(hpp());

app.use(limiter());

app.use(compression()); 

app.use(express.static("public"));

app.use(express.static("public"));

app.use(express.static("public"));



export { app };