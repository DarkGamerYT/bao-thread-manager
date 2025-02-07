import discord from "discord.js";
const { Events, Interaction } = discord;
import interactionsHandler from "../interactions-handler.js";

export default {
    name: Events.InteractionCreate,
    /** @param { Interaction } interaction  */
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            interactionsHandler.handleSlashcommands(interaction);
        }
        else if (interaction.isAutocomplete()) {
            interactionsHandler.handleAutocomplete(interaction);
        };
    },
};
