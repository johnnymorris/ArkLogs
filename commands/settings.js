const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Settings, you will need need the administrator permission in order to run any of these commands')
		.addSubcommand(subcommand =>
			subcommand
				.setName('configure')
				.setDescription('Configure the integration with nitrado'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server')),
				
	async execute(interaction) {
		const member = interaction.member;
		if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			console.log('This member is NOT an administrator');
			return interaction.reply({ content: `Sorry you need to have administrator permissions in order to complete this.`, ephemeral: true });
		} else {
			console.log('This member is a administrator');
			if (interaction.options.getSubcommand() === 'configure') {
				return interaction.reply({ content: "[Click here to link your account](https://beerbot.jonathonmorris.co.uk/bot_index.php?g="+interaction.guildId+")\n\Please click the above link to configure Nitrado with BeerBot so we can work together.", ephemeral: true });
			} else if (interaction.options.getSubcommand() === 'server') {
				return interaction.reply({ content: `So your looking for server stats huh`, ephemeral: true });
			} else {
				return interaction.reply({ content: `You should select one of the options.`, ephemeral: true });
			}
		}
	},
};