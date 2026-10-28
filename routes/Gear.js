const express = require("express")
const gearController = require("../controllers/Gear")

const router = express.Router()

router.get("/", gearController.index)
router.post("/", gearController.create)
router.get("/new", gearController.newForm)
router.get("/:id", gearController.show)
router.get("/:id/edit", gearController.editForm)
router.post("/:id/edit", gearController.update)

module.exports = router
