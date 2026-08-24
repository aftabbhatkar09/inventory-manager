import express from "express";

import {
  createParty,
  getAllParties,
  getPartyById,
  updateParty,
  deleteParty,
  getPartyLedgerById,
  getPartyLedgerEntries,
} from "../controllers/party.controller.js";

const router = express.Router();

router.post("/createParty", createParty);
router.get("/getAllParties", getAllParties);
router.get("/getPartyById/:id", getPartyById);
router.put("/editParty/:id", updateParty);
router.delete("/deleteParty/:id", deleteParty);
router.get("/getPartyLedger/:id", getPartyLedgerById);
router.get("/getPartyLedgerEntries/:id", getPartyLedgerEntries);

export default router;
