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
const genius_lyrics_1 = __importDefault(require("genius-lyrics"));
const Utils_1 = require("../Utils");
const Genius = new genius_lyrics_1.default.Client();
class default_1 {
    constructor() {
        this.name = "lyrics";
        this.aliases = ["ly"];
        this.description = "Search lyrics for a song";
    }
    action(client, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args.length)
                return message.channel.send(`${Utils_1.Emojis.info} Provide a song name/url to search lyrics.`);
            try {
                message.react(Utils_1.Emojis.clock).catch(() => { });
                const result = yield Genius.songs.search(args.join(" "));
                const song = result[0];
                const lyrics = yield song.lyrics();
                const lines = lyrics.split("\n");
                const parts = [];
                let index = 0;
                for (const line of lines) {
                    let part = parts[index];
                    if (!part)
                        part = "";
                    if (part.length + line.length < 1400)
                        parts[index] = part += `\n${line}`;
                    else
                        parts[index + 1] = line;
                }
                parts.forEach((part, i) => {
                    setTimeout(() => {
                        var _a, _b, _c;
                        message.channel.send({
                            embed: {
                                title: `${Utils_1.Emojis.music} ${song.title}`,
                                author: {
                                    name: (_a = song.artist) === null || _a === void 0 ? void 0 : _a.name,
                                    url: (_b = song.artist) === null || _b === void 0 ? void 0 : _b.url,
                                    icon_url: (_c = song.artist) === null || _c === void 0 ? void 0 : _c.image
                                },
                                url: song.url,
                                color: Utils_1.Colors.def,
                                description: part,
                                thumbnail: {
                                    url: song.thumbnail
                                },
                                footer: {
                                    text: `Page ${i + 1}/${parts.length} | Source: Genius.com`
                                }
                            }
                        });
                    }, 100);
                });
            }
            catch (err) {
                return message.channel.send(`${Utils_1.Emojis.info} No lyrics was found for \`${args.join(" ")}\``);
            }
        });
    }
}
exports.default = default_1;
