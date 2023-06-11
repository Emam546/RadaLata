import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import CustomInput from "@src/components/customInput";
import { MessageType, Messages } from "@src/types";
import Message from "@src/components/Message";
import { MESSAGE_EMIT, SEND_EMIT } from "@serv/constants";
import Head from "next/head";
const socket = io();
const timeToWait = 60 * 3 * 1000;

function App() {
    const [isConnected, setIsConnected] = useState(false);

    const [messages, setMessages] = useState<Messages>([]);
    const [timeout, setGetMessage] = useState<ReturnType<typeof setTimeout>>();
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
        socket.on(MESSAGE_EMIT, (msg) => {
            appendMessage(msg);
        });
        socket.emit(SEND_EMIT);
        setIsConnected(socket.connected);
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off(MESSAGE_EMIT);
        };
    }, []);
    function requestMessage() {
        setGetMessage((pre) =>
            setTimeout(() => {
                socket.emit(SEND_EMIT);
                if (pre) clearInterval(pre);
            }, timeToWait)
        );
    }
    const sendMessage = (msg: string) => {
        socket.emit(MESSAGE_EMIT, msg);
    };
    return (
        <>
            <Head>
                <title>RadaLata</title>
            </Head>
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
                    {isConnected && (
                        <CustomInput
                            onBlur={(event) => {
                                event.currentTarget.focus();
                            }}
                            onKeyDown={(e) => {
                                if (e.keyCode == 13) {
                                    e.preventDefault();
                                    sendMessage(e.currentTarget.value);
                                    appendMessage(
                                        e.currentTarget.value,
                                        "SEND"
                                    );
                                    requestMessage();
                                    e.currentTarget.value = "";
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
