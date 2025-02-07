import { Events, Client } from "discord.js";

export default {
    name: Events.ClientReady,
    once: true,
    /** @param { Client } client  */
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};