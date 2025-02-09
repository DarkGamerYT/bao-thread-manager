import {
    ChannelType,
    PermissionFlagsBits,
    InteractionContextType,
    SlashCommandBuilder
} from "discord.js";
import { getLastMonthMembers, getMembers } from "../util.js";

export default {
    data: new SlashCommandBuilder()
        .setName("remove-inactive-members")
        .setDescription("Remove inactive members from thread")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
        .setContexts(InteractionContextType.Guild)
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
        
        await interaction.reply({ content: `Found the thread: ${post.toString()}! Fetching all user messages sent in the last month. Please hold.` });
        await post.setLocked(true, "Purging members");

        const members = await getLastMonthMembers(post);
        console.log(`(${members.length})`, members.map((user) => user.username));

        const postMembers = await getMembers(post);
        const membersToRemove = postMembers.filter((member) =>
            members.find((user) => user.id == member.id) === void 0);

        await interaction.editReply({
            content: `Starting the purge...\n\n\`${members.length}\` member(s) have sent at least one message in the last month in ${post.toString()}.`
        });

        let amount = 0;
        for (let i = 0; i < membersToRemove.size; i++) {
            const member = membersToRemove.at(i);
            if (member === void 0)
                continue;

            try {
                await post.members.remove(member.id, "Purging members");
                amount++;

                await interaction.editReply({
                    content: `Purging \`${amount}/${membersToRemove.size}\`\n\n\`${members.length}\` member(s) have sent at least one message in the last month in ${post.toString()}.`
                });
            } catch {
                console.log("Failed to remove", member);
            };

            // Sleep to hopefully avoid any ratelimits
            if (amount % 100 == 0) {
                await interaction.editReply({
                    content: `On cooldown. Purged \`${amount}/${membersToRemove.size}\` members so far\n\n\`${members.length}\` member(s) have sent at least one message in the last month in ${post.toString()}.`
                });
                
                await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
            };
        };

        console.log("Done purging!");
        await post.setLocked(false, "Purging members");
        await interaction.editReply({
            content: `Purging done! Removed \`${amount}\` member(s).`
        });
    },
};