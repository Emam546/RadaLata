import { useEffect, useRef, useState } from "react";
import "./App.scss";
import io from "socket.io-client";
import CustomInput from "./componnents/customInput";
import { EmitMessages, MessageType, Messages } from "./types";
import Message from "./componnents/Message";
const socket = io();
const timeToWait = 60 * 3 * 1000;
const useEmitMessages = () => {
    const [data, setData] = useState<EmitMessages | null>(null);
    useEffect(() => {
        fetch(`/api/info/emits`).then((res) => {
            res.json().then((data) => {
                setData(data);
            });
        });
    }, []);
    return data;
};
function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const emitMessages = useEmitMessages();
    const [messages, setMessages] = useState<Messages>([]);
    const [timeout, setGetMessage] = useState<number | null>(null);
    function appendMessage(msg: string, _type: MessageType = "REC") {
        setMessages((pre) => [...pre, { msg, _type }]);
    }
    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
        });
        socket.on("disconnect", () => {
            setIsConnected(false);
        });
        if (!emitMessages) return;
        socket.on(emitMessages.msg_emit, (msg) => {
            appendMessage(msg);
            console.log("Message");
        });
        socket.emit(emitMessages.send_emit);
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off(emitMessages.msg_emit);
        };
    }, [emitMessages]);
    function requestMessage() {
        if (!emitMessages) return;
        setGetMessage((pre) =>
            setTimeout(() => {
                socket.emit(emitMessages.send_emit);
                if (pre != null) clearInterval(pre);
            }, timeToWait)
        );
    }
    const sendMessage = (msg: string) => {
        if (!emitMessages) return;
        socket.emit(emitMessages.msg_emit, msg);
    };
    return (
        <>
            <div className="body-container">
                <ul>
                    <li>Connecting ....</li>
                    {messages.map((msg, i) => {
                        return (
                            <Message
                                {...msg}
                                key={i}
                            />
                        );
                    })}
                    {isConnected && emitMessages != null && (
                        <CustomInput
                            onBlur={(event) => {
                                event.currentTarget.focus();
                            }}
                            onKeyDown={(event) => {
                                if (event.keyCode == 13) {
                                    event.preventDefault();
                                    sendMessage(event.currentTarget.value);
                                    appendMessage(
                                        event.currentTarget.value,
                                        "SEND"
                                    );
                                    requestMessage();
                                    event.currentTarget.value = "";
                                }
                            }}
                        />
                    )}
                </ul>
            </div>
        </>
    );
}

export default App;
