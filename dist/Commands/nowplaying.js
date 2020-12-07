"use strict";
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
const Utils_1 = require("../Utils");
const dayjs_1 = __importDefault(require("dayjs"));
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
dayjs_1.default.extend(duration_1.default);
class default_1 {
    constructor() {
        this.name = "nowplaying";
        this.aliases = ["np", "current"];
        this.description = "Skip a song";
    }
    action(client, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.guild ||
                !message.member ||
                !Utils_1.isGuildTextChannel(message.channel))
                return;
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel)
                return message.channel.send(`${Utils_1.Emojis.err} You must be in a Voice Channel to use \`${this.name}\` command.`);
            let queue = client.music.get(message.guild.id);
            if (!queue)
                return message.channel.send(`${Utils_1.Emojis.err} Nothing is being played to use \`${this.name}\` command.`);
            try {
                const { title, url, published, duration, channel, thumbnail, requester } = queue.nowPlaying();
                let footerText;
                const streamTime = queue.streamTime();
                if (duration) {
                    const passed = streamTime;
                    const emote = "🔘";
                    const barele = "─".repeat(19).split("");
                    const index = Math.floor((passed / duration) * 20);
                    const bar = barele.splice(index, 0, emote);
                    const current = Utils_1.getLocaleFromDuration(dayjs_1.default.duration(passed));
                    const total = Utils_1.getLocaleFromDuration(dayjs_1.default.duration(duration));
                    footerText = `${current}/${total} ${bar}`;
                }
                else {
                    footerText = `${Utils_1.getLocaleFromDuration(dayjs_1.default.duration(streamTime))}/Unknown`;
                }
                message.channel.send({
                    embed: {
                        title: `${Utils_1.Emojis.music2} Now playing: ${title}`,
                        url: url,
                        color: Utils_1.Colors.def,
                        description: [
                            `Position: **${(queue.index || 0) + 1}/${queue.songs.length}**`,
                            `Requested by: <@${requester}>`,
                            `Channel: **[${channel.title}](${channel.url})**`,
                            `Published: **${published || "Unknown"}**`
                        ].join("\n"),
                        thumbnail: {
                            url: thumbnail
                        },
                        footer: {
                            text: footerText
                        }
                    }
                });
            }
            catch (err) {
                message.channel.send(`${Utils_1.Emojis.err} ${err}`);
            }
        });
    }
}
exports.default = default_1;
