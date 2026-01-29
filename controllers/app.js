const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { phoneNumberFormatter, phoneNumberNormalizer } = require('../helpers/formatter');
const qrcode = require("qrcode-terminal");
const axios = require('axios');
const fs = require("fs");
const mime = require("mime-types");
require('dotenv').config();
const MYHOST = process.env.MYHOST || 'http://localhost:3000';


const client = new Client({
  // authStrategy: new NoAuth({
  authStrategy: new LocalAuth({
    clientId: 1
  }),
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
        // "--single-process", // <- this one doesn't works in Windows
        // "--disable-gpu",
      ],
  },
});

client.initialize();
console.log("Connection to Whatsapp Web Client");

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true }, function (qrcode) {
    console.log(qrcode);
  });
});

client.on("authenticated", async () => {
  console.log("AUTHENTICATED");
  console.log("WHATSAPP WEB => Authenticated");
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", async () => {
  console.log("WHATSAPP WEB => Ready");
  let online = await client.sendPresenceAvailable();
  console.log('WID:', client.info.wid);
  console.log("ONLINE ");
  client.pupPage.evaluate(() => {
    window.WWebJS.sendSeen = () => true;
  });
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
  console.log("WHATSAPP WEB => Message received");
  console.log(msg.id.remote);
  let seeder = msg.id.remote.split('@')[1];
  if (seeder == 'c.us') {
    let chat = await msg.getChat();
    let oldMessages = await chat.fetchMessages({ limit: 5 });
    let dataOld = [];
    for (let i = 0; i < oldMessages.length; i++) {
      console.log(oldMessages[i]);
      if (oldMessages[i]._data.type == 'chat') {
        dataOld.push({
          from: oldMessages[i]._data.from,
          body: oldMessages[i]._data.body,
          to: oldMessages[i]._data.to
        });
      }
    }
    let noHp = phoneNumberNormalizer(msg.from);
    console.log("WHATSAPP WEB => Number: " + noHp);
    // let kirim = await seedmsg(noHp, msg.body);
    // console.log(kirim);
    try {
      console.log("PRIVATE RECEIVED => : " + noHp);
      let processPesan = await axios.post(process.env.BOOTHOST + '/api/nlp/message', { nowa: noHp, message: msg.body, oldMessages: dataOld, replay: MYHOST })
      console.log(processPesan);
    } catch (error) {

    }

  }

  if (seeder == 'lid') {
    let chat = await msg.getChat();
    let oldMessages = await chat.fetchMessages({ limit: 3 });
    let dataOld = [];
    for (let i = 0; i < oldMessages.length; i++) {
      console.log(oldMessages[i]);
      if (oldMessages[i]._data.type == 'chat') {
        dataOld.push({
          from: oldMessages[i]._data.from,
          body: oldMessages[i]._data.body,
          to: oldMessages[i]._data.to
        });
      }
    }
    console.log("PRIVATE RECEIVED => : " + msg.from);
    console.log(msg.from);

    try {
      let processPesan = await axios.post(process.env.BOOTHOST + '/api/nlp/message', { nowa: msg.from, message: msg.body, oldMessages: dataOld, replay: MYHOST })
      console.log(processPesan);
    } catch (error) {

    }
  }

});


const findGroupByName = async function (groupName) {
  const chats = await client.getChats();
  const groups = chats.filter(chat => chat.id.server === 'g.us' && chat.name == groupName)
  return groups[0];
};



async function seedmsg(number, message) {
  try {
    if (!client.info || !client.info.wid) {
      return res.status(503).json({ error: 'Client belum ready' });
    }
    await client.sendPresenceAvailable();
    console.log("WHATSAPP WEB => Number: " + number);
    if (number.includes("@")) {
      await client.sendSeen(number);
      await client.sendMessage(number, message);
      return { status: true, message: "Message sent successfully by LID" };
    }
    let noHp = phoneNumberFormatter(number);
    console.log("WHATSAPP WEB => Number: " + noHp);
    const isRegistered = await client.isRegisteredUser(noHp);
    console.log("WHATSAPP WEB => isRegistered: " + isRegistered);
    console.log("WHATSAPP WEB => Message: " + message);
    if (isRegistered) {
      console.log("WHATSAPP WEB => User registered");
      try {
        await client.sendSeen(noHp);
        await client.sendMessage(noHp, message);
      } catch (error) {
        return { status: false, message: "Messrage failed to send", error: error };
      }
    // let off = await client.sendPresenceUnavailable();
    // console.log("OFF " + off);
      return { status: true, message: "Message sent successfully" };
    } else {
      console.log("WHATSAPP WEB => User not registered");
      return { status: false, message: "User not registered" };
    }
  } catch (error) {
      return { status: false, message: "Messrage error to send", error: error };
    }
  
}

async function sendGrubMsg(name, message) {
  if (!client.info || !client.info.wid) {
    return res.status(503).json({ error: 'Client belum ready' });
  }
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

async function cekCotak(nomor) {
  try {
    if (!client.info || !client.info.wid) {
      return res.status(503).json({ error: 'Client belum ready' });
    }
    await client.sendPresenceAvailable();
    if (nomor.includes('@')) {
      let isRegistered = await client.getChatById(nomor);
      // let isRegistered = await client.isRegisteredUser(nomor);
      return isRegistered
      return
    } else {
      let noHp = phoneNumberFormatter(nomor);
      const isRegistered = await client.isRegisteredUser(noHp);
      if (!isRegistered) {
        return { id: { _serialized: noHp, isRegistered: false } }
      }
      let data = await client.getChatById(noHp);
      data.id.isRegistered = true
      return data
    }
  } catch (error) {
    console.log(error);
    return false

  }


}
async function logout() {
  let on = await client.sendPresenceAvailable();
  console.log("ON " + on);
  let off = await client.sendPresenceUnavailable();
  // await client.logout();
  console.log("OFF " + off);
  let state = await client.getState();
  client.initialize();
  return { status: true, message: "Logout successfully" };
}
module.exports = {
  seedmsg,
  sendGrubMsg,
  sendMedia,
  getPic,
  cekCotak,
  logout
};





