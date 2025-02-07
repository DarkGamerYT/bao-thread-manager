import fs from "node:fs";
import path from "node:path";
import { Client, Collection } from "discord.js";

/** @param { Client } client */
export default function (client) {
    client.commands = new Collection();
    const commandFiles = fs
        .readdirSync("./src/commands")
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(import.meta.url, "../commands/", file);
        import(filePath).then(({ default: command }) => {
            if (!("data" in command) || !("execute" in command)) {
                console.warn(
                    `The command at ${filePath} is missing a required "data" or "execute" property.`
                );

                return;
            };

            client.commands.set(command.data.name, command);
        });
    };
};