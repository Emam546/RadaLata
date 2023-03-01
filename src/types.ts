export type MessageType = "REC" | "SEND";
export type Messages = { msg: string; _type: MessageType }[];
export type EmitMessages = {
    msg_emit: string;
    send_emit: string;
};