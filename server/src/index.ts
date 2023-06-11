import "./pre-start"; // Must be the first import
import logger from "jet-logger";

import EnvVars from "@serv/declarations/major/EnvVars";
import server, { listener } from "./server";
import next from "next";
// **** Start server **** //
const dev = EnvVars.nodeEnv == "development";
const app = next({ dev });
const handle = app.getRequestHandler();
// **** Start server **** //

app.prepare()
    .then(() => {
        server.get("*", (req, res) => {
            return handle(req, res);
        });

        const msg =
            "Express server started on port: " + EnvVars.port.toString();
        listener.listen(EnvVars.port, () => logger.info(msg));
    })
    .catch((ex) => {
        logger.err(ex.stack);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    });
