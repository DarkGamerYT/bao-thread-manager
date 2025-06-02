import fs from "node:fs";
import path from "node:path";
import { Client, Collection } from "discord.js";

/** @param { Client } client */
export default function (client) {
    const eventFiles = fs
        .readdirSync("./src/events")
        .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
        import(
            "./events/".concat(file)
        ).then(({ default: event }) => {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            }
            else {
                client.on(event.name, (...args) => event.execute(...args));
            };
        });
    };
};