const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { phoneNumberFormatter, phoneNumberNormalizer } = require('../helpers/formatter');
const qrcode = require("qrcode-terminal");
const axios = require('axios');
const fs = require("fs");
const mime = require("mime-types");
require('dotenv').config();
console.log("Connection to Whatsapp Web Client");

const client = new Client({
  // authStrategy: new NoAuth({
  authStrategy: new LocalAuth({
    // clientId: "client-two",
    // dataPath: "./data",
    restartOnAuthFail: false,
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process", // <- this one doesn't works in Windows
        "--disable-gpu",
      ],
    },
  }),
});

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true }, function (qrcode) {
    console.log(qrcode);
  });
});

client.on("authenticated", async (session) => {
  console.log("WHATSAPP WEB => Authenticated");
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", async () => {
  console.log("WHATSAPP WEB => Ready");
});

client.on("disconnected", (reason) => {
  console.log("Session file deleted!");
  console.log("Client was logged out", reason);
  // client.initialize();
  client.resetState();
});

client.on("change_state", (state) => {
  console.log("CHANGE STATE", state);
});

client.on('message',async (msg) => {
  // if (msg.body == '!ping') {
  //     msg.reply('pong');
  // }
  let seeder = msg.id.remote.split('@')[1];
  if (seeder == 'c.us') {
    let noHp = phoneNumberNormalizer(msg.from);
    console.log("WHATSAPP WEB => Number: " + noHp);
    // let kirim = await seedmsg(noHp, msg.body);
    // console.log(kirim);
    try {
      axios.post(process.env.BOOTHOST + '/api/nlp/message', { nowa: noHp, message: msg.body })
    } catch (error) {

    }

  }
  console.log(msg.id.remote);
  console.log("MESSAGE RECEIVED");
});


const findGroupByName = async function (groupName) {
  const chats = await client.getChats();
  const groups = chats.filter(chat => chat.id.server === 'g.us' && chat.name == groupName)
  return groups[0];
};



async function seedmsg(number, message) {
  let on = await client.sendPresenceAvailable();
   console.log("ON " +on);
  let noHp = phoneNumberFormatter(number);
  console.log("WHATSAPP WEB => Number: " + noHp);
  const isRegistered = await client.isRegisteredUser(noHp);
  console.log("WHATSAPP WEB => isRegistered: " + isRegistered);
  console.log("WHATSAPP WEB => Message: " + message);
  if (isRegistered) {
    console.log("WHATSAPP WEB => User registered");
    let chat = await client.getChatById(noHp);
    chat.sendSeen();
    await chat.sendStateTyping();
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      await client.sendMessage(noHp, message);
    } catch (error) {
      // return { status: false, message: "Messrage failed to send", error: error };
    }
  let off = await client.sendPresenceUnavailable();
  console.log("OFF " + off);
    return { status: true, message: "Message sent successfully"};
  } else {
    console.log("WHATSAPP WEB => User not registered");
    return { status: false, message: "User not registered"};
  }
  
}

async function sendGrubMsg(name, message) {
  await client.sendPresenceAvailable();
  console.log("WHATSAPP WEB => Group name: " + name);
  const group = await findGroupByName(name);
  if (group) {
    console.log("WHATSAPP WEB => Group found");
    try {
      await client.sendMessage(group.id._serialized, message);
    } catch (error) {
      return { status: false, message: "Message failed to send", error: error};
    }
    return { status: true, message: "Message sent successfully"};
  } else {
    console.log("WHATSAPP WEB => Group not found");
    return { status: false, message: "Group not found"};
  }
}
async function sendMedia(pdfUrl, to, stt, fileName) {
  // Unduh file PDF
  let response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
  // let contentType = mime.contentType(fileName);
  let contentType = response.headers['content-type'];
  let media = new MessageMedia(contentType, Buffer.from(response.data).toString('base64'), fileName + "." + contentType.split("/")[1]);
  if (stt == 'group') {
    const group = await findGroupByName(to);
    if (group) {
      await client.sendMessage(group.id._serialized, media);
      console.log('PDF dikirim ke:', group.id._serialized);
      return { status: true, message: "Message sent successfully" };
    } else {
      console.log("WHATSAPP WEB => Group not found");
      return { status: false, message: "Group not found" };
    }
  }
  if (stt == 'personal') {
    let on = await client.sendPresenceAvailable();
    console.log("ON " + on);
    let noHp = phoneNumberFormatter(to);
    console.log("WHATSAPP WEB => Number: " + noHp);
    const isRegistered = await client.isRegisteredUser(noHp);
    if (isRegistered) {
      console.log("WHATSAPP WEB => User registered");
      try {
        await client.sendMessage(noHp, media);
      } catch (error) {
        return { status: false, message: "Message failed to send", error: error };
      }
      let off = await client.sendPresenceUnavailable();
      console.log("OFF " + off);
      return { status: true, message: "Message sent successfully" };
    } else {
      console.log("WHATSAPP WEB => User not registered");
      return { status: false, message: "User not registered" };
    }
  }
}




async function getPic(telp){
  let noHp = phoneNumberFormatter(telp);
  const isRegistered = await client.isRegisteredUser(noHp);
  if (isRegistered) {
    const profilePic = await client.getProfilePicUrl(noHp);
    return { status: true, message: "Profile pic found", data: {profilePic}};
  } else {
    return { status: false, message: "User not registered"};
  }
}
module.exports = {
  seedmsg,
  sendGrubMsg,
  sendMedia,
  getPic
};





