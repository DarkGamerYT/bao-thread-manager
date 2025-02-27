export default class {
    /** @param { import("discord.js").Interaction } interaction */
    static handleSlashcommands = async function (interaction) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            );
            return;
        };

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            };
        };
    };

    /** @param { import("discord.js").Interaction } interaction */
    static handleAutocomplete = async function (interaction) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            );
            return;
        };

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        };
    };
};