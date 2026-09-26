require("dotenv").config();

const http = require("http");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("Faltan variables de entorno.");
  process.exit(1);
}

// Servidor HTTP necesario para Render
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bunnieland is online! 🐰");
}).listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP server running on port ${PORT}`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// /setup panel
const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Bunnieland setup")
    .addSubcommand(subcommand =>
      subcommand
        .setName("panel")
        .setDescription("Send the Bunnieland panel")
    )
].map(command => command.toJSON());

function createPanel() {
  const embed = new EmbedBuilder()
    .setColor(0xffa8c8)
    .setTitle("🐰 Bunnieland Panel")
    .setDescription(
      "Welcome to **Bunnieland**!\n\n" +
      "Choose an option below.\n\n" +
      "📜 **Get Script**\n" +
      "Get your available script.\n\n" +
      "🔄 **Reset HWID**\n" +
      "Request a HWID reset from staff."
    )
    .setFooter({
      text: "Bunnieland • Staff managed"
    });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("bunnieland_script")
      .setLabel("Get Script")
      .setEmoji("📜")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("bunnieland_hwid")
      .setLabel("Reset HWID")
      .setEmoji("🔄")
      .setStyle(ButtonStyle.Danger)
  );

  return {
    embeds: [embed],
    components: [buttons]
  };
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const rest = new REST({ version: "10" })
      .setToken(DISCORD_TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: commands
      }
    );

    console.log("Slash command registered.");
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async interaction => {

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === "setup" &&
    interaction.options.getSubcommand() === "panel"
  ) {
    await interaction.channel.send(createPanel());

    return interaction.reply({
      content: "✅ Bunnieland panel created!",
      ephemeral: true
    });
  }

  if (!interaction.isButton()) return;

  if (interaction.customId === "bunnieland_script") {
    return interaction.reply({
      content: "📜 Your available script will appear here.",
      ephemeral: true
    });
  }

  if (interaction.customId === "bunnieland_hwid") {
    return interaction.reply({
      content: "🔄 HWID reset request received. Staff can process it manually.",
      ephemeral: true
    });
  }
});
client.on("error", error => {
  console.error("DISCORD CLIENT ERROR:", error);
});

client.on("shardError", error => {
  console.error("DISCORD SHARD ERROR:", error);
});

console.log("=== LLEGUE AL LOGIN ===");

client.on("debug", message => {
  console.log("DISCORD DEBUG:", message);
});

client.on("error", error => {
  console.error("DISCORD ERROR:", error);
});

client.on("ready", () => {
  console.log("=== BOT READY ===");
});

console.log("=== LLEGUE AL LOGIN ===");
console.log("TOKEN EXISTS:", !!DISCORD_TOKEN);

client.login(DISCORD_TOKEN)
  .catch(error => console.error("LOGIN ERROR:", error));
