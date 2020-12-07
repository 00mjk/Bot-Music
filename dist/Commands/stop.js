"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
class default_1 {
    constructor() {
        this.name = "stop";
        this.aliases = ["st", "disconnect", "dc", "end"];
        this.description = "Disconnects from the voice channel";
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
        try {
            queue.stop();
        }
        catch (err) {
            message.channel.send(`${Utils_1.Emojis.err} ${err}`);
        }
    }
}
exports.default = default_1;
