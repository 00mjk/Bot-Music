"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
class default_1 {
    constructor() {
        this.name = "help";
        this.description = "Help command";
    }
    action(client, message, args) {
        const commands = [...client.commander.labels.values()];
        message.channel.send({
            embed: {
                title: `${Utils_1.Emojis.info} All commands`,
                description: commands
                    .map((c) => `\`${c.name}\` - ${c.description}`)
                    .join("\n"),
                color: Utils_1.Colors.def
            }
        });
    }
}
exports.default = default_1;
