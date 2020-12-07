"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
class default_1 {
    constructor() {
        this.name = "volume";
        this.aliases = ["vol"];
        this.description = "Change volume";
    }
    action(client, message, args) {
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
        if (queue.voiceChannel.id !== voiceChannel.id)
            return message.channel.send(`${Utils_1.Emojis.err} You must be in the same voice channel to use \`${this.name}\` command.`);
        if (!args[0])
            return message.channel.send(getVolume(queue.volume));
        const vol = parseInt(args[0]);
        if (isNaN(vol))
            return message.channel.send(`${Utils_1.Emojis.info} Volume must be a valid number between 0 and 100.`);
        try {
            queue.setVolume(vol);
            message.channel.send(getVolume(queue.volume));
        }
        catch (err) {
            message.channel.send(`${Utils_1.Emojis.err} ${err}`);
        }
    }
}
exports.default = default_1;
function getVolume(volume) {
    return `**Volume:** \`${volume}/200\``;
}
