const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { createConnection } = require('mysql');		//SQL requirement
const config = require('../config.json');			//SQL requirement
const generateRandomString = (myLength) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyz1234567890";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join("");
  return randomString;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tribe')
		.setDescription('Tribe settings, you can use this command to register/link your discord to your tribe')
		.addSubcommand(subcommand =>
			subcommand
				.setName('register')
				.setDescription('Register your tribe'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all known tribes')),
				
	async execute(interaction) {
		const member = interaction.member;
		if (interaction.options.getSubcommand() === 'register') {
		
			//var linkcode="5j8fkr9";
			var linkCode=generateRandomString(10);
			var userId=interaction.user.id;
			var guildLink=interaction.guild.id;
			
			
			let con = createConnection(config.mysql);
			con.on('error', function() {console.log('sql database connection timed out');});			
			con.connect(err => {
				// Console log if there is an error
				if (err) return console.log(err);
				con.query('SELECT * FROM tribeRegister WHERE guildId="'+guildLink+'"', async (server_list_token, listOfLinkCodes) => {//Check to see if the user already has a cryocode
					if(listOfLinkCodes.length>0){
						for(linkCode=generateRandomString(10);listOfLinkCodes.includes(linkCode);linkCode=generateRandomString(10)){
							console.log("Code already exists in guild, generating a new one");
						}
						var sql_cmd='INSERT INTO tribeRegister (linkCode,userId,guildId) VALUES ("'+linkCode+'","'+userId+'","'+guildLink+'")';
						console.log(sql_cmd);
						con.query(sql_cmd, async (server_list_token, list_of_servers) => {
							return interaction.reply({ content: "In order to register your character you will need to either cryo any dino called: "+linkCode+"\n\nIn the future you can rename a dino, then unclaim and claim it again if you do not have access to cryopods", ephemeral: true });
						});
					} else {
						var sql_cmd='INSERT INTO tribeRegister (linkCode,userId,guildId) VALUES ("'+linkCode+'","'+userId+'","'+guildLink+'")';
						console.log(sql_cmd);
						con.query(sql_cmd, async (server_list_token, list_of_servers) => {
							return interaction.reply({ content: "In order to register your character you will need to either cryo any dino called:"+linkCode+"\n\nIn the future you can rename a dino, then unclaim and claim it again if you do not have access to cryopods", ephemeral: true });
						});
					}
					con.end(function(err) {
						// The connection is terminated now
					});
				});
			})			
		} else if (interaction.options.getSubcommand() === 'list') {
			return interaction.reply({ content: "So your looking for a list of registered tribes, this feature is coming", ephemeral: true });
		} else {
			return interaction.reply({ content: "Sorry, not really sure what you are looking for.", ephemeral: true });
		}
	},
};