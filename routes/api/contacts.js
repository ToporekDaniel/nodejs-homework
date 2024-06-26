const express = require("express");
const router = express.Router();
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../controllers/contacts");

const { schemaPOST, schemaPUT } = require("../../models/validateContact");

const mongoose = require("mongoose");

const checkID = (contactId) => {
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return false;
  }
  return true;
};

const validateContactId = (req, res, next) => {
  const { contactId } = req.params;
  if (!checkID(contactId)) {
    return res.status(400).json({ message: "Invalid contact ID format" });
  }
  next();
};

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    req.validatedBody = value;
    next();
  };
};

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const contacts = await listContacts(userId);
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:contactId", validateContactId, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", validateBody(schemaPOST), async (req, res, next) => {
  try {
    const { name, email, phone } = req.validatedBody;
    const userId = req.user._id;
    const newContact = await addContact({ name, email, phone }, userId);
    res.status(201).json(newContact);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/:contactId", validateContactId, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await removeContact(contactId);
    if (!result) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put(
  "/:contactId",
  validateContactId,
  validateBody(schemaPUT),
  async (req, res, next) => {
    const { contactId } = req.params;
    const { name, email, phone } = req.validatedBody;
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "Body is empty, no data to update" });
    }
    try {
      const updatedContact = await updateContact(contactId, {
        name,
        email,
        phone,
      });
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(200).json(updatedContact);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.patch(
  "/:contactId/favorite",
  validateContactId,
  async (req, res, next) => {
    const { contactId } = req.params;
    const { favorite } = req.body;
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
      console.error(error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;
