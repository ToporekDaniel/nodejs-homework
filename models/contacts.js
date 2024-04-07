const Contact = require("./contactSchema");

const listContacts = async () => {
  return Contact.find();
};

const getContactById = async (contactId) => {
  return Contact.findById(contactId);
};

const addContact = async (body) => {
  return Contact.create(body);
};
// const addContact = async ({ name, email, phone, favorite }) => {
//   return Contact.create({ name, email, phone, favorite });
// };

const updateContact = async (contactId, body) => {
  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new Error("Contact not found");
  }
  Object.assign(contact, body);
  await contact.save();
  return contact;
};
// return Contact.findById(contactId).save(body);

const removeContact = async (contactId) => {
  return Contact.deleteOne({ _id: contactId });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
