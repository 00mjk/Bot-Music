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
const lodash_1 = __importDefault(require("lodash"));
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
dayjs_1.default.extend(duration_1.default);
class default_1 {
    constructor() {
        this.name = "queue";
        this.aliases = ["q", "list"];
        this.description = "View the queue";
    }
    action(client, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.guild ||
                !message.member ||
                !Utils_1.isGuildTextChannel(message.channel))
                return;
            let queue = client.music.get(message.guild.id);
            if (!queue)
                return message.channel.send(`${Utils_1.Emojis.info} Nothing is being played to use \`${this.name}\` command.`);
            let page = 0;
            if (args[0]) {
                const parsed = parseInt(args[0]);
                if (isNaN(parsed))
                    return message.channel.send(`${Utils_1.Emojis.err} Invalid page index.`);
                page = parsed - 1;
            }
            try {
                const songs = queue.songs;
                const np = queue.index !== null ? queue.songs[queue.index] : undefined;
                const parts = lodash_1.default.chunk(songs, 5);
                const pagesongs = parts[page];
                if (!pagesongs)
                    return message.channel.send(`${Utils_1.Emojis.sad} Seems like this page of queue is empty.`);
                const desc = [];
                const iAdd = page * 5;
                for (let i = 0; i < pagesongs.length; i++) {
                    const song = pagesongs[i];
                    const fields = [
                        song.url === (np === null || np === void 0 ? void 0 : np.url) ? Utils_1.Emojis.speaker : `${i + 1 + iAdd}.`,
                        `**[${song.title}](${song.url})**`
                    ];
                    const dur = song.duration
                        ? Utils_1.getLocaleFromDuration(dayjs_1.default.duration(song.duration))
                        : undefined;
                    if (dur)
                        fields.push(`(${dur})`);
                    desc.push(fields.join(" "));
                }
                if (!desc.length)
                    desc.push(`Empty as always`);
                message.channel.send({
                    embed: {
                        title: `${Utils_1.Emojis.music} Queue`,
                        description: desc.join("\n"),
                        color: Utils_1.Colors.def,
                        footer: { text: `Page ${page + 1}/${parts.length}` }
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
