const { AppDataSource } = require("../app-data-source")
const { today } = require("../utils/dates")
const { parseId } = require("../utils/params")
const { getCheckedOutGearIds } = require("../utils/availability")

const CONDITIONS = ["Excellent", "Good", "Fair", "Needs Repair"]

async function index(req, res) {
    const gearRepo = AppDataSource.getRepository("Gear")
    const category = req.query.category || null

    const [gear, allGear, checkedOutIds] = await Promise.all([
        gearRepo.find({ where: category ? { category } : {}, order: { name: "ASC" } }),
        gearRepo.find({ select: { category: true }, order: { category: "ASC" } }),
        getCheckedOutGearIds(),
    ])

    const categories = [...new Set(allGear.map((item) => item.category))]

    res.render("Gear/index", {
        title: "Gear Catalog",
        gear,
        categories,
        category,
        checkedOutIds,
    })
}

async function show(req, res) {
    const id = parseId(req.params.id)
    if (id === null) {
        return notFound(res, req.params.id)
    }

    const [item, history] = await Promise.all([
        AppDataSource.getRepository("Gear").findOneBy({ id }),
        AppDataSource.getRepository("Checkout").find({
            where: { gear: { id } },
            relations: { gear: true, member: true },
            order: { checkedOutOn: "DESC" },
        }),
    ])
    if (!item) {
        return notFound(res, id)
    }

    res.render("Gear/show", {
        title: item.name,
        item,
        history,
        available: !history.some((checkout) => checkout.returnedOn === null),
        today: today(),
    })
}

function newForm(req, res) {
    res.render("Gear/form", {
        title: "Add Gear",
        heading: "Add Gear",
        action: "/gear",
        backHref: "/gear",
        item: { condition: "Good" },
        conditions: CONDITIONS,
    })
}

async function create(req, res) {
    const gearRepo = AppDataSource.getRepository("Gear")
    const item = await gearRepo.save(gearRepo.create(gearFields(req.body)))
    res.redirect(`/gear/${item.id}`)
}

async function editForm(req, res) {
    const id = parseId(req.params.id)
    const item = id === null ? null : await AppDataSource.getRepository("Gear").findOneBy({ id })
    if (!item) {
        return notFound(res, req.params.id)
    }

    res.render("Gear/form", {
        title: `Edit ${item.name}`,
        heading: `Edit ${item.name}`,
        action: `/gear/${item.id}/edit`,
        backHref: `/gear/${item.id}`,
        item,
        conditions: CONDITIONS,
    })
}

async function update(req, res) {
    const gearRepo = AppDataSource.getRepository("Gear")
    const id = parseId(req.params.id)
    const item = id === null ? null : await gearRepo.findOneBy({ id })
    if (!item) {
        return notFound(res, req.params.id)
    }

    Object.assign(item, gearFields(req.body))
    await gearRepo.save(item)
    res.redirect(`/gear/${item.id}`)
}

// Turns the submitted form into gear columns
function gearFields(body) {
    return {
        name: body.name.trim(),
        category: body.category.trim(),
        condition: CONDITIONS.includes(body.condition) ? body.condition : "Good",
        dailyFee: Number(body.dailyFee) || 0,
        description: body.description.trim() || null,
    }
}

function notFound(res, id) {
    res.status(404).render("404", {
        title: "Not found",
        message: `Gear #${id} doesn't exist (or was removed).`,
    })
}

module.exports = { index, show, newForm, create, editForm, update }
