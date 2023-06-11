import { MESSAGE_EMIT, SEND_EMIT } from "@serv/constants";
import { ioExpress, IoServer } from "@serv/socket";
import EnvVars from "@serv/declarations/major/EnvVars";
import { NodeEnvs } from "@serv/declarations/enums";
import helmet from "helmet";
const io = new IoServer();
if (EnvVars.nodeEnv === NodeEnvs.Production) {
    io.server.use(helmet());
}

io.server.get("/api/info/emits", (req, res) => {
    res.send({
        msg_emit: MESSAGE_EMIT,
        send_emit: SEND_EMIT,
    });
});
export const listener = io.app;
export default io.server;
