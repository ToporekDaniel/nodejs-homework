const express = require("express");
const router = express.Router();
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts");

const mongoose = require("mongoose");

const checkID = (contactId) => {
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return false;
  }
  return true;
};

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  if (!checkID(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID format" });
  }
  try {
    const contact = await getContactById(contactId);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const newContact = await addContact({ name, email, phone });
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  if (!checkID(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID format" });
  }
  if (!checkID(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID format" });
  }
  try {
    const result = await removeContact(contactId);
    if (!result) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    console.error(error.message);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const body = req.body;
  if (!checkID(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID format" });
  }
  try {
    const updatedContact = await updateContact(contactId, body);
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  if (!checkID(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID format" });
  }
  if (favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }
  try {
    const updatedContact = await updateContact(contactId, { favorite });
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
