const terminalDoc = document.querySelector("#termynal")
CreateInputField()
const terminalController = new Terminal(terminalDoc, { cursor: "<?>" ,noInit:true});
const socket = io();
socket.on("Message", message => appendMessage(message));
var time=0;
function setFocusToTextBox() {
    var textbox = document.querySelector("[contenteditable]");
    if (textbox) {
        textbox.focus();
        // textbox.scrollIntoView();
    }
    setTimeout(setFocusToTextBox, 1000)
}
function CreateInputField() {
    let span = document.createElement("span")
    span.setAttribute("contenteditable", "true");
    span.setAttribute("data-ty", "input");
    span.setAttribute("data-ty", "input");
    span.setAttribute("onkeypress", "onTextChange(this);");
    terminalDoc.append(span)
    return span
}
function RemoveInputField(obj) {
    obj = obj || document.querySelector("[contenteditable]");
    obj.removeAttribute("contenteditable");
    obj.removeAttribute("onkeypress");
    return obj
}
function MessageToServer(msg) {
    socket.emit("Message", msg);
}
function onTextChange(obj) {
    var key = window.event.keyCode;
    if (key === 13) {
        MessageToServer(obj.textContent)
        RemoveInputField(obj);
        CreateInputField();
        time=-6000;
        return false;
    }
    else
        return true;

}
function IDLE_TIME() {
    if(time>=30000){
        time=0;
        socket.emit("SEND",null)
    }
    time+=1000
    setTimeout(IDLE_TIME,1000)
    // 1000 milliseconds = 1 second
}
async function appendMessage(msg) {
    obj = RemoveInputField();
    let text = obj.textContent;
    obj.textContent = msg;
    await terminalController.type(obj);
    CreateInputField().textContent = text;
}
setTimeout(setFocusToTextBox, 1000);
IDLE_TIME()