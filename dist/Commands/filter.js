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
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
const lodash_1 = require("lodash");
const allFilters = Object.keys(Utils_1.SongFilters);
class default_1 {
    constructor() {
        this.name = "filter";
        this.aliases = ["filters", "fl"];
        this.description = "Modify song filters";
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
                return message.channel.send(`${Utils_1.Emojis.err} Nothing is playing to use \`${this.name}\` command.`);
            if (queue.voiceChannel.id !== voiceChannel.id)
                return message.channel.send(`${Utils_1.Emojis.err} You must be in the same voice channel to use \`${this.name}\` command.`);
            let [doWhat, ...rfilters] = args;
            if (doWhat)
                doWhat = doWhat.toLowerCase();
            if (rfilters && rfilters.length)
                rfilters = rfilters.map((m) => m.toLowerCase());
            const types = [
                ["enable", "on", "add"],
                ["disable", "off", "remove", "rm"],
                ["clear"]
            ];
            const allTypes = [];
            types.forEach((t) => allTypes.push(...t));
            const filters = rfilters.filter((f) => allFilters.includes(f));
            if (!doWhat ||
                !allTypes.includes(doWhat) ||
                !rfilters ||
                !filters.length)
                return message.channel.send({
                    embed: getFiltersEmbed(queue.allFilters())
                });
            if (types[0].includes(doWhat)) {
                queue.addFilters(filters);
            }
            else if (types[1].includes(doWhat)) {
                queue.removeFilters(filters);
            }
            else if (types[2].includes(doWhat)) {
                queue.filters = new Set();
            }
            else
                return message.channel.send({
                    embed: getFiltersEmbed(queue.allFilters())
                });
            try {
                if (queue.playing)
                    queue.refreshStream();
                message.channel.send({
                    embed: getFiltersEmbed(queue.allFilters())
                });
            }
            catch (err) {
                message.channel.send(`${Utils_1.Emojis.err} ${err}`);
            }
        });
    }
}
exports.default = default_1;
function getFiltersEmbed(filters) {
    return {
        title: `${Utils_1.Emojis.music} Filters`,
        description: allFilters
            .map((f) => `\`${filters.includes(f) ? Utils_1.Emojis.tick : Utils_1.Emojis.cross}\` **${lodash_1.capitalize(f)}**`)
            .join("\n"),
        color: Utils_1.Colors.def
    };
}
