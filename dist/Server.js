"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
function Server(client, port) {
    port = port || 8080;
    return http_1.default
        .createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        const { pathname } = url_1.default.parse(req.url || "/");
        switch (pathname) {
            case "/":
            case "/ping":
                res.write(JSON.stringify({ ok: true }));
                break;
            default:
                res.write(JSON.stringify({
                    ok: false,
                    result: `Invalid path ${pathname}`
                }));
                break;
        }
        res.end();
    })
        .listen(port);
}
exports.default = Server;
