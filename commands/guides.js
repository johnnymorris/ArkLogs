const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed} = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guides')
		.setDescription('So you want to find a farming guide.')
		.addStringOption(option => option.setName('resource').setDescription('Enter the resource')
				.setRequired(true)
				.addChoices(
					{ name: 'Electronics', value: 'electronics' },
					{ name: 'Hide', value: 'hide' },
					{ name: 'ARB', value: 'arb' },
					{ name: 'Element', value: 'element' },
				)),
	async execute(interaction) {
		const member = interaction.member;
		const str_resource = interaction.options.getString('resource');
		var resource_url=" ";
		
		switch(str_resource){
            case "electronics":
				rssMap='Genesis Part 1';
				rssLoc="Don't Fear The Reaper King";
				rssItem='Any High DPS Tame';
				resource_url='https://www.youtube.com/watch?v=0lbX95allqI';
			break;
            case "hide":
				rssMap='Genesis Part 2';
				rssLoc='ShadowMane Prowl';
				rssItem='Giganotosaurus';
				resource_url='https://youtu.be/lK7Ex3QgCVM';
			break;
            case "arb":
				rssMap='Crystal Isles';
				rssLoc='N/A';
				rssItem='Mining Drill Stryder';
				resource_url='https://www.youtube.com/watch?v=cdcuGEyAPDg';
			break;
            case "element":
				rssMap='Extinction';
				rssLoc='N/A';
				rssItem='Mantis & Giganotosaurus';
				resource_url='https://www.youtube.com/watch?v=4RBr-eiYvGA';
			break;
            default: 
				resource_url=" ";
			break;
        }
		
		const ssembed = new MessageEmbed()
					.setColor(Math.floor(Math.random()*16777215).toString(16))
					.setURL(resource_url)
					.setTitle('Farming Guide for '+str_resource)
					.addFields(
						{ name: 'Map', value: rssMap,  },
						{ name: 'Location/Mission', value: rssLoc },
						{ name: 'Items/Dinos', value: rssItem },
						)
					.setDescription('Enjoy !')
					.setTimestamp(Date.now())
					.setFooter({text:'Farming Guide by ArkLogs'});
		interaction.reply({embeds: [ssembed]});
	},
};