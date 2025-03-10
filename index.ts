import express from "express";
import { mainApp } from "./mainApp";


const app = express();

const port: number = parseInt(process.env.PORT!) || 5770


mainApp(app)
const server = app.listen(port, () => {
    console.log(`❤️  ❤️`)
})

process.on("uncaughtException", (error: any) => {
    console.log(`Server is shutting down due to an uncaught exception: ${error?.message}`)

    process.exit(0);
})

process.on("unhandledRejection", (reason: any) => {
    console.log(`Server is shutting down due to an unhandled rejection: ${reason?.message}`);

    server.close(() => {
        process.exit(0)
    })
})