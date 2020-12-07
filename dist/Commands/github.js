"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
class default_1 {
    constructor() {
        this.name = "github";
        this.aliases = ["credits", "source", "code", "support"];
        this.description = "Source code of the bot";
    }
    action(client, message, args) {
        const repo = "zyrouge/musical-bot";
        const url = "https://github.com/" + repo;
        message.channel.send({
            embed: {
                title: `${Utils_1.Emojis.music2} ${repo}`,
                url: url,
                fields: [
                    {
                        name: "Cloning",
                        value: `\`\`\`git clone ${url}.git\`\`\``
                    },
                    {
                        name: "Instructions",
                        value: `[README.md](${url}/blob/main/README.md)`
                    }
                ],
                color: Utils_1.Colors.def
            }
        });
    }
}
exports.default = default_1;
