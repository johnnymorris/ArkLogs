const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('testing')
		.setDescription('Slash Commands Ryan!'),
	async execute(interaction) {
		return interaction.reply('Ryan');
	},
};