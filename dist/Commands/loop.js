"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
class default_1 {
    constructor() {
        this.name = "loop";
        this.description = "Loop the music";
    }
    action(client, message, args) {
        if (!message.guild ||
            !message.member ||
            !Utils_1.isGuildTextChannel(message.channel))
            return;
        const userVoiceChannel = message.member.voice.channel;
        if (!userVoiceChannel)
            return message.channel.send(`You must be in a Voice Channel to use \`${this.name}\` command.`);
        const queue = client.music.get(message.guild.id);
        if (!queue)
            return message.channel.send(`${Utils_1.Emojis.err} Nothing is playing to use \`${this.name}\` command.`);
        if (queue.voiceChannel.id !== userVoiceChannel.id)
            return message.channel.send(`${Utils_1.Emojis.err} You must be in the same voice channel to use \`${this.name}\` command.`);
        if (!args[0])
            return message.channel.send(`${Utils_1.Emojis.info} Currently Looping **${queue.loop}**.`);
        switch (args[0]) {
            case "track":
            case "song":
            case "this":
                queue.setLoop("track");
                message.channel.send(`${Utils_1.Emojis.repeat.song} Currently Looping **${queue.loop}**.`);
                break;
            case "all":
            case "queue":
            case "list":
                queue.setLoop("queue");
                message.channel.send(`${Utils_1.Emojis.repeat.queue} Currently Looping **${queue.loop}**.`);
                break;
            case "none":
            case "disable":
            case "off":
                queue.setLoop("none");
                message.channel.send(`${Utils_1.Emojis.music} Currently Looping **${queue.loop}**.`);
                break;
            default:
                message.channel.send(`${Utils_1.Emojis.info} Currently Looping **${queue.loop}**.`);
        }
    }
}
exports.default = default_1;
