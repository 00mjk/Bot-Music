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
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("../Core");
const Utils_1 = require("../Utils");
const youtube_sr_1 = __importStar(require("youtube-sr"));
class default_1 {
    constructor() {
        this.name = "search";
        this.aliases = ["s"];
        this.description = "Search and play song";
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
            const msg = yield message.channel.send(`${Utils_1.Emojis.info} Loading results for \`${search}\`...`);
            try {
                const searches = yield youtube_sr_1.default.search(search, {
                    limit: 10
                });
                const videos = searches.filter((t) => t instanceof youtube_sr_1.Video);
                if (!videos.length)
                    return msg.edit(`${Utils_1.Emojis.sad} No result found for \`${search}\`.`);
                const tracks = videos.map((x) => Utils_1.getTrackParamsFromYtsr(x));
                yield msg.edit({
                    content: "",
                    embed: {
                        title: `${Utils_1.Emojis.search} Results for ${search}`,
                        description: tracks
                            .map((x, i) => `${i + 1}. **[${x.title}](${x.url})**`)
                            .join("\n"),
                        color: Utils_1.Colors.def,
                        footer: {
                            text: "React to select"
                        }
                    }
                });
                const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "❌"];
                try {
                    emojis.forEach((e) => msg.react(e));
                }
                catch (err) {
                    return msg.edit(`${Utils_1.Emojis.sad} Missing permission: \`ADD_REACTIONS\`.`);
                }
                const [reactMsg] = (yield msg.awaitReactions((reaction, user) => emojis.includes(reaction.emoji.name) &&
                    user.id === message.author.id, {
                    time: 15 * 1000,
                    max: 1
                })).array();
                msg.reactions.removeAll().catch(() => { });
                if (!reactMsg || reactMsg.emoji.name === emojis[5])
                    return msg.edit({
                        content: `${Utils_1.Emojis.info} Song selection aborted.`,
                        embed: null
                    });
                const songIndex = emojis.findIndex((x) => reactMsg.emoji.name === x);
                const song = Utils_1.getTrackParamsFromYtsr(videos[songIndex]);
                const track = new Core_1.Track(song, message.author.id);
                queue.addTrack(track);
                msg.edit({
                    content: `${Utils_1.Emojis.music} Added **${track.title}** to queue!`,
                    embed: null
                });
                try {
                    if (!queue.playing)
                        yield queue.start();
                }
                catch (err) {
                    msg.edit(`${Utils_1.Emojis.err} ${err}`);
                }
            }
            catch (err) {
                return msg.edit(`${Utils_1.Emojis.sad} No results for \`${search}\`.`);
            }
        });
    }
}
exports.default = default_1;
