const Contact = require("../models/contactSchema");
const mongoose = require("mongoose");

const listContacts = async () => {
  return Contact.find();
};

const getContactById = async (contactId) => {
  try {
    return await Contact.findById(contactId);
  } catch (error) {
    // Tak zostawiam te komentarze bo potem za grosz nie będę wiedział jak to zrobiłem
    // Jeśli wystąpił błąd "Cast to ObjectId failed", oznacza to, że identyfikator jest nieprawidłowy
    if (error instanceof mongoose.Error.CastError) {
      return null; // Zwracamy null, aby wskazać, że kontakt nie został znaleziony
    }
    // Jeśli wystąpił inny błąd, rzuć go dalej
    throw error;
  }
};

const addContact = async (body) => {
  return Contact.create(body);
};

const updateContact = async (contactId, body) => {
  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new Error("Contact not found");
  }

  Object.keys(body).forEach((key) => {
    if (body[key] !== undefined) {
      contact[key] = body[key];
    }
  });
  await contact.save();
  return contact;
};

const updateContactFavorite = async (contactId, { favorite }) => {
  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new Error("Contact not found");
  }
  Object.assign(contact, { favorite });
  await contact.save();
  return contact;
};

const removeContact = async (contactId) => {
  const result = await Contact.deleteOne({ _id: contactId });
  return result.deletedCount > 0; // Zwraca true, jeśli kontakt został usunięty, w przeciwnym razie false
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateContactFavorite,
};
