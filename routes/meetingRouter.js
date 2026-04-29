const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");

router.get("/list", meetingController.getList);

router.get("/write", meetingController.getWrite);

router.get("/info/:id", (req, res) => res.send("Meeting Info (To be implemented)"));

module.exports = router;
