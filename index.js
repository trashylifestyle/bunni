require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const {
  DISCORD_TOKEN,
  CLIENT_ID,
  GUILD_ID,
  STAFF_ROLE_ID
} = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID in .env");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Set up a Bunnieland panel.")
    .addSubcommand(sub =>
      sub.setName("panel").setDescription("Post the Bunnieland script panel.")
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

function hasStaffAccess(member) {
  if (!STAFF_ROLE_ID) return true;
  return member.roles?.cache?.has(STAFF_ROLE_ID) ||
    member.permissions?.has(PermissionsBitField.Flags.Administrator);
}

function makePanel() {
  const embed = new EmbedBuilder()
    .setColor(0xffa8c8)
    .setTitle("Bunnieland Panel")
    .setDescription(
      "Click **Get Script** to choose an available script.\n" +
      "Use **Reset HWID** only when a staff member has approved the reset.\n\n" +
      "**Instructions**\n" +
      "1. You must be whitelisted by staff.\n" +
      "2. Click **Get Script**.\n" +
      "3. Choose the script you want.\n" +
      "4. Copy the provided loader/configuration."
    )
    .setFooter({ text: "Bunnieland • Staff managed" });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("bunnieland_get_script")
      .setLabel("Get Script")
      .setEmoji("📜")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("bunnieland_reset_hwid")
      .setLabel("Reset HWID")
      .setEmoji("🔄")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Registered /setup panel");
  } catch (error) {
    console.error("Could not register slash commands:", error);
  }
});

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isChatInputCommand() &&
        interaction.commandName === "setup" &&
        interaction.options.getSubcommand() === "panel") {

      if (!hasStaffAccess(interaction.member)) {
        return interaction.reply({
          content: "❌ You don't have permission to set up the Bunnieland panel.",
          ephemeral: true
        });
      }

      await interaction.channel.send(makePanel());
      return interaction.reply({
        content: "✅ Bunnieland panel created.",
        ephemeral: true
      });
    }

    if (!interaction.isButton()) return;

    if (!hasStaffAccess(interaction.member)) {
      return interaction.reply({
        content: "❌ You are not whitelisted/staff for this panel.",
        ephemeral: true
      });
    }

    if (interaction.customId === "bunnieland_get_script") {
      return interaction.reply({
        content:
          "📜 **Available scripts**\n\n" +
          "• **Main** — `SCRIPT_PLACEHOLDER`\n\n" +
          "Replace `SCRIPT_PLACEHOLDER` in `src/index.js` with the content or link you intend to distribute.",
        ephemeral: true
      });
    }

    if (interaction.customId === "bunnieland_reset_hwid") {
      return interaction.reply({
        content:
          "🔄 **HWID reset request received.**\n" +
          "This starter bot does not modify HWIDs automatically. A staff member can process the request manually.",
        ephemeral: true
      });
    }
  } catch (error) {
    console.error(error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Something went wrong while processing that interaction.",
        ephemeral: true
      });
    }
  }
});

client.login(DISCORD_TOKEN);
