const express = require("express")
const memberController = require("../controllers/Member")

const router = express.Router()

router.get("/", memberController.index)
router.post("/", memberController.create)
router.get("/:id", memberController.show)

module.exports = router
