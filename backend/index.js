import Route from "./Routes.js";
import DBConnect from "./DB_Connect.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api",Route);
const startServer = async () => {
    try {
        await DBConnect();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database. Server not started.", error);
        process.exit(1);
    }
};

startServer();
