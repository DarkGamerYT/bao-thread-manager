import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config();

console.log('Deploying commands...');

const commands = [];
const foldersPath = path.join(__dirname, 'src/commands');
const commandFiles = fs
    .readdirSync(foldersPath)
    .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        console.log(`[INFO] Loading command ${command.data.name}`);
        commands.push(command.data.toJSON());
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
rest.put(Routes.applicationCommands(process.env.CLIENT_TOKEN), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);
(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_TOKEN),
            { body: commands }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        console.error(error);
    }
})();