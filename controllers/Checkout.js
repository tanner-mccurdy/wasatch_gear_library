const { IsNull, Not } = require("typeorm")
const { AppDataSource } = require("../app-data-source")
const { today } = require("../utils/dates")
const { parseId } = require("../utils/params")
const { getCheckedOutGearIds } = require("../utils/availability")

async function index(req, res) {
    const checkoutRepo = AppDataSource.getRepository("Checkout")
    const [open, recentlyReturned] = await Promise.all([
        checkoutRepo.find({
            where: { returnedOn: IsNull() },
            relations: { gear: true, member: true },
            order: { dueOn: "ASC" },
        }),
        checkoutRepo.find({
            where: { returnedOn: Not(IsNull()) },
            relations: { gear: true, member: true },
            order: { returnedOn: "DESC", id: "DESC" },
            take: 5,
        }),
    ])

    res.render("Checkout/index", {
        title: "Checkouts",
        open,
        recentlyReturned,
        today: today(),
    })
}

async function newForm(req, res) {
    // Lets the gear detail page's "Check out" button preselect its item
    await renderForm(res, { gearId: parseId(req.query.gearId) }, [])
}

async function create(req, res) {
    const form = {
        gearId: parseId(req.body.gearId),
        memberId: parseId(req.body.memberId),
        dueOn: req.body.dueOn,
    }
    const todayDate = today()

    const [gear, member, checkedOutIds] = await Promise.all([
        form.gearId === null ? null : AppDataSource.getRepository("Gear").findOneBy({ id: form.gearId }),
        form.memberId === null ? null : AppDataSource.getRepository("Member").findOneBy({ id: form.memberId }),
        getCheckedOutGearIds(),
    ])

    const errors = []
    if (!gear) {
        errors.push("Choose a gear item.")
    } else if (checkedOutIds.has(gear.id)) {
        errors.push(`${gear.name} is already checked out.`)
    }
    if (!member) {
        errors.push("Choose a member.")
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dueOn || "")) {
        errors.push("Choose a due date.")
    } else if (form.dueOn < todayDate) {
        errors.push("The due date can't be before today.")
    }

    if (errors.length > 0) {
        res.status(400)
        return renderForm(res, form, errors)
    }

    // { id } is enough to save a relation without loading the row
    await AppDataSource.getRepository("Checkout").save({
        checkedOutOn: todayDate,
        dueOn: form.dueOn,
        gear: { id: gear.id },
        member: { id: member.id },
    })
    res.redirect("/checkouts")
}

async function markReturned(req, res) {
    const id = parseId(req.params.id)
    if (id !== null) {
        // Only open checkouts, so an earlier return date isn't overwritten
        await AppDataSource.getRepository("Checkout").update(
            { id, returnedOn: IsNull() },
            { returnedOn: today() },
        )
    }
    res.redirect(req.get("Referer") || "/checkouts")
}

// The checkout form, with `form` preselected and any validation errors
async function renderForm(res, form, errors) {
    const [gear, members, checkedOutIds] = await Promise.all([
        AppDataSource.getRepository("Gear").find({ order: { name: "ASC" } }),
        AppDataSource.getRepository("Member").find({ order: { lastName: "ASC", firstName: "ASC" } }),
        getCheckedOutGearIds(),
    ])

    res.render("Checkout/new", {
        title: "Check out gear",
        availableGear: gear.filter((item) => !checkedOutIds.has(item.id)),
        members,
        form,
        errors,
        today: today(),
    })
}

module.exports = { index, newForm, create, markReturned }
