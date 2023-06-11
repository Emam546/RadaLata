import { useEffect, useState } from "react";
import { Messages } from "@src/types";

export default function Message({ msg, _type }: Messages[0]) {
    const [curMsg, setCurMsg] = useState(_type == "SEND" ? msg : "");
    useEffect(() => {
        const interval = setInterval(() => {
            setCurMsg((pre) => {
                if (pre.length < msg.length) {
                    return pre + msg.charAt(pre.length);
                } else clearInterval(interval);
                return pre;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [msg]);
    return <li>{curMsg}</li>;
}
