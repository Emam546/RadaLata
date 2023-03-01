import { Server, Socket } from "socket.io";
import express from "express";
import http from "http";
import cors from "cors";
import { Questions } from "./Question";
import EnvVars from "./declarations/major/EnvVars";
import logger from "jet-logger";
import {MESSAGE_EMIT,SEND_EMIT} from "./constants"
import path from "path";
const redis = require("redis");
const app = express();
const server = http.createServer(app);
const DB = redis.createClient();
const io = new Server(
    server,
    EnvVars.nodeEnv == "development" && {
        cors: {
            origin: "*",
        },
    }
);

if (EnvVars.nodeEnv == "development") {
    logger.imp("Cors Open");
    app.use(cors());
}

interface Question {
    msg: string;
    time: number;
    sender: string;
}
const QuestionArray = new Questions<Question>();

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        DB.del(socket.id + "QA");
        DB.del(socket.id + "QR");
        QuestionArray.removeIf((que: Question) => que.sender == socket.id);
    });
    socket.on(MESSAGE_EMIT, (msg: string) => {
        msg = msg.toUpperCase();
        if (msg)
            switch (messageKind(msg)) {
                case MESSAGE_STATES.QUESTION:
                    GET_QUESTION(socket, msg);
                    break;
                case MESSAGE_STATES.ANSWER:
                    GET_ANSWER(socket, msg);
                    break;
            }
    });
    socket.on(SEND_EMIT, () => {
        sendRandomQuestion(socket);
    });
    logger.info("User connected");
});
async function GET_QUESTION(socket: Socket, msg: string) {
    QuestionArray.enqueue({ msg, sender: socket.id, time: Date.now() });
    await DB.set(socket.id + "QA", msg);
}
async function GET_ANSWER(socket: Socket, msg: string) {
    DB.get(socket.id + "QR", (err: any, data: string) => {
        if (data) {
            let res: Question = JSON.parse(data);
            let sender = io.sockets.sockets.get(res.sender);
            if (sender && sender.connected) {
                DB.get(sender.id + "QA", (err: any, data: string) => {
                    if (data == res.msg && sender)
                        sender.emit(MESSAGE_EMIT, msg);
                });
            }
        }
    });
    sendRandomQuestion(socket);
}

function sendRandomQuestion(socket: Socket) {
    DB.get(socket.id + "QR", (err: any, data: string) => {
        let msg: string | null = null;
        if (data) msg = JSON.parse(data).msg;

        for (let i = 0; i < 10; i++) {
            let res = QuestionArray.dequeue();
            if (res) {
                if (res.sender != socket.id && res.msg != msg) {
                    sendQuestion(socket, res);
                    break;
                }
            } else {
                socket.emit(MESSAGE_EMIT, "ASK A WEIRD QUESTION TO EVERYONE");
                break;
            }
        }
    });
}
async function sendQuestion(socket: Socket, msg: Question) {
    await DB.set(socket.id + "QR", JSON.stringify(msg));
    socket.emit(MESSAGE_EMIT, msg.msg);
}
enum MESSAGE_STATES {
    QUESTION,
    ANSWER,
}
function messageKind(msg: string): MESSAGE_STATES {
    if (msg.endsWith("?")) return MESSAGE_STATES.QUESTION;
    return MESSAGE_STATES.ANSWER;
}
app.get("/api/info/emits",(req,res)=>{
    res.send({
        "msg_emit":MESSAGE_EMIT,
        "send_emit":SEND_EMIT
    })
})
app.use(express.static(path.join(__dirname,"./public")));
export default server;
