import { Server, Socket } from "socket.io";
import http from "http";
import { Questions } from "@serv/socket/Question";
import { MESSAGE_EMIT, SEND_EMIT } from "@serv/constants";
import cache from "memory-cache";
import express, { Express } from "express";
import { questions } from "./init.json";
interface Question {
    msg: string;
    time: number;
    sender: Socket["id"];
}
enum MESSAGE_STATES {
    QUESTION,
    ANSWER,
}

function messageKind(msg: string): MESSAGE_STATES {
    if (msg.endsWith("?")) return MESSAGE_STATES.QUESTION;
    return MESSAGE_STATES.ANSWER;
}
export class IoServer {
    QuestionArray: Questions<Question>;
    server: Express;
    private io: Server;
    app: http.Server;
    constructor() {
        this.server = express();
        this.app = http.createServer(this.server);
        this.io = new Server(this.app);
        this.QuestionArray = new Questions(5000);
        this.QuestionArray.push(
            ...questions.map((msg) => {
                return {
                    msg,
                    time: Date.now(),
                    sender: "",
                };
            })
        );
        this.io.on("connection", (socket) => {
            socket.on("disconnect", () => {
                cache.del(socket.id + "QA");
                cache.del(socket.id + "QR");
                this.QuestionArray.filter(
                    (que: Question) => que.sender == socket.id
                );
            });
            socket.on(MESSAGE_EMIT, (msg: string) => {
                msg = msg.toUpperCase();
                if (msg)
                    switch (messageKind(msg)) {
                        case MESSAGE_STATES.QUESTION:
                            this.RECEIVE_QUESTION(socket, msg);
                            break;
                        case MESSAGE_STATES.ANSWER:
                            this.RECEIVE_ANSWER(socket, msg);
                            break;
                    }
            });
            socket.on(SEND_EMIT, () => {
                this.sendRandomQuestion(socket);
            });
        });
        // this.server.listen = app.listen;
        // Additional initialization or configuration
    }
    RECEIVE_ANSWER(socket: Socket, msg: string) {
        let data = cache.get(socket.id + "QR");
        if (data) {
            const res: Question = JSON.parse(data);
            const sender = this.io.sockets.sockets.get(res.sender);
            if (sender && sender.connected) {
                data = cache.get(sender.id + "QA");
                if (data == res.msg) sender.emit(MESSAGE_EMIT, msg);
            }
        }

        this.sendRandomQuestion(socket);
    }
    RECEIVE_QUESTION(socket: Socket, msg: string) {
        this.QuestionArray.enqueue({
            msg,
            sender: socket.id,
            time: Date.now(),
        });
        cache.put(socket.id + "QA", msg);
    }
    sendRandomQuestion(socket: Socket) {
        for (let i = 0; i < 10; i++) {
            const res = this.QuestionArray.dequeue();
            if (res) {
                if (res.sender != socket.id) {
                    cache.put(socket.id + "QR", JSON.stringify(res));
                    socket.emit(MESSAGE_EMIT, res.msg);
                    return;
                }
            } else
                return socket.emit(
                    MESSAGE_EMIT,
                    "ASK A WEIRD QUESTION TO EVERYONE"
                );
        }
        socket.emit(MESSAGE_EMIT, "ASK A WEIRD QUESTION TO EVERYONE");
    }
}
export function ioExpress() {
    const io = new IoServer();
    return io.server;
}
