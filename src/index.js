import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({
    rest: { api: "https://discord.com/api" },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
    ],
});

import Interactions from "./interactions.js";
import Events from "./events.js";
new Interactions(client);
new Events(client);

client.login(process.env.token);