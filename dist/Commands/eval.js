"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const Utils_1 = require("../Utils");
class default_1 {
    constructor() {
        this.name = "eval";
        this.aliases = ["ev"];
        this.description = "Evaluate nodejs code";
    }
    action(client, message, args) {
        if (message.author.id !== process.env.OWNER_ID)
            return message.channel.send(`${Utils_1.Emojis.err} You are\'nt the Bot Owner!`);
        try {
            let code = args.join(" ");
            let evaled = eval(code);
            if (typeof evaled !== "string")
                evaled = util_1.default.inspect(evaled);
            message.channel.send(`${Utils_1.Emojis.success} Success\n\`\`\`${clean(evaled).slice(0, 1700)}\`\`\``);
        }
        catch (err) {
            message.channel.send(`${Utils_1.Emojis.err} Error\n\`\`\`${clean(err).slice(0, 1700)}\`\`\``);
        }
    }
}
exports.default = default_1;
function clean(text) {
    if (typeof text === "string")
        return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return `${text}`;
}
