const { IsNull } = require("typeorm")
const { AppDataSource } = require("../app-data-source")

// Ids of gear that has a checkout with an empty returnedOn
async function getCheckedOutGearIds() {
    const openCheckouts = await AppDataSource.getRepository("Checkout").find({
        where: { returnedOn: IsNull() },
        relations: { gear: true },
    })
    return new Set(openCheckouts.map((checkout) => checkout.gear.id))
}

module.exports = { getCheckedOutGearIds }
