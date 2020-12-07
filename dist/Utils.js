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
exports.getSpotifyPlaylist = exports.getSpotifyTrack = exports.RegExps = exports.SongFilters = exports.Colors = exports.Emojis = exports.getTrackParamsFromYtplResult = exports.getTrackParamsFromYtsr = exports.getTrackParamsFromYtdl = exports.getLocaleFromDuration = exports.isGuildTextChannel = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
const sptfi = require("spotify-url-info");
dayjs_1.default.extend(duration_1.default);
function isGuildTextChannel(channel) {
    if (!("guild" in channel))
        return false;
    return true;
}
exports.isGuildTextChannel = isGuildTextChannel;
function getLocaleFromDuration(dura) {
    const daysN = dura.days();
    const hoursN = dura.hours();
    const minuteN = dura.minutes();
    const secondN = dura.seconds();
    const day = daysN ? `${daysN}d` : "";
    const hour = hoursN ? `${hoursN}h` : "";
    const minute = minuteN ? `${minuteN}m` : "";
    const second = secondN ? `${secondN}s` : "";
    return [day, hour, minute, second].filter((x) => !!x.length).join(":");
}
exports.getLocaleFromDuration = getLocaleFromDuration;
function getTrackParamsFromYtdl({ videoDetails: video }) {
    const track = {
        url: video.video_url,
        thumbnail: video.thumbnail.thumbnails[0].url,
        channelName: video.author.name,
        channelURL: video.author.channel_url,
        title: video.title,
        uploadedAt: video.uploadDate,
        duration: parseInt(video.lengthSeconds) * 1000,
        type: "youtube"
    };
    return track;
}
exports.getTrackParamsFromYtdl = getTrackParamsFromYtdl;
function getTrackParamsFromYtsr(video) {
    if (!video.url)
        throw new Error("Invalid video");
    const track = {
        url: video.url,
        thumbnail: video.thumbnail.displayThumbnailURL("maxresdefault"),
        channelName: video.channel.name || "Unknown",
        channelURL: video.channel.url || "Unknown",
        title: video.title || "Unknown",
        type: "youtube"
    };
    if (video.uploadedAt)
        track.uploadedAt = video.uploadedAt;
    if (video.duration) {
        const dura = dayjs_1.default.duration(video.duration);
        track.duration = dura.asMilliseconds();
    }
    return track;
}
exports.getTrackParamsFromYtsr = getTrackParamsFromYtsr;
function getTrackParamsFromYtplResult(videos) {
    const tracks = videos.items.map((video) => {
        var _a, _b;
        const track = {
            url: video.url_simple,
            thumbnail: video.thumbnail,
            channelName: ((_a = video.author) === null || _a === void 0 ? void 0 : _a.name) || "Unknown",
            channelURL: ((_b = video.author) === null || _b === void 0 ? void 0 : _b.ref) || "Unknown",
            title: video.title,
            type: "youtube"
        };
        if (video.duration) {
            const dura = dayjs_1.default.duration(video.duration);
            track.duration = dura.asMilliseconds();
        }
        return track;
    });
    return tracks;
}
exports.getTrackParamsFromYtplResult = getTrackParamsFromYtplResult;
exports.Emojis = {
    music: "🎵",
    music2: "🎶",
    bye: "👋",
    dvd: "📀",
    tick: "✔️",
    cross: "❌",
    success: "👌",
    err: "⛔",
    sad: "🙁",
    info: "ℹ️",
    repeat: {
        queue: "🔁",
        song: "🔂"
    },
    shuffle: "🔀",
    search: "🔍",
    clock: "🕐",
    speaker: "🔊",
    pause: "⏸️",
    play: "▶️"
};
exports.Colors = {
    def: 0xe642f5
};
// https://github.com/Androz2091/discord-player/blob/5e3075dad1b4617a21d99379438f221582a0c130/src/Player.js#L35
exports.SongFilters = {
    bassboost: "bass=g=20,dynaudnorm=g=101",
    "8D": "apulsator=hz=0.08",
    vaporwave: "aresample=48000,asetrate=48000*0.8",
    nightcore: "aresample=48000,asetrate=48000*1.25",
    phaser: "aphaser=in_gain=0.4",
    tremolo: "tremolo",
    vibrato: "vibrato=f=6.5",
    reverse: "areverse",
    treble: "treble=g=5",
    normalizer: "dynaudnorm=f=200",
    surrounding: "surround",
    pulsator: "apulsator=hz=1",
    subboost: "asubboost",
    karaoke: "stereotools=mlev=0.03",
    flanger: "flanger",
    gate: "agate",
    haas: "haas",
    mcompand: "mcompand"
};
exports.RegExps = {
    link: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i,
    youtube: {
        song: /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
        playlist: /^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/
    },
    soundcloud: /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/,
    spotify: {
        song: /^https?:\/\/(?:open|play)\.spotify\.com\/track\/[\w\d]+$/i,
        playlist: /https?:\/\/open.spotify.com\/((track|user|artist|album)\/)?[a-zA-Z0-9]+(\/playlist\/[a-zA-Z0-9]+|)/i
    }
};
function getSpotifyTrack(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const rt = yield sptfi.getPreview(url);
        const track = {
            url: rt.link,
            thumbnail: rt.image,
            channelName: rt.artist || "Unknown",
            channelURL: "Unknown",
            title: rt.title || "Unknown",
            uploadedAt: rt.date,
            type: "spotify"
        };
        return track;
    });
}
exports.getSpotifyTrack = getSpotifyTrack;
function getSpotifyPlaylist(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlist = yield sptfi.getTracks(url);
        const tracks = playlist.map((video) => {
            var _a;
            const track = {
                url: video.external_urls.spotify ||
                    `https://open.spotify.com/track/${video.id}`,
                channelName: ((_a = video.artists[0]) === null || _a === void 0 ? void 0 : _a.name) || "Unknown",
                channelURL: "Unknown",
                title: video.name,
                duration: video.duration_ms,
                type: "spotify"
            };
            return track;
        });
        return tracks;
    });
}
exports.getSpotifyPlaylist = getSpotifyPlaylist;
