"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("./Core");
const fs_1 = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const Utils_1 = require("./Utils");
const discord_js_1 = require("discord.js");
const Server_1 = __importDefault(require("./Server"));
dotenv_1.default.config({ path: __dirname + "/../.env" });
if (!process.env.DISCORD_TOKEN)
    throw new Error("No 'DISCORD_TOKEN' was found");
const config = JSON.parse(fs_1.default.readFileSync(`${__dirname}/../config.json`).toString());
const TOKEN = process.env.DISCORD_TOKEN;
const client = new Core_1.Client({
    prefix: config.PREFIX
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    for (const command of yield fs_1.promises.readdir(`${__dirname}/Commands`)) {
        const cmdC = require(`${__dirname}/Commands/${command}`)
            .default;
        const cmd = new cmdC();
        client.commander.labels.set(cmd.name, cmd);
        (_a = cmd.aliases) === null || _a === void 0 ? void 0 : _a.forEach((alias) => client.commander.aliases.set(alias, cmd.name));
        console.log(`Loaded command ${cmd.name} from ${command}`);
    }
});
client.on("ready", () => {
    var _a, _b;
    console.log(`Logged in as ${((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag) || "Unknown"}`);
    (_b = client.user) === null || _b === void 0 ? void 0 : _b.setPresence({
        activity: {
            name: "Music",
            type: "LISTENING"
        },
        status: "dnd"
    });
});
client.on("warn", console.warn);
client.on("error", console.error);
const GlobalCooldown = new discord_js_1.Collection();
const CooldownTime = config.COOLDOWN || 3000;
client.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    if (message.author.bot || !message.guild)
        return;
    if (message.content.indexOf(client.prefix) !== 0)
        return;
    const args = message.content.slice(client.prefix.length).trim().split(" ");
    const cmd = (_b = args.shift()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
    if (!cmd)
        return;
    let command = client.commander.resolve(cmd);
    if (!command)
        return;
    const guildID = message.guild.id;
    const userID = message.author.id;
    const CooledUsers = GlobalCooldown.get(guildID) || new discord_js_1.Collection();
    const UserCooldown = CooledUsers.get(userID);
    if (UserCooldown)
        return message.channel
            .send(`${Utils_1.Emojis.sad} Try using commands after \`${Math.floor((UserCooldown - Date.now()) / 1000)}s\``)
            .then((msg) => msg.deletable ? msg.delete({ timeout: 2000 }) : null);
    CooledUsers.set(userID, Date.now() + CooldownTime);
    GlobalCooldown.set(guildID, CooledUsers);
    const removeCooldown = () => {
        const newCooledUsers = GlobalCooldown.get(guildID) || new discord_js_1.Collection();
        newCooledUsers.delete(userID);
        GlobalCooldown.set(guildID, newCooledUsers);
    };
    try {
        command.action(client, message, args);
        setTimeout(removeCooldown, CooldownTime);
    }
    catch (e) {
        removeCooldown();
        console.error(e);
        message.channel.send(`Something went wrong while executing command "**${command}**"!`);
    }
}));
client.on("voiceStateUpdate", (oldState, newState) => {
    if (oldState.member &&
        newState.member &&
        oldState.member.id === newState.member.id) {
        const queue = client.music.get(oldState.guild.id);
        if (queue) {
            const isEmpty = () => {
                var _a, _b;
                return queue.voiceChannel.members.size === 1 &&
                    ((_a = queue.voiceChannel.members.first()) === null || _a === void 0 ? void 0 : _a.id) === ((_b = client.user) === null || _b === void 0 ? void 0 : _b.id);
            };
            if (oldState.channel &&
                newState.channel &&
                oldState.member &&
                newState.member &&
                client.user &&
                oldState.member.id === client.user.id &&
                newState.member.id === client.user.id &&
                oldState.channel.id !== newState.channel.id) {
                queue.voiceChannel = newState.channel;
                queue.textChannel.send(`${Utils_1.Emojis.music2} Voice channel has been changed to \`#${queue.voiceChannel.name}\``);
            }
            if (isEmpty()) {
                setTimeout(() => {
                    if (isEmpty()) {
                        queue.cleanup();
                        queue.textChannel.send(`${Utils_1.Emojis.info} Left \`#${queue.voiceChannel.name}\` due to lack of listerners.`);
                        queue.voiceChannel.leave();
                        client.music.delete(oldState.guild.id);
                    }
                }, 15 * 1000);
            }
        }
    }
});
init().then(() => {
    client.login(TOKEN);
    Server_1.default(client, config.PORT);
});
