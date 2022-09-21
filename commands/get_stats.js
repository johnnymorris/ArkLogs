const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed} = require('discord.js');
const { Permissions } = require('discord.js');

const { createConnection } = require('mysql');		//SQL requirement
const config = require('../config.json');			//SQL requirement

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_stats')
		.setDescription('So you want to know some dinos stats?.')
		.addStringOption(option => option.setName('dinosaur').setDescription('Which type of dinosaur is it?')
				.setRequired(true)
				.addChoices(
					{ name: 'Anglerfish', value: 'anglerfish' },
					{ name: 'Ankylosaurus', value: 'ankylosaurus' },
					{ name: 'Griffin', value: 'griffin' },
				))
	.addStringOption(option => option.setName('health').setDescription('health value').setRequired(true))
	.addStringOption(option => option.setName('stamina').setDescription('stamina value').setRequired(true))
	.addStringOption(option => option.setName('oxygen').setDescription('oxygen value').setRequired(true))
	.addStringOption(option => option.setName('food').setDescription('food value').setRequired(true))
	.addStringOption(option => option.setName('weight').setDescription('weight value').setRequired(true))
	.addStringOption(option => option.setName('melee').setDescription('melee value').setRequired(true))
	,
	async execute(interaction) {
		const member = interaction.member;
		

		var qry="SELECT dino_name, ROUND((("+interaction.options.getString('health')+"-health)/health_wild_increase)) as stat_health, ROUND((("+interaction.options.getString('stamina')+"-stamina)/stamina_wild_increase)) as stat_stamina, ROUND((("+interaction.options.getString('oxygen')+"-oxygen)/oxygen_wild_increase)) as stat_oxygen, ROUND((("+interaction.options.getString('food')+"-food)/food_wild_increase)) as stat_food, ROUND((("+interaction.options.getString('weight')+"-weight)/weight_wild_increase)) as stat_weight, ROUND((("+interaction.options.getString('melee')+"-melee)/melee_wild_increase)) as stat_melee FROM `base_stats` WHERE dino_name LIKE '%"+interaction.options.getString('dinosaur')+"%'";
	

			let con = createConnection(config.mysql);			//SQL Requirement
			con.connect(err => {
			console.log(qry);
				con.query(qry, (err, row_list) => {
					// Return if there is an error
					if (con.err) return console.log(err);
					//
					for(a=0;a<row_list.length;a++){ //For each account get server list
						var row=row_list[a];
						const ssembed = new MessageEmbed()
							.setColor(Math.floor(Math.random()*16777215).toString(16))
							.setTitle('Dino Stats for '+interaction.options.getString('dinosaur'))
							.setDescription('**H** '+row['stat_health']+' (maybe a few points off for X/R variants)\n**S** '+row['stat_stamina']+'\n**O** '+row['stat_oxygen']+'\n**F** '+row['stat_food']+'\n**W** '+row['stat_weight']+'\n**M** '+row['stat_melee']+' (value, unable to convert to points)')
							.setTimestamp(Date.now())
							.setFooter({text:'ArkDino Stats by ArkLogs'});
						interaction.reply({embeds: [ssembed]});
					}
					//
					con.end(function(err) {
						// The connection is terminated now
					});
				});
			});
	},
};