const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

const { createConnection } = require('mysql');		//SQL requirement
const config = require('../config.json');			//SQL requirement

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nitrado')
		.setDescription('nitrado, This ')
		.addSubcommand(subcommand =>
			subcommand
				.setName('setup')
				.setDescription('Configure your nitrado account'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('link')
				.setDescription('Configure your nitrado account'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('unlink')
				.setDescription('Info about the server')),
				
	async execute(interaction) {
		const member = interaction.member;
		if (interaction.options.getSubcommand() === 'setup') {
			return interaction.reply({ content: "[Click here to link your account](https://beerbot.jonathonmorris.co.uk/arklogs/bot_index.php?u="+member.id+")\n\Please click the above link to configure Nitrado with your account so we can work together.", ephemeral: true });
		} else if (interaction.options.getSubcommand() === 'link') {
			if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
				console.log('This user is NOT an administrator');
				return interaction.reply({ content: `Sorry you need to have administrator permissions in order to complete this.`, ephemeral: true });
			} else {
//				return interaction.reply({ content: `So you want to link your account to this server huh, i can see your an admin user`+member.id+`---`+interaction.guildId, ephemeral: true });
				let con = createConnection(config.mysql);			//SQL Requirement
				con.connect(err => {
					con.query(`INSERT INTO user_guild_link (user_id,guild_id) values ('`+member.id+`','`+interaction.guildId+`')`, (err, row) => {
						// Return if there is an error
						if (con.err) return console.log(err);
						con.end(function(err) {
							// The connection is terminated now
						});
						return interaction.reply({ content: `You have linked your nitrado account to this server`, ephemeral: true });
					});
				});
			}
		} else if (interaction.options.getSubcommand() === 'unlink') {
				let con = createConnection(config.mysql);			//SQL Requirement
				con.connect(err => {
					con.query(`DELETE FROM user_guild_link WHERE user_id='`+member.id+`' AND guild_id='`+interaction.guildId+`'`, (err, row) => {
						// Return if there is an error
						if (con.err) return console.log(err);
						con.end(function(err) {
							// The connection is terminated now
						});
						return interaction.reply({ content: `You have removed your nitrado account from this server`, ephemeral: true });
					});
				});
		} else {
			return interaction.reply({ content: `You should select one of the options.`, ephemeral: true });
		}
	},
};