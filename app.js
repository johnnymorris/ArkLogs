/**
 * @file app.js
 * @description BeerBot
 * @author Beer
 * @version 0.0.1
 * You can authorise the application using the following link: https://discord.com/api/oauth2/authorize?client_id=946872624468877372&permissions=2080&scope=bot
 */

// Require all needed packages and files
const { Client, MessageEmbed, Permissions} = require('discord.js');
const { createConnection } = require('mysql');
const config = require('./config.json');
const fs = require('fs')

const request = require('request');

const client = new Client();

// Prepare the mysql connection
//let con = createConnection(config.mysql);

client.on('disconnect', function(erMsg, code) {
    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
    client.connect();
});;

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	}
});

// Ready event
client.on('ready', () => {
    // Log when bot is ready
    console.log(`${client.user.tag} is online!`);
	client.user.setActivity("For help: n! help");
});

// Login into your bot with the bot token
client.login(config.client.token);
