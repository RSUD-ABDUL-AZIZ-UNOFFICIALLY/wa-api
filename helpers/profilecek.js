const cekprofile = async function (msq) {
    await client.getProfilePicUrl(msq.from).then(url => {
        console.log(url);
    });
    await client.getContactById(msq.from).then(contact => {
        console.log(contact.name);
        console.log(contact.pushname);
        console.log(contact.number);
        if (contact.number != null) {
            client.sendMessage(phoneNumberFormatter(contact.number), ('selamat pagi ' + contact.pushname));
        }

    });
    client.sendSeen();

}
const getContact = async function (msq) {
    await client.getContactById(msq.from).then(contacts => {
        console.log(contacts);
        return contacts;
    });
}

module.exports = {
    cekprofile,
    getContact
  }