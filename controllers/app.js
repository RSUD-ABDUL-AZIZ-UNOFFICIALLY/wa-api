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
// client.resetState();
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
  client.initialize();
});

client.on("ready", async () => {
  console.log("WHATSAPP WEB => Ready");
  let online = await client.sendPresenceAvailable();
  console.log('WID:', client.info.wid);
  console.log("ONLINE ");
  await client.sendPresenceUnavailable();
  client.pupPage.evaluate(() => {
    window.WWebJS.sendSeen = () => true;
  });
});

client.on("disconnected", (reason) => {
  console.log("Session file deleted!");
  console.log("Client was logged out", reason);
  client.initialize();
  // client.resetState();
});

client.on("change_state", (state) => {
  console.log("CHANGE STATE", state);
});

client.on('message', async (msg) => {
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
      let processPesan = await axios.post(process.env.BOOTHOST + '/message', { nowa: noHp, message: msg.body, oldMessages: dataOld, replay: MYHOST })
      console.log(processPesan);
    } catch (error) {
      console.error(error);

    }
    return

  }

  if (seeder == 'lid') {
    let dataOld = [];
    let chat = null;
    try {
      chat = await msg.getChat();
      console.log(chat);
      chat.sendStateTyping()
      let oldMessages = await chat.fetchMessages({ limit: 3 });
      for (let i = 0; i < oldMessages.length; i++) {
        // console.log(oldMessages[i]);
        if (oldMessages[i]._data.type == 'chat') {
          dataOld.push({
            from: oldMessages[i]._data.from,
            body: oldMessages[i]._data.body,
            to: oldMessages[i]._data.to
          });
        }
      }

    } catch (error) {
      console.error(error);
    }

    try {
      console.log("PRIVATE RECEIVED => : " + msg.from);
      console.log(msg.from + " => " + msg.body);
      // if (msg.body == "") {
      //   return
      // }
      let processPesan = await axios.post(process.env.BOOTHOST + '/message', { nowa: msg.from, message: msg.body, oldMessages: dataOld, replay: MYHOST })
      console.log(processPesan);
    } catch (error) {
      console.error('error post NLP');
      console.error(error);
    }
    return
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

      // await client.sendSeen(number);
      let chat = null;
      try {
        chat = await client.getChatById(number);
        await chat.sendSeen();
        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (error) {
        console.warn(`[Bypass] Failed to fetch chat to set typing state (r:r). Skipping... ${error}`);
      }

      await client.sendMessage(number, message, [{ MessageSendOptions: true }]);
      await client.sendPresenceUnavailable();
      return { status: true, message: "Message sent successfully by LID" };
    }
    let noHp = phoneNumberFormatter(number);
    console.log("WHATSAPP WEB => Number: " + noHp);
    const isRegistered = await client.isRegisteredUser(noHp);
    console.log("WHATSAPP WEB => isRegistered: " + isRegistered);
    console.log("WHATSAPP WEB => Message: " + message);
    if (isRegistered) {
      console.log("WHATSAPP WEB => User registered");
      let chat = null;
      try {
        // await client.sendSeen(noHp);
        chat = await client.getChatById(noHp);
        await chat.sendSeen();
        await chat.sendStateTyping();
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (error) {
        console.warn(`[Bypass] Failed to fetch chat to set typing state (r:r). Skipping... ${error}`);
      }
      await client.sendMessage(noHp, message);
      // let off = await client.sendPresenceUnavailable();
    // console.log("OFF " + off);
      await client.sendPresenceUnavailable();
      return { status: true, message: "Message sent successfully" };
    } else {
      await client.sendPresenceUnavailable();
      console.log("WHATSAPP WEB => User not registered");
      return { status: false, message: "User not registered" };
    }
  } catch (error) {
    client.initialize();
    // client.resetState();
    return { status: false, message: "Messrage error to send", error: error.message };
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
    await client.sendPresenceUnavailable();
    return { status: true, message: "Message sent successfully"};
  } else {
    await client.sendPresenceUnavailable();
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
      console.log("isRegistered" + isRegistered);
      if (!isRegistered) {
        return { id: { _serialized: noHp, isRegistered: false } }
      }
      try {
        let data = await client.getChatById(noHp);
        console.log(data);
        data.id.isRegistered = true
        return data
      } catch (error) {
        console.log(error);
      }
      return { id: { _serialized: noHp, isRegistered: true } }
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

async function getlistChat() {
  try {
    if (!client.info || !client.info.wid) {
      return { status: false, message: "Client belum ready" };
    }

    const chats = await client.getChats();
    const readChats = [];
    const unreadChats = [];

    for (let chat of chats) {
      const chatData = {
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        lastMessage: chat.lastMessage ? {
          body: chat.lastMessage.body,
          timestamp: chat.lastMessage.timestamp
        } : null,
        pinned: chat.pinned,
        archived: chat.archived
      };

      if (chat.unreadCount > 0) {
        unreadChats.push(chatData);
      } else {
        readChats.push(chatData);
      }
    }

    return {
      status: true,
      message: "Chat list retrieved successfully",
      data: {
        read: readChats,
        unread: unreadChats,
        totalChats: chats.length,
        totalRead: readChats.length,
        totalUnread: unreadChats.length
      }
    };
  } catch (error) {
    console.error("Error getting chat list:", error);
    await client.resetState();
    return { status: false, message: "Failed to get chat list", error: error.message };
  }
}
async function setUnread(id_chat) {
  try {
    if (!client.info || !client.info.wid) {
      return { status: false, message: "Client belum ready" };
    }

    const chat = await client.getChatById(id_chat);
    if (!chat) {
      return { status: false, message: "Chat not found" };
    }

    await chat.markUnread();
    return { status: true, message: "Chat marked as unread successfully" };
  } catch (error) {
    return { status: false, message: "Failed to mark chat as unread", error: error.message };
  }
}

async function getRiwayatChat(id_chat, limit) {
  try {
    if (!client.info || !client.info.wid) {
      return { status: false, message: "Client belum ready" };
    }

    const chat = await client.getChatById(id_chat);
    if (!chat) {
      return { status: false, message: "Chat not found" };
    }
    let oldMessages = await chat.fetchMessages({ limit: limit });
    for (let i = 0; i < oldMessages.length; i++) {
      const msg = oldMessages[i];
      if (msg.hasMedia && msg.type === 'image') {
        try {
          const media = await msg.downloadMedia();
          oldMessages[i].filename = media.filename || `image_${msg.timestamp}`;
          oldMessages[i].media = media;

        } catch (error) {
          console.error('Error downloading media:', error);
        }
      }
      if (msg.hasMedia && msg.type === 'document') {
        try {
          const media = await msg.downloadMedia();
          oldMessages[i].filename = media.filename || `document_${msg.timestamp}`;
          oldMessages[i].media = media;
        } catch (error) {
          console.error('Error downloading media:', error);
        }
      }
    }
    return { status: true, message: "Chat list retrieved successfully", data: { oldMessages } };
  } catch (error) {
    console.error("Error getting chat list:", error);
    await client.resetState();
    return { status: false, message: "Failed to get chat list", error: error.message };
  }
}

async function getImageChatsBase64(id_chat, limit) {
  try {
    if (!client.info || !client.info.wid) {
      return { status: false, message: "Client belum ready" };
    }

    const chat = await client.getChatById(id_chat);
    if (!chat) {
      return { status: false, message: "Chat not found" };
    }

    let oldMessages = await chat.fetchMessages({ limit: limit });
    let imageMessages = [];

    for (let i = 0; i < oldMessages.length; i++) {
      const msg = oldMessages[i];
      // Check if message has media and is of type image
      if (msg.hasMedia && msg.type === 'image') {
        try {
          const media = await msg.downloadMedia();
          if (media) {
            imageMessages.push({
              from: msg.from,
              to: msg.to,
              timestamp: msg.timestamp,
              type: msg.type,
              mimetype: media.mimetype,
              base64: media.data,
              filename: media.filename || `image_${msg.timestamp}`,
              size: media.data.length
            });
          }
        } catch (mediaError) {
          console.error("Error downloading media:", mediaError);
          imageMessages.push({
            from: msg.from,
            to: msg.to,
            timestamp: msg.timestamp,
            type: msg.type,
            error: "Failed to download media",
            filename: `image_${msg.timestamp}`
          });
        }
      }
    }

    return {
      status: true,
      message: "Image messages retrieved successfully",
      data: {
        totalMessages: oldMessages.length,
        totalImages: imageMessages.length,
        images: imageMessages
      }
    };
  } catch (error) {
    console.error("Error getting image chats:", error);
    return { status: false, message: "Failed to get image chats", error: error.message };
  }
}

async function findContactName(telp) {
  try {
    if (!client.info || !client.info.wid) {
      return { status: false, message: "Client belum ready" };
    }

    let formattedNumber = telp;

    // If the phone number doesn't include @, format it
    if (!telp.includes("@")) {
      formattedNumber = phoneNumberFormatter(telp);
    }

    // Try to get the contact
    const contact = await client.getContactById(formattedNumber);
    const profilePic = await client.getProfilePicUrl(formattedNumber);

    if (contact) {
      return {
        status: true,
        message: "Contact found",
        data: {
          number: formattedNumber,
          name: contact.name || contact.pushname || "Unknown",
          pushname: contact.pushname,
          shortName: contact.shortName,
          isBusiness: contact.isBusiness,
          isMyContact: contact.isMyContact,
          profilePicUrl: profilePic,
          contact: contact
        }
      };
    } else {
      return { status: false, message: "Contact not found" };
    }
  } catch (error) {
    console.error("Error finding contact:", error);
    return { status: false, message: "Failed to find contact", error: error.message };
  }
}
async function healthcek() {
  try {
    if (!client.info || !client.info.wid) {
      return { status: false, message: "Client belum ready" };
    }
    return { status: true, message: "Client is ready" };
  } catch (error) {
    console.error("Error checking client health:", error);
    return { status: false, message: "Failed to check client health", error: error.message };
  }

}

module.exports = {
  seedmsg,
  sendGrubMsg,
  sendMedia,
  getPic,
  cekCotak,
  logout,
  getlistChat,
  setUnread,
  getRiwayatChat,
  getImageChatsBase64,
  findContactName,
  healthcek
};





