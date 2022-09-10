const fs = require('node:fs');
const { Client, MessageEmbed, Collection, Intents, Discord } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');
const { createConnection } = require('mysql');		//SQL requirement
const config = require('./config.json');			//SQL requirement
const request = require('request');					//HTTP & Nitrado requirement

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const update_commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
	update_commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: update_commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

client.once('ready', () => {
	console.log('Ready!');
	get_logs();
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

async function give_me_game_user_settings(service_id,username,access_token){
	return new Promise(resolve => {
	//Start Get File
		const o_lloc = {
			url: "https://api.nitrado.net/services/"+service_id+"/gameservers/file_server/download?file=%2Fgames%2F"+username+"%2Fnoftp%2Farkps%2FShooterGame%2FSaved%2FConfig%2FWindowsServer%2FGameUserSettings.ini&offset=0&length=4048",
			headers: {
				'Authorization': access_token
			}
		};

		async function c_lloc(e_lloc, r_lloc, b_lloc) {
			if (!e_lloc && r_lloc.statusCode == 200) {
				const nitrapi_lloc = JSON.parse(b_lloc);
				//Start Pull
				const o_log = {
					url: nitrapi_lloc['data']['token']['url'],
					headers: {
						'Authorization': access_token
					}
				};
				
				async function c_log(e_log, r_log, b_log) {
					if (!e_log && r_log.statusCode == 200) {
						const myresponsedata = [];
						const full_logs=b_log.split('\n');	//This will split the log file into new lines
						//console.log(full_logs);	//This will print out the log file
						for(x=0;x<full_logs.length;x++){
							row=full_logs[x];
							if(row.split('=').length==2){
								var key=row.split('=')[0];
								var val=row.split('=')[1];
								myresponsedata[key]=val;
								
							}
							
						}
						resolve(myresponsedata);
					};
				}
				request(o_log, c_log);
			}
		};
		request(o_lloc, c_lloc);
	//End Get File
	});
}
async function convert_ark_map(full_map_name){
return new Promise (resolve => {
		var display_map_name=full_map_name.replace("preinstalled", "").replace(",1,", "").replace(",2,", "").replace(",3,", "").replace(",4,", "").replace(",5,", "").replace(",6,", "").replace(",7,", "").replace(",8,", "").replace(",9,", "").replace(",10,", "").replace(",11,", "").replace(",12,", "").replace(",13,", "").replace(",14,", "").replace(",15,", "");
	resolve(display_map_name);
});
}

async function give_me_gameserver_info(user_id,server_id,access_token){
	return new Promise(resolve => {
	//Start function
	const o_gameservers = {
		url: 'https://api.nitrado.net/services/'+server_id+'/gameservers',
		headers: {
			'Authorization': access_token
		}
	};
	
	async function c_gameservers(e_gameservers, r_gameservers, b_gameservers) {
		if(r_gameservers.statusCode==401){
			//access token expired. need to generate a refresh token
			const o_refreshtoken = {
				url: 'https://beerbot.jonathonmorris.co.uk/arklogs/arkrefreshtoken.php?u='+user_id,
				headers: {
					'Authorization': access_token
				}
			};
			
			function c_refreshtoken(e_refreshtoken, r_refreshtoken, b_refreshtoken) {
				if (!e_refreshtoken && r_refreshtoken.statusCode == 200) {
					const rtokenlog = b_refreshtoken;
				}
			};
			request(o_refreshtoken,c_refreshtoken)
		}
		
		if (!e_gameservers && r_gameservers.statusCode == 200) {
			const nitrapi_services = JSON.parse(b_gameservers);
			responsedata=nitrapi_services['data']['gameserver'];
			resolve(nitrapi_services['data']['gameserver']);
		}
	}
	request(o_gameservers,c_gameservers);
	//End function	
	});
}

async function give_me_server_list(user_id,access_token,guild_link){
	return new Promise(resolve => {
	const o_services = {
		url: 'https://api.nitrado.net/services/',
		headers: {
			'Authorization': access_token
		}
	};

	async function c_services(e_services, r_services, b_services) {
		if(r_services.statusCode==401){
			const o_refreshtoken = {
				url: 'https://beerbot.jonathonmorris.co.uk/arklogs/arkrefreshtoken.php?u='+user_id,
				headers: {
					'Authorization': access_token
				}
			};
			
			function c_refreshtoken(e_refreshtoken, r_refreshtoken, b_refreshtoken) {
				if (!e_refreshtoken && r_refreshtoken.statusCode == 200) {
					const rtokenlog = b_refreshtoken;
				}
			};
			request(o_refreshtoken,c_refreshtoken)
		}

		if (!e_services && r_services.statusCode == 200) {
			const nitrapi_services = JSON.parse(b_services);
			requested_data=nitrapi_services['data']['services'];
			//resolve(requested_data);
			//
			let servers = await Promise.all(
					requested_data.map(async (server) =>{
						const mylog = [];
						mylog['serverinfo']=await give_me_gameserver_info(user_id,server['id'],access_token);
						mylog['serverdetails']=server;
						mylog['last_log_line']=await get_last_log_line(server['id']);
						mylog['linkage']=access_token;
						mylog['guildlink']=guild_link;
						return mylog;
					})
				);
				resolve(servers);
			//
		}
	}
	request(o_services,c_services);
	});
}

async function give_me_player_list(server_id,user_id,access_token){
	return new Promise(resolve => {
	//Start function
	const o_gameservers = {
		url: 'https://api.nitrado.net/services/'+server_id+'/gameservers/games/players',
		headers: {
			'Authorization': access_token
		}
	};
	
	async function c_gameservers(e_gameservers, r_gameservers, b_gameservers) {
		if(r_gameservers.statusCode==401){
			const o_refreshtoken = {
				url: 'https://beerbot.jonathonmorris.co.uk/ns/arkrefreshtoken.php?u='+user_id,
				headers: {
					'Authorization': access_token
				}
			};
			
			function c_refreshtoken(e_refreshtoken, r_refreshtoken, b_refreshtoken) {
				if (!e_refreshtoken && r_refreshtoken.statusCode == 200) {
					const rtokenlog = b_refreshtoken;
				}
			};
			request(o_refreshtoken,c_refreshtoken)
		}
		
		if (!e_gameservers && r_gameservers.statusCode == 200) {
			const nitrapi_services = JSON.parse(b_gameservers);
			responsedata=nitrapi_services['data']['players'];
			resolve(nitrapi_services['data']['players']);
		}
	}
	request(o_gameservers,c_gameservers);
	//End function	
	});
}

async function getUserFromLinkCode(linkCode){
	return new Promise(resolve => {
		let response;

		let con = createConnection(config.mysql);
		con.on('error', function() {console.log('sql database connection timed out');});			
		con.connect(err => {
			// Console log if there is an error
			if (err) return console.log(err);
			con.query('SELECT userId FROM tribeRegister WHERE linkCode="'+linkCode+'"', async (server_list_token, userId) => {
				if(userId.length>0){
					console.log(userId[0]['userId']);
					//con.query('DELETE FROM tribeRegister WHERE linkCode="'+linkCode+'"', async (server_list_token, userId) => {console.log("Token claimed now removing from database");});
					resolve(userId[0]['userId']);
				} else
					resolve("false");
				con.end(function(err) {
					// The connection is terminated now
				});
			});
		})
	});
}

async function sql_get_server_list(){
	return new Promise(resolve => {
		let response;

		let con = createConnection(config.mysql);
		con.on('error', function() {console.log('sql database connection timed out');});			
		con.connect(err => {
			// Console log if there is an error
			if (err) return console.log(err);
			con.query('SELECT user_guild_link.guild_id,users.* FROM user_guild_link JOIN users ON user_guild_link.user_id=users.user_id', async (server_list_token, list_of_servers) => {
				resolve(list_of_servers);
				con.end(function(err) {
					// The connection is terminated now
				});
			});
		})
	});
}

async function get_last_log_line(service_id){
	return new Promise(resolve => {
		let response;

		let con = createConnection(config.mysql);
		con.on('error', function() {console.log('sql database connection timed out');});			
		con.connect(err => {
			// Console log if there is an error
			if (err) return console.log(err);
			con.query('SELECT * FROM server_settings WHERE service_id="'+service_id+'"', async (server_list_token, list_of_servers) => {
				if(list_of_servers.length>0){
					resolve(list_of_servers[0]['log_line']);
				} else {
					con.query('INSERT INTO server_settings (service_id,log_line) VALUES ("'+service_id+'",0)', async (server_list_token, list_of_servers) => {
						resolve('0');
					});
				}
				con.end(function(err) {
					// The connection is terminated now
				});
			});
		})
	});
}

async function monitorCheckIn(){
	//Start function
	const o_gameservers = {
		url: 'http://192.168.0.6:3001/api/push/LleWCEaNr3?status=up&msg=OK&ping='
	};
	
	async function c_gameservers(e_gameservers, r_gameservers, b_gameservers) {
		if (!e_gameservers && r_gameservers.statusCode == 200) {
			var myTimeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
			console.log(myTimeStamp + " - Checked in to UptimeKuma at 192.168.0.6");
		}
	}
	request(o_gameservers,c_gameservers);
	//End function
}

async function nitrado_get_service(user_id,access_token){
	return new Promise(resolve => {
		const o_services = {
			url: 'https://api.nitrado.net/services/',
			headers: {
				'Authorization': access_token
			}
		};

		async function c_services(e_services, r_services, b_services) {
			if(r_services.statusCode==401){
				const o_refreshtoken = {
					url: 'https://beerbot.jonathonmorris.co.uk/arklogs/arkrefreshtoken.php?u='+user_id,
					headers: {
						'Authorization': access_token
					}
				};
				
				function c_refreshtoken(e_refreshtoken, r_refreshtoken, b_refreshtoken) {
					if (!e_refreshtoken && r_refreshtoken.statusCode == 200) {
						const rtokenlog = b_refreshtoken;
					}
				};
				request(o_refreshtoken,c_refreshtoken)
			}

			if (!e_services && r_services.statusCode == 200) {
				const nitrapi_services = JSON.parse(b_services);
				resolve(nitrapi_services['data']['services']);
			}
		}
		request(o_services,c_services);
	});
}

async function parse_log(obj){
	let access_token=obj['linkage'];
	let guildlink=await client.guilds.cache.get(obj['guildlink']);
	map_name=await convert_ark_map(obj['serverinfo']['settings']['config']['map']);
	
	console.log('Checking Log for server '+map_name);
	
	//Configuration Options
	let bb_category_channel="logs_";		//Category names
	let role_admin = guildlink.roles.cache.find((role) => role.name === "admins",);		//admin roles (who can view all)
	let textCategory = bb_category_channel+map_name+"_"+obj["serverinfo"]["service_id"];
	
	
	let parent = guildlink.channels.cache.find((channel) => channel.name === textCategory,);
	if (!parent) {
		parent = await guildlink.channels.create(textCategory, { type: 'GUILD_CATEGORY',permissionOverwrites: [
				{id: guildlink.id,deny: ['VIEW_CHANNEL'],},
				{id: client.user,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
				{id: role_admin,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
			],
		});
	}
	
	//Now we have all the data we need in a SQL command we can query for a fresh token to download the log file and then read it.
	const o_lloc = {
		url: "https://api.nitrado.net/services/"+obj['serverinfo']['service_id']+"/gameservers/file_server/download?file=%2Fgames%2F"+obj['serverinfo']['username']+"%2Fnoftp%2Farkps%2FShooterGame%2FSaved%2FLogs%2FShooterGame.log&offset=0&length=4048",
		headers: {
			'Authorization': access_token
		}
	};

	var logurl;

	async function c_lloc(e_lloc, r_lloc, b_lloc) {
		if (!e_lloc && r_lloc.statusCode == 200) {
		const nitrapi_lloc = JSON.parse(b_lloc);
			logurl=nitrapi_lloc['data']['token']['url'];
		
		//Start Pull
		const o_log = {
			url: logurl,
			headers: {
				'Authorization': access_token
			}
		};
			
		//Create Admin Logs Channel if does not exist
		let bb_admin_channel=bb_category_channel+"admin";
		let bb_admin = await parent.children.find((channel) => channel.name === bb_admin_channel,);
		if (!bb_admin) {
			bb_admin = await guildlink.channels.create(bb_admin_channel, { parent, permissionOverwrites: [
					{id: guildlink.id,deny: ['VIEW_CHANNEL'],},
					{id: client.user,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
					{id: role_admin,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
				],
			});
		}
		
		
		//Create commands Logs Channel if does not exist
		let bb_command_channel=bb_category_channel+"commands";
		let bb_command = await parent.children.find((channel) => channel.name === bb_command_channel,);
		if (!bb_command) {
			bb_command = await guildlink.channels.create(bb_command_channel, { parent, permissionOverwrites: [
					{id: guildlink.id,deny: ['VIEW_CHANNEL'],},
					{id: client.user,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
					{id: role_admin,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
				],
			});
		}
		
		//Create Chat Logs If does not exist
		let bb_chat_channel=bb_category_channel+"chat";
		let bb_global = await parent.children.find((channel) => channel.name === bb_chat_channel,
		);
		if (!bb_global) {
			bb_global = await guildlink.channels.create(bb_chat_channel, { parent, permissionOverwrites: [
					{id: guildlink.id,deny: ['VIEW_CHANNEL'],},
					{id: client.user,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
					{id: role_admin,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
				],
			});
		}
		
		async function c_log(e_log, r_log, b_log) {
			if (!e_log && r_log.statusCode == 200) {				
				
				const full_logs=b_log.split('\n');
				
				if(obj["last_log_line"] > (full_logs.length-1)){
					//Log file has been reset, reset the line number.
					//If possible we might want to consider quickly checking _Last and pulling the remaining lines, but not sure how to deal with this yet.
					var current_line = 0;
					//Need to update log_line in the database so it processes the logs next time
					await update_log_line(0,obj['serverinfo']['service_id']);
					
				} else
					var current_line = obj["last_log_line"];

				//Show Log Information
				if(obj['serverinfo']['service_id']==9779319)
				for(var i = current_line;i < (full_logs.length-1);i++){
					if(full_logs[i].includes("AdminCmd")){
						bb_command.send('```fix\n/'+full_logs[i].substr(full_logs[i].search(": ")+2)+'```');
					} if(full_logs[i].includes("duped item")){
						bb_admin.send('```fix\n/'+full_logs[i].substr(full_logs[i].search(": ")+2)+'```');
					} else if(full_logs[i].includes(": Tribe  Tamed")){
						//Do nothing
					} else if(full_logs[i].includes(": Tribe")){
							let start=full_logs[i].search("Tribe ")
							let tribe_name=full_logs[i].substring(start+6,full_logs[i].search(",",start));
							let role_tribeName='bb_'+tribe_name.toLowerCase()
							let tribe_color="#0080FF";
							if(tribe_name.includes("pve")){
								tribe_color="#00FF00";
							} else {
								tribe_color="#00ffff";
							}
							
							//Check if Tribe Role Exists if not create it.
							let role_tribe = await guildlink.roles.cache.find((role) => role.name === role_tribeName,);
							if (!role_tribe) {
								let role_tribe = await guildlink.roles.create({
								  name: role_tribeName,
								  color: tribe_color,
								  reason: 'Used to grant access to the tribe logs'
								});
							}
							var checkComplete=true;
							if (typeof role_tribe === 'undefined'){
								//Role is invalid so we have to skip this tribe logs file.
								checkComplete=false;
							} else {
								//We failed to create the role so we cannot parse this tribes log

								//Got Tribe Name & Role Group Grab Channel For Specific Map
								let bb_tribe_channel=bb_category_channel+tribe_name.replace(/ /g,"_").toLowerCase();
								let bb_tribe =  await parent.children.find((channel) => channel.name === bb_tribe_channel,);
								if (!bb_tribe) {
									bb_tribe = await guildlink.channels.create(bb_tribe_channel, { parent, permissionOverwrites: [
											{id: guildlink.id,deny: ['VIEW_CHANNEL'],},
											{id: client.user,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
											{id: role_tribe,allow: ['VIEW_CHANNEL'],},
											{id: role_admin,allow: ['VIEW_CHANNEL','MANAGE_CHANNELS'],},
										],
									});
								}
								
								//linkCode Check
								if(full_logs[i].includes("froze ")){
									let linkCodeStart=full_logs[i].search("froze");
									let linkCodeEnd=full_logs[i].indexOf(" ",linkCodeStart+7);
									let linkCode=full_logs[i].substring(linkCodeStart+6,linkCodeEnd);
									let user_id=await getUserFromLinkCode(linkCode);
									if(!isNaN(user_id)){
										let member = await guildlink.members.fetch(user_id);
										console.log(member);
										//Assign Tribe Role
										member.roles.add(role_tribe);
										console.log(member.user.username +" was given tribe role "+role_tribe.name);
										//Assign Registered Role
										let registered_role = await guildlink.roles.cache.find((role) => role.name === "Registered",);
										member.roles.add(registered_role);
										console.log(member.user.username +" was given tribe role Registered");
									} else {
										//console.log("result was false, probably already claimed");
									}
								}
								
								//End deal with Tribe Channel
							  let current_line_log=full_logs[i].substr(full_logs[i].search(": ")+2).replace('</>','').replace('<RichColor Color="0, 1, 0, 1">','').replace('<RichColor Color="1, 1, 0, 1">','').replace('<RichColor Color="0, 1, 1, 1">','').replace('<RichColor Color="1, 0, 0, 1">','').replace('<RichColor Color="1, 0.75, 0.3, 1">','').replace('<RichColor Color="1, 0, 1, 1">','').replace('<RichColor Color="0.45, 0.85, 0.55, 1">','');
								
								//Parse Tribe Log
								if(full_logs[i].includes("destroyed your 'Tek") || full_logs[i].includes("destroyed your 'Large Tek")){
									bb_tribe.send('```diff\n- <@&'+role_tribe+'> '+current_line_log+'\n```');
								}else if(full_logs[i].includes("killed")){
									bb_tribe.send('```diff\n-'+current_line_log+'\n```');
								} else if(full_logs[i].includes("Tame")){
									bb_tribe.send('```diff\n+ '+current_line_log+'\n```');
								} else {
									bb_tribe.send('```diff\n'+current_line_log+'```');
								}
							}
						} else if(full_logs[i].includes("):")){
						//Send the Global Chat Log
						bb_global.send('```css\n'+full_logs[i].substr(full_logs[i].search(": ")+2)+'```');
					} else if(full_logs[i].includes(" this ARK!")){
						//Join/Leave this ark
					} else if(full_logs[i].includes("[KillerSID:")){
						//Kill/Death leaderboard
						let current_line_log=full_logs[i].substr(full_logs[i].search(": ")+2).replace('</>','').replace('<RichColor Color="0, 1, 0, 1">','').replace('<RichColor Color="1, 1, 0, 1">','').replace('<RichColor Color="0, 1, 1, 1">','').replace('<RichColor Color="1, 0, 0, 1">','').replace('<RichColor Color="1, 0.75, 0.3, 1">','').replace('<RichColor Color="1, 0, 1, 1">','').replace('<RichColor Color="0.45, 0.85, 0.55, 1">','');

						var endCharacter = current_line_log.indexOf("!");
						var substring=current_line_log.substring(0,endCharacter);
						//GET KILL
						kill_info=await get_kill_details(substring);
						var substring2=substring.replaceAll("()","").split('was killed by');
						
					//Check if this bot has previously added a message.
						let kill_log = await guildlink.channels.cache.find(c => c.name.includes("kill_log")) ;
						
						//Create embed item				
						const ssembed = new MessageEmbed()
							.setColor(kill_info['color'])
							.setURL('')
							.setTitle(kill_info['title'])
							.setDescription('\n**Killed:**'+substring2[0].trim()+'\n**Killer:**'+substring2[1].trim()+'\n')
							//.setAuthor('Beer', '', '')
							.setTimestamp(Date.now())
							.setFooter({text:'Nitrado KillBot by BeerBot'});
							
							kill_log.send({embeds: [ssembed]});
						
					} else {
						//Extra 
					}
					await update_log_line(i,obj['serverinfo']['service_id']);
				}
				
						
							
				
				//End Log Information
			}
		};
		request(o_log, c_log);
		}
	};
	request(o_lloc, c_lloc);
}

async function update_log_line(i,service_id){
	let con = createConnection(config.mysql);
	con.on('error', function() {console.log('sql database connection timed out');});			
	con.connect(err => {
		// Console log if there is an error
		if (err) return console.log(err);
		//Completed actioning this line Time to update the row in the database to show which line within the logfile we have processed up to.
		con.query('UPDATE server_settings SET log_line = "'+i+'" WHERE service_id = "'+service_id+'"', (err, row) => {
		// Return if there is an error
			if (err) return console.log(err);
			con.end(function(err) {
				// The connection is terminated now
			});
		});
	});//Remove this one outside the for loop
}


async function get_kill_details(kill_log){
	return new Promise (resolve => {
		var myTimeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
		console.log(myTimeStamp + ' - '+ kill_log);
		if(kill_log.indexOf("()")==-1){ //It was PVE'd
			if(kill_log.indexOf(") (")==-1){
				var pveOrPvp='FF0000';
				var kill_title="pwned by pure skill of the killer or lack off";
			} else {
				var pveOrPvp='FFA500';
				var kill_title="pwned, but a tame was involved";
			}
		}else{	//It was PVE
			var pveOrPvp='7CFC00';
			var kill_title="Yikes, a PVE kill, this is embarrassing";
		}

		var kill_details = {
			color: pveOrPvp,
			title: kill_title
	   };


		resolve(kill_details);
	});
}

async function get_logs(){
	
	//Trigger status check (to show system still working)
	monitorCheckIn();

	let sql_server_list = await sql_get_server_list();
	
	for(a=0;a<sql_server_list.length;a++){ //For each account get server list
		sql_server_list_obj=sql_server_list[a];
		let local_servers = await give_me_server_list(sql_server_list_obj['user_id'],sql_server_list_obj['access_token'],sql_server_list_obj['guild_id']);
		
		local_servers.forEach(async(obj) =>{
			parse_log(obj);
		});
	}
	
	
	setTimeout(get_logs, 1800000);
}

client.login(token);
