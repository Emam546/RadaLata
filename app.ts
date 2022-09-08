import { Socket } from "./node_modules/socket.io/dist/socket";
import { Server } from "socket.io";
import express from "express"
import http from "http";
const redis = require("redis")
import { Questions } from "./Question"
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const DB = redis.createClient();
const MESSAGE_EMIT = "Message"

interface Question {
    msg: string,
    time: number,
    sender: string
}
const QuestionArray = new Questions<Question>();
app.use(express.static("./public"));
io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        DB.del(socket.id + "QA");
        DB.del(socket.id + "QR");
        QuestionArray.removeIf((que: Question) => que.sender == socket.id)
    });
    socket.on(MESSAGE_EMIT, (msg: string) => {
        msg = msg.toUpperCase()
        if (msg)
            switch (messageKind(msg)) {
                case MESSAGE_STATES.QUESTION:
                    GET_QUESTION(socket, msg)
                    break;
                case MESSAGE_STATES.ANSWER:
                    GET_ANSWER(socket, msg)
                    break;
            }
    });
    socket.on("SEND", () => {
        sendRandomQuestion(socket);
    })
    sendRandomQuestion(socket)

});
async function GET_QUESTION(socket: Socket, msg: string) {
    QuestionArray.enqueue({ msg, sender: socket.id, time: Date.now(), });
    await DB.set(socket.id + "QA", msg)
}
async function GET_ANSWER(socket: Socket, msg: string) {
    DB.get(socket.id + "QR", (err: any, data: string) => {
        if (data) {
            console.log(data);
            let res: Question = JSON.parse(data);
            let sender = io.sockets.sockets.get(res.sender);
            if (sender && sender.connected) {
                DB.get(sender.id + "QA", (err: any, data: string) => {
                    if (data == res.msg && sender)
                        sender.emit(MESSAGE_EMIT, msg);

                })

            }
        }
    })

    sendRandomQuestion(socket);

}

function sendRandomQuestion(socket: Socket) {
    DB.get(socket.id + "QR", (err: any, data: string) => {
        let msg: string | null = null;
        if (data) {
            msg = JSON.parse(data).msg;
        }
        for (let i = 0; i < 10; i++) {
            let res = QuestionArray.dequeue();
            if (res) {
                if (res.sender != socket.id && res.msg != msg) {
                    sendQuestion(socket, res)
                    break;
                }
            } else {
                socket.emit(MESSAGE_EMIT, "ASK A WEIRD QUESTION TO ALL PEOPLE");
                break;
            }
        }
    })


}
async function sendQuestion(socket: Socket, msg: Question) {
    await DB.set(socket.id + "QR", JSON.stringify(msg));
    socket.emit(MESSAGE_EMIT, msg.msg);
}
enum MESSAGE_STATES {
    QUESTION,
    ANSWER
}
function messageKind(msg: string): MESSAGE_STATES {
    if (msg.endsWith("?"))
        return MESSAGE_STATES.QUESTION;

    return MESSAGE_STATES.ANSWER
}
server.listen(3000, () => {
    console.log("listening on http://localhost:3000");
});