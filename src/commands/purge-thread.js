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
        const postMembers = await getMembers(post);
        console.log(`(${members.length})`, members.map((user) => user.username));

        const roles = [
            "1065713026369593434", // Mod
            "872417164899020901"   // Mojangster
        ];
        
        const membersToRemove = postMembers
            .filter((user) => user.id !== interaction.client.id)
            .filter((user) =>
                user.guildMember.roles.cache.find((role, key) => roles.includes(key)) == void 0
            )
            .filter((user) =>
                members.find((member) => user.id === member.id) === void 0
            );
        
        await interaction.editReply({
            content: `Starting the purge...\n\n\`${members.length}\` member(s) have sent at least one message in the last month in ${post.toString()}.`
        });

        let amount = 0;
        for (let i = 0; i < membersToRemove.length; i++) {
            const member = membersToRemove.at(i);
            if (member === void 0)
                continue;

            try {
                await post.members.remove(member.id, "Purging members");
                amount++;
            }
            catch {
                console.log("Failed to remove", member.user.username, `<${member.user.id}>`);
            };
            
            try {
                await interaction.editReply({
                    content: `Purging \`${amount}/${membersToRemove.length}\`\n\n\`${members.length}\` member(s) have sent at least one message in the last month in ${post.toString()}.`
                });
            }
            catch {
                console.log(`Purging \`${amount}/${membersToRemove.length}, but failed to update the message.`);
            };

            // Sleep to hopefully avoid any ratelimits
            if (amount % 50 == 0) {
                try {
                    await interaction.editReply({
                        content: `On cooldown. Purged \`${amount}/${membersToRemove.length}\` members so far\n\n\`${members.length}\` member(s) have sent at least one message in the last month in ${post.toString()}.`
                    });
                }
                catch {
                    console.log(`Purged \`${amount}/${membersToRemove.length}, but failed to update the message.`);
                };
                
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