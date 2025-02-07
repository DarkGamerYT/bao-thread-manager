import { ChannelType, SlashCommandBuilder } from "discord.js";

function getLastMonth() {
    const date = new Date();
    const month = date.getMonth();

    date.setMonth(date.getMonth() - 1);
    if (date.getMonth() == month)
        date.setDate(0);
    
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

export default {
    data: new SlashCommandBuilder()
        .setName("remove-inactive-members")
        .setDescription("Remove inactive members from thread")
        .addChannelOption((option) =>
            option
                .setName("thread")
                .setDescription("Neow")
                .addChannelTypes(ChannelType.PublicThread)
                .setRequired(true)
        ),

    /** @param { Interaction } interaction */
    async execute(interaction) {
        return;

        const forum = client.channels.cache.get(channelId);
        /** @type { import("discord.js").ThreadChannel } */
        const post = forum.threads.cache.get(threadId);

        console.log(post);
        const lastMonth = getLastMonth();

        /** @type { import("discord.js").User[] } */
        const members = [];
        let lastMessage;
        for (let i = 0; i < post.totalMessageSent; i++) {
            const messages = await post.messages.fetch({ before: lastMessage, limit: 100 });
            for (let j = 0; j < messages.size; j++) {
                const message = messages.at(j);
                if (message.createdTimestamp < lastMonth) {
                    const message = messages.at(j - 1);
                    lastMessage = message.id;
                    console.log(message.author.username, `(${message.id}):`, message.content);
                    break;
                };

                if (members.find((user) => user.id === message.author.id))
                    continue;

                members.push(message.author);
            };
            
            const message = messages.at(messages.size - 1);
            if (message === void 0)
                continue;

            if (message.createdTimestamp < lastMonth)
                break;

            lastMessage = message.id;
            console.log(message.author.username, `(${message.id}):`, message.content);
        };
        console.log(`(${members.length})`, members.map((user) => user.username));
        
        const postMembers = await post.members.fetch({ withMember: true });
        await post.setLocked(true, "Purging members");
        for (let i = 0; i < 75; i++) {
            const member = postMembers.at(i);
            if (member === void 0)
                break;
            
            if (members.find((user) => user.id === member.id) !== undefined) {
                i--;
                continue;
            };

            try {
                await post.members.remove(member.id, "Purging members");
            } catch {
                console.log("Failed to remove", member)
            };
        };

        console.log("Done purging!");
        await post.setLocked(false, "Purging members");
    },
};