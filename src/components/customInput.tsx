import { useEffect, useRef } from "react";

export default function CustomInput(
    props: React.DetailedHTMLProps<
        React.TextareaHTMLAttributes<HTMLTextAreaElement>,
        HTMLTextAreaElement
    >
) {
    const writer = useRef<HTMLElement | null>(null);
    function nl2br(txt: string) {
        return txt.replace(/\n/g, "<br />");
    }
    function updateWriter(tw: string, cursor: number) {
        if (!writer.current) return;
        writer.current.innerHTML = nl2br(
            tw.slice(0, cursor).replace(/(\s)/g, "&nbsp") +
                `<b class="cursor" cursor="<?>"></b>` +
                tw.slice(cursor + 3, tw.length).replace(/(\s)/g, "&nbsp")
        );
    }
    useEffect(() => {
        updateWriter("", 0);
    }, [writer]);
    const moveIt: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        updateWriter(
            event.currentTarget.value,
            event.currentTarget.selectionStart
        );
    };
    return (
        <>
            <textarea
                {...props}
                onKeyDown={(even) => {
                    moveIt(even);
                    if (props.onKeyDown) props.onKeyDown(even);
                }}
                onKeyUp={(even) => {
                    moveIt(even);
                    if (props.onKeyUp) props.onKeyUp(even);
                }}
                id="setter"
                autoFocus
            ></textarea>
            <li>
                <span ref={writer}>
                    <b className="cursor"></b>
                </span>
            </li>
        </>
    );
}
