const express = require("express")
const checkoutController = require("../controllers/Checkout")

const router = express.Router()

router.get("/", checkoutController.index)
router.post("/", checkoutController.create)
router.get("/new", checkoutController.newForm)
router.post("/:id/return", checkoutController.markReturned)

module.exports = router
