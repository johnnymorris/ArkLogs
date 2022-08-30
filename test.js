const fs = require('node:fs');
const { Client, Intents, Discord } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });


client.once('ready', () => {
	console.log('Ready!');
	start_troubleshooting();
});


function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

async function start_troubleshooting(){
	let guildlink=await client.guilds.fetch(guildId);
	
	let role_name = "bb_tribe of beer";
	
	for(i=0;i<100;i++){
		console.log(i);
		let role = await guildlink.roles.cache.find(r => r.name.includes(role_name));
		console.log(role);
		if(role===null){
			console.log("was null");
		} else {
				role.delete('The role needed to go')
			.then(deleted => console.log(`Deleted role ${deleted.name}`))
			.catch(console.error);  
		}
		sleep(2000);
	}
  
}

client.login(token);