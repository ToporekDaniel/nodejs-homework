const fs = require("fs/promises");
const path = require("path");

const contactsFilePath = path.join(__dirname, "../models/contacts.json");

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsFilePath);
    return JSON.parse(data);
  } catch (error) {
    throw new Error("Error reading contacts file");
  }
};

const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contact = contacts.find((contact) => contact.id === contactId);
    if (!contact) throw new Error("Not found");
    return contact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const index = contacts.findIndex((contact) => contact.id === contactId);
    if (index === -1) {
      throw new Error("Contact not found");
    }
    contacts.splice(index, 1);
    await fs.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
  } catch (error) {
    throw new Error("Error removing contact");
  }
};

const addContact = async (body) => {
  try {
    const { name, email, phone } = body;
    if (!name || !email || !phone) {
      throw new Error("Missing required fields");
    }
    const newContact = { id: Date.now().toString(), name, email, phone };
    const contacts = await listContacts();
    contacts.push(newContact);
    await fs.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
    return newContact;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateContact = async (contactId, body) => {
  try {
    const contacts = await listContacts();
    const index = contacts.findIndex((contact) => contact.id === contactId);
    if (index === -1) return null;
    const updatedContact = { ...contacts[index], ...body };
    contacts[index] = updatedContact;
    await fs.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
    return updatedContact;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
