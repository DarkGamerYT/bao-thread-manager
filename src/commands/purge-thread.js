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
                .setDescription("Meow")
                .addChannelTypes(ChannelType.PublicThread)
                .setRequired(true)
        ),

    /** @param { import("discord.js").Interaction } interaction */
    async execute(interaction) {
        /** @type { import("discord.js").ThreadChannel } */
        const post = interaction.options.getChannel("thread");
        if (post === void 0 || post.type !== ChannelType.PublicThread) {
            await interaction.reply({ content: "Channel is not a thread or does not exist.", ephemeral: true });
            return;
        };
        
        await interaction.reply({ content: "Purging the thread. ".concat(post.toString()) });
        const lastMonth = getLastMonth();

        /** @type { import("discord.js").User[] } */
        const members = [];
        let lastMessage;
        for (let i = 0; i < post.totalMessageSent; i++) {
            const messages = await post.messages.fetch({ before: lastMessage, limit: 100 });
            for (let j = 0; j < messages.size; j++) {
                const message = messages.at(j);
                if (message.createdTimestamp < lastMonth)
                    break;

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
        };

        console.log(`(${members.length})`, members.map((user) => user.username));
        const postMembers = await post.members.fetch({ withMember: true });
        await interaction.editReply({
            content: `\`${members.length}\` member(s) have sent at least one message in the last month in ${post.toString()}.`
        });

        await post.setLocked(true, "Purging members");

        let amount = 0;
        for (let i = 0; i < postMembers.size; i++) {
            const member = postMembers.at(i);
            if (member === void 0)
                break;
            
            if (members.find((user) => user.id === member.id) !== undefined)
                continue;

            try {
                await post.members.remove(member.id, "Purging members");
                amount++;
            } catch {
                console.log("Failed to remove", member);
            };

            // Sleep to hopefully avoid any ratelimits
            if (amount % 75 == 0)
                await new Promise((resolve) => setTimeout(resolve, 1 * 60 * 1000));
        };

        console.log("Done purging!");
        await post.setLocked(false, "Purging members");
        await interaction.editReply({
            content: `\`${members.length}\` member(s) have sent at least one message in the last month in ${post.toString()}.\nDone purging! Removed \`${amount}\` member(s).`
        });
    },
};