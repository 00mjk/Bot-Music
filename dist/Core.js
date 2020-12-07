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
exports.GuildAudioManager = exports.Track = exports.Client = void 0;
const discord_js_1 = require("discord.js");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const youtube_sr_1 = __importStar(require("youtube-sr"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const stream_1 = require("stream");
const lodash_1 = require("lodash");
const dayjs_1 = __importDefault(require("dayjs"));
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
const Utils_1 = require("./Utils");
const stream_2 = require("stream");
dayjs_1.default.extend(duration_1.default);
class CommandsManager {
    constructor() {
        this.labels = new discord_js_1.Collection();
        this.aliases = new discord_js_1.Collection();
    }
    resolve(name) {
        const byName = this.labels.get(name);
        if (byName)
            return byName;
        const byAlias = this.aliases.get(name);
        if (byAlias)
            return this.labels.get(byAlias);
        return undefined;
    }
}
class Client extends discord_js_1.Client {
    constructor(config) {
        super(config);
        this.prefix = config.prefix;
        this.music = new discord_js_1.Collection();
        this.commander = new CommandsManager();
    }
}
exports.Client = Client;
class Track {
    constructor(video, userID) {
        this.url = video.url;
        this.thumbnail = video.thumbnail;
        this.channel = {
            title: video.channelName,
            url: video.channelURL
        };
        this.title = video.title
            .replace(/\\(\*|_|`|~|\\)/g, "$1")
            .replace(/(\*|_|`|~|\\)/g, "\\$1");
        this.requester = userID;
        this.type = video.type;
        this._duration(video);
    }
    _duration(video) {
        if (video.uploadedAt)
            this.published = video.uploadedAt;
        if (video.duration) {
            this.duration = video.duration;
        }
    }
    getStream() {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = {
                quality: "highestaudio",
                highWaterMark: 1 << 25
            };
            if (this.type === "youtube")
                return ytdl_core_1.default(this.url, opts);
            else if (this.type === "spotify") {
                const yt = yield youtube_sr_1.default.searchOne(`${this.title} - ${this.channel.title}`);
                if (!yt || !(yt instanceof youtube_sr_1.Video) || !yt.url)
                    throw new Error("Could not resolve spotify track");
                return ytdl_core_1.default(yt.url, opts);
            }
            else if (this.type === "href-stream")
                return this.url;
            throw new Error("Invalid track type");
        });
    }
}
exports.Track = Track;
class GuildAudioManager {
    constructor(textChannel, voiceChannel) {
        this._songs = [];
        this.loop = "none";
        this.index = null;
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.filters = new Set();
        this.volume = 150;
    }
    get songs() {
        return [...this._songs];
    }
    get playing() {
        return this.index !== null;
    }
    get paused() {
        return !!(this.dispatcher && this.dispatcher.paused);
    }
    addTrack(track) {
        const exist = this._songs.findIndex((t) => t.url === track.url) >= 0;
        if (exist)
            throw new Error("Already in queue");
        this._songs.push(track);
    }
    removeTrack(position) {
        if (!this._songs[position])
            throw new Error("Invalid song index");
        this._songs = this._songs.splice(position, 1);
    }
    clearQueue() {
        this._songs = [];
        this.index = null;
    }
    setLoop(state) {
        this.loop = state;
    }
    nowPlaying() {
        if (this.index === null)
            throw new Error("Nothing is being played");
        return this._songs[this.index];
    }
    streamTime() {
        if (!this.dispatcher)
            throw new Error("Nothing is being played");
        return this.dispatcher.streamTime + (this._seekMs || 0);
    }
    pause() {
        if (!this.dispatcher)
            throw new Error("Nothing is being played");
        if (this.dispatcher.paused)
            throw new Error("Music is already paused");
        this.dispatcher.pause();
    }
    resume() {
        if (!this.dispatcher)
            throw new Error("Nothing is being played");
        if (!this.dispatcher.paused)
            throw new Error("Music is not paused");
        this.dispatcher.resume();
    }
    stop() {
        if (!this.connection || !this.dispatcher)
            throw new Error("Nothing is being played");
        this.cleanup();
        this.textChannel.send(`${Utils_1.Emojis.bye} Music has been ended.`);
    }
    skip() {
        if (!this.dispatcher)
            throw new Error("Nothing is being played");
        this.incrementIndex(true);
        this._dontChangeIndex = true;
        this.dispatcher.end();
    }
    previous() {
        if (!this.dispatcher)
            throw new Error("Nothing is being played");
        this.decrementIndex(true);
        this._dontChangeIndex = true;
        this.dispatcher.end();
    }
    setVolume(volume) {
        if (!this.dispatcher)
            throw new Error("Nothing is being played");
        if (volume < 0 || volume > 200)
            throw new Error("Volume must be between 0-200");
        this.volume = volume;
        this.dispatcher.setVolumeLogarithmic(this.volume / 200);
    }
    shuffle() {
        const shuff = (arr) => arr.sort((a, b) => Math.random() - 0.5);
        const currentSongURL = this.nowPlaying().url;
        this._songs = shuff(this._songs);
        this._songs = shuff(this._songs);
        this.index = this._songs.findIndex((t) => t.url === currentSongURL);
    }
    jump(position) {
        if (!this.dispatcher)
            throw new Error("Nothing is being played");
        if (position < 0 || position > this._songs.length)
            throw new Error("Invalid song index");
        this.index = position;
        this._dontChangeIndex = true;
        this.dispatcher.end();
        return true;
    }
    addFilters(filters) {
        filters.forEach((f) => this.filters.add(f));
    }
    removeFilters(filters) {
        filters.forEach((f) => this.filters.delete(f));
    }
    allFilters() {
        return [...this.filters.values()];
    }
    getFilters() {
        return this.allFilters().map((f) => Utils_1.SongFilters[f]);
    }
    start() {
        if (this.index === null)
            this.index = 0;
        return this.play(this._songs[this.index]);
    }
    play(song) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!song) {
                    this.cleanup();
                    this.textChannel.send(`${Utils_1.Emojis.bye} No more songs are on queue, goodbye!`);
                    return;
                }
                if (!this.connection) {
                    if (!this.voiceChannel.joinable)
                        throw new Error("Voice channel is not joinable");
                    this.connection = yield this.voiceChannel.join();
                    this.connection.on("disconnect", () => this.cleanup());
                    this.connection.on("error", console.error);
                }
                try {
                    const seek = !lodash_1.isUndefined(this._seekMs)
                        ? this._seekMs / 1000
                        : 0;
                    const stream = yield song.getStream();
                    this.dispatcher = this.connection.play(stream, {
                        seek: seek,
                        bitrate: "auto",
                        volume: this.volume / 200
                    });
                    delete this._seekMs;
                    this.dispatcher.on("start", () => __awaiter(this, void 0, void 0, function* () {
                        this.lastMessage = yield this.textChannel.send(`${Utils_1.Emojis.dvd} Playing **${song.title}**.`);
                    }));
                    this.dispatcher.on("finish", () => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        (_a = this.lastMessage) === null || _a === void 0 ? void 0 : _a.delete().catch(() => { });
                        if (!this._dontChangeIndex)
                            this.incrementIndex();
                        delete this._dontChangeIndex;
                        yield this.handleEnd();
                    }));
                    this.dispatcher.on("error", console.error);
                }
                catch (err) {
                    this.incrementIndex(true);
                    yield this.handleEnd();
                    this.textChannel.send(`${Utils_1.Emojis.sad} Could not play **${song.title}**`);
                }
            }
            catch (err) {
                console.error(err);
                this.cleanup();
                this.textChannel.send(`Something went wrong\n\`\`\`${err}\`\`\``);
            }
        });
    }
    refreshStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection || !this.dispatcher || !this.playing)
                throw new Error("Nothing is being played");
            this._seekMs = this.dispatcher.streamTime;
            this._dontChangeIndex = true;
            this.dispatcher.end();
        });
    }
    createStream(song) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const baseStream = yield song.getStream();
                const outputStream = new stream_1.PassThrough();
                const command = fluent_ffmpeg_1.default(baseStream)
                    .audioCodec("libmp3lame")
                    .noVideo()
                    .audioBitrate(128)
                    .format("mp3");
                const filters = this.getFilters();
                if (filters.length)
                    command.outputOption(`-af ${filters.join(",")}`);
                command.pipe(outputStream, { end: true });
                outputStream.on("close", () => {
                    if (baseStream instanceof stream_2.Readable && !baseStream.destroyed)
                        baseStream.destroy();
                    if (!outputStream.destroyed)
                        outputStream.destroy();
                    command.kill("SIGSTOP");
                });
                return outputStream;
            }
            catch (err) {
                const index = this._songs.findIndex((x) => x.url === song.url);
                if (lodash_1.isNumber(index))
                    this.removeTrack(index);
                this.textChannel.send(`Error while playing song **${song.title}**, skipping. to next`);
            }
        });
    }
    handleEnd() {
        if (this.index === null)
            throw new Error("Nothing is being played");
        return this.play(this._songs[this.index]);
    }
    incrementIndex(force = false) {
        if (this.index === null)
            throw new Error("Nothing is being played");
        if (!force && this.loop === "track")
            return;
        this.index = this.index + 1;
        if (this.loop === "queue" && !this._songs[this.index])
            this.index = 0;
    }
    decrementIndex(force = false) {
        if (this.index === null)
            throw new Error("Nothing is being played");
        if (!force && this.loop === "track")
            return;
        this.index = this.index - 1;
        if (this.loop === "queue" && !this._songs[this.index])
            this.index = this._songs.length - 1;
    }
    cleanup() {
        var _a;
        try {
            (_a = this.dispatcher) === null || _a === void 0 ? void 0 : _a.destroy();
        }
        catch (e) { }
        delete this.connection;
        delete this.dispatcher;
        this.clearQueue();
    }
}
exports.GuildAudioManager = GuildAudioManager;
