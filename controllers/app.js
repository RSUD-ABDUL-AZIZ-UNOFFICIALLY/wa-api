const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { phoneNumberFormatter } = require('../helpers/formatter');
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const mime = require("mime-types");
const e = require("cors");
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
  // console.log(msg);
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
    try {
      await client.sendMessage(noHp, message);
    } catch (error) {
      return { status: false, message: "Message failed to send", error: error};
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
  getPic
};





