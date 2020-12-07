"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class default_1 {
    constructor() {
        this.name = "ping";
        this.description = "Ping pong!";
    }
    action(client, message, args) {
        message.channel.send(`Pong! \`${Date.now() - message.createdTimestamp}ms\``);
    }
}
exports.default = default_1;
