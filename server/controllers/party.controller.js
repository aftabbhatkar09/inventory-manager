import Party from "../models/party.model.js";
import Transaction from "../models/transaction.model.js";
import {
  getPartyLedger,
  getPartyLedgerWithEntries,
} from "../utils/ledger.util.js";
import {
  assertFiniteNumber,
  handleControllerError,
} from "../utils/validate.util.js";

const validatePartyTypes = (type) => {
  const invalid = type.filter((t) => !["customer", "supplier"].includes(t));

  if (invalid.length > 0) {
    return `Invalid type(s): ${invalid.join(", ")}`;
  }

  return null;
};

// Create Party
export const createParty = async (req, res) => {
  try {
    const { name, phone, email, address, type, openingBalance } = req.body;

    if (!name || !type || type.length === 0) {
      return res
        .status(400)
        .json({ message: "Name and atleast one type is required" });
    }

    const typeError = validatePartyTypes(type);
    if (typeError) {
      return res.status(400).json({ message: typeError });
    }

    if (openingBalance !== undefined) {
      assertFiniteNumber(openingBalance, "Opening balance");
    }

    const party = new Party({
      name,
      phone,
      email,
      address,
      type,
      openingBalance,
    });

    const savedParty = await party.save();

    res.status(201).json(savedParty);
  } catch (error) {
    handleControllerError(res, error, "Error creating party");
  }
};

// Get All Parties
export const getAllParties = async (req, res) => {
  try {
    const parties = await Party.find({ isDeleted: false }).sort({
      createdAt: -1,
    });

    res.json(parties);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching parties", error: error.message });
  }
};

// Get Party By ID
export const getPartyById = async (req, res) => {
  try {
    const { id } = req.params;
    const party = await Party.findById(id);

    if (!party || party.isDeleted) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.json(party);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching party", error: error.message });
  }
};

// Update Party
export const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, type, openingBalance } = req.body;

    if (!type || type.length === 0) {
      return res.status(400).json({ message: "Atleast one type is required" });
    }

    const typeError = validatePartyTypes(type);
    if (typeError) {
      return res.status(400).json({ message: typeError });
    }

    if (openingBalance !== undefined) {
      assertFiniteNumber(openingBalance, "Opening balance");
    }

    const updatedParty = await Party.findByIdAndUpdate(
      id,
      { name, phone, email, address, type, openingBalance },
      { new: true, runValidators: true },
    );

    if (!updatedParty) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.json(updatedParty);
  } catch (error) {
    handleControllerError(res, error, "Error updating party");
  }
};

// Delete Party (Soft Delete)
export const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;

    const party = await Party.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.json({ message: "Party deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleteing party", error: error.message });
  }
};

// Get Party Ledger By Id
export const getPartyLedgerById = async (req, res) => {
  try {
    const { id } = req.params;

    const leadger = await getPartyLedger(id);

    res.json(leadger);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching party ledger", error: error.message });
  }
};

// Get Party Ledger Entries By Id
export const getPartyLedgerEntries = async (req, res) => {
  try {
    const { id } = req.params;

    const entries = await getPartyLedgerWithEntries(id);

    res.json(entries);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching party ledger entries",
      error: error.message,
    });
  }
};
