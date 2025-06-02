import { Collection, REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config();

console.log("Deploying commands...");

const commands = new Collection();
const commandFiles = fs
    .readdirSync("./src/commands")
    .filter((file) => file.endsWith(".js"));

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
    .then(() => console.log("Successfully deleted all application commands."))
    .catch(console.error);

(async () => {
    try {
        for (const file of commandFiles) {
            const command = (await import(
                "./commands/".concat(file)
            )).default;

            if (!("data" in command) || !("execute" in command)) {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                );
    
                continue;
            };
    
            console.log(`[INFO] Loading command ${command.data.name}`);
            commands.set(command.data.name, command.data.toJSON());
        };

        console.log(
            `Started refreshing ${commands.size} application (/) commands.`
        );

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [ ...commands.values() ] }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        console.error(error);
    };
})();