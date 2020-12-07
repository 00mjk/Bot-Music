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
const Core_1 = require("../Core");
const Utils_1 = require("../Utils");
const url_1 = __importDefault(require("url"));
const youtube_sr_1 = __importStar(require("youtube-sr"));
const ytpl_1 = __importDefault(require("ytpl"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
class default_1 {
    constructor() {
        this.name = "play";
        this.aliases = ["p", "pl"];
        this.description = "Play a song";
    }
    action(client, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.guild ||
                !message.member ||
                !Utils_1.isGuildTextChannel(message.channel))
                return;
            if (!args.length)
                return message.channel.send(`${Utils_1.Emojis.info} Provide a song name/url to play.`);
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel)
                return message.channel.send(`${Utils_1.Emojis.err} You must be in a Voice Channel to use \`${this.name}\` command.`);
            let queue = client.music.get(message.guild.id);
            if (!queue) {
                queue = new Core_1.GuildAudioManager(message.channel, voiceChannel);
                client.music.set(message.guild.id, queue);
            }
            if (queue.voiceChannel.id !== voiceChannel.id)
                return message.channel.send(`${Utils_1.Emojis.err} You must be in the same voice channel to use \`${this.name}\` command.`);
            const search = args.join(" ");
            const msg = yield message.channel.send(`${Utils_1.Emojis.info} Searching results for \`${search}\`...`);
            let trackopts;
            if (Utils_1.RegExps.youtube.playlist.test(search)) {
                try {
                    const videos = yield ytpl_1.default(search);
                    msg.edit(`${Utils_1.Emojis.music} Adding **${videos.items.length} songs** to queue...`);
                    const songs = Utils_1.getTrackParamsFromYtplResult(videos);
                    trackopts = songs;
                }
                catch (err) {
                    return msg.edit(`${Utils_1.Emojis.sad} Could not resolve playlist \`${search}\`.`);
                }
            }
            else if (Utils_1.RegExps.youtube.song.test(search)) {
                try {
                    const video = yield ytdl_core_1.default.getBasicInfo(args[0]);
                    trackopts = Utils_1.getTrackParamsFromYtdl(video);
                }
                catch (err) {
                    return msg.edit(`${Utils_1.Emojis.sad} Could not resolve video \`${search}\`.`);
                }
            }
            else if (Utils_1.RegExps.spotify.song.test(search)) {
                try {
                    const video = yield Utils_1.getSpotifyTrack(args[0]);
                    trackopts = video;
                }
                catch (err) {
                    return msg.edit(`${Utils_1.Emojis.sad} Could not resolve video \`${search}\`.`);
                }
            }
            else if (Utils_1.RegExps.spotify.playlist.test(search)) {
                try {
                    const videos = yield Utils_1.getSpotifyPlaylist(search);
                    msg.edit(`${Utils_1.Emojis.music} Adding **${videos.length} songs** to queue...`);
                    trackopts = videos;
                }
                catch (err) {
                    return msg.edit(`${Utils_1.Emojis.sad} Could not resolve playlist \`${search}\`.`);
                }
            }
            else if (Utils_1.RegExps.link.test(search)) {
                const url = url_1.default.parse(args[0]);
                const base = url.hostname || url.host || "Unknown";
                trackopts = {
                    title: `${base} - Stream`,
                    url: url.href,
                    channelName: "Unknown",
                    channelURL: base,
                    type: "href-stream"
                };
            }
            else {
                try {
                    const video = yield youtube_sr_1.default.searchOne(search);
                    if (!video || !(video instanceof youtube_sr_1.Video))
                        return msg.edit(`${Utils_1.Emojis.sad} No result found for \`${search}\`.`);
                    trackopts = Utils_1.getTrackParamsFromYtsr(video);
                }
                catch (err) {
                    console.error(err);
                    return msg.edit(`${Utils_1.Emojis.sad} No results for \`${search}\`.`);
                }
            }
            if (Array.isArray(trackopts)) {
                let duplicates = 0;
                for (const tr of trackopts) {
                    const track = new Core_1.Track(tr, message.author.id);
                    try {
                        queue.addTrack(track);
                    }
                    catch (err) {
                        duplicates += 1;
                    }
                }
                msg.edit(`${Utils_1.Emojis.music} Added **${trackopts.length - duplicates} songs** to queue! (${duplicates} duplicates were removed)`);
            }
            else {
                const track = new Core_1.Track(trackopts, message.author.id);
                try {
                    queue.addTrack(track);
                }
                catch (err) {
                    return msg.edit(`${Utils_1.Emojis.err} ${err}`);
                }
                msg.edit(`${Utils_1.Emojis.music} Added **${track.title}** to queue!`);
            }
            try {
                if (!queue.playing)
                    yield queue.start();
            }
            catch (err) {
                msg.edit(`${Utils_1.Emojis.err} ${err}`);
            }
        });
    }
}
exports.default = default_1;
