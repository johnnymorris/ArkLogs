const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

const { createConnection } = require('mysql');		//SQL requirement
const config = require('../config.json');			//SQL requirement

function pad_string(my_len,my_str){
	if(my_str.length<my_len){
		var difference = my_len-my_str.length;
		for (let i = 0; i < difference; i++) {
			my_str=my_str+" ";
		}
	}
	return my_str;
}



module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Return your dino stats'),
	async execute(interaction) {
		const member = interaction.member;
		var member_roles=member.roles.cache;
		var tribe="unknown";
		member_roles.forEach(role => {
			if(role.name.substring(0,3)=="bb_"){
			  tribe=role.name;
			  var row;
			  var dino_name = "Dinosaur";
			  var response="|"+pad_string(39,"Dinosaur Name")+"|"+pad_string(6,'Health')+"|"+pad_string(7,'Stamina')+"|"+pad_string(6,'Oxygen')+"|"+pad_string(4,'Food')+"|"+pad_string(6,'Weight')+"|"+pad_string(5,'Melee')+"|";
			  let con = createConnection(config.mysql);			//SQL Requirement
				con.connect(err => {
				var qry="SELECT * FROM dino_stats WHERE tribe='"+role.name+"' order by dino ASC";
					con.query(qry, (err, row_list) => {
						// Return if there is an error
						if (con.err) return console.log(err);
						//
						for(a=0;a<row_list.length;a++){ //For each account get server list
							row=row_list[a];
							response=response+"\n|"+pad_string(39,row['dino'])+"|"+pad_string(6,row['health'])+"|"+pad_string(7,row['stamina'])+"|"+pad_string(6,row['oxygen'])+"|"+pad_string(4,row['food'])+"|"+pad_string(6,row['weight'])+"|"+pad_string(5,row['melee'])+"|";
						}
						//
						con.end(function(err) {
							// The connection is terminated now
						});
						return interaction.reply({ content: response, ephemeral: true });
					});
				});
			}
		});
	},
};