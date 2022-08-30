FROM node:alpine

WORKDIR /mnt/user/appdata/arklogs/

COPY . .

RUN npm i
RUN npm install mariadb request discord.js @discordjs/builders @discordjs/rest discord-api-types
RUN npm list

CMD ["node", "index.js"]
