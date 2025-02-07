import fs from "node:fs";
import path from "node:path";
import { Client, Collection } from "discord.js";

/** @param { Client } client */
export default function (client) {
    const eventFiles = fs
        .readdirSync("./src/events")
        .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(import.meta.url, "../events/", file);
        import(filePath).then(({ default: event }) => {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            }
            else {
                client.on(event.name, (...args) => event.execute(...args));
            };
        });
    };
};