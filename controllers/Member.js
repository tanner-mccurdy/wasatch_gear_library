const { IsNull } = require("typeorm")
const { AppDataSource } = require("../app-data-source")
const { today } = require("../utils/dates")
const { parseId } = require("../utils/params")

async function index(req, res) {
    await renderIndex(res, {})
}

async function create(req, res) {
    const memberRepo = AppDataSource.getRepository("Member")
    const fields = {
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        email: req.body.email.trim().toLowerCase(),
    }

    // email is unique, so catch duplicates before the database rejects them
    if (await memberRepo.existsBy({ email: fields.email })) {
        res.status(400)
        return renderIndex(res, fields, `A member with the email ${fields.email} already exists.`)
    }

    const member = await memberRepo.save(memberRepo.create({ ...fields, joinedOn: today() }))
    res.redirect(`/members/${member.id}`)
}

async function show(req, res) {
    const id = parseId(req.params.id)
    if (id === null) {
        return notFound(res, req.params.id)
    }

    const [member, checkouts] = await Promise.all([
        AppDataSource.getRepository("Member").findOneBy({ id }),
        AppDataSource.getRepository("Checkout").find({
            where: { member: { id } },
            relations: { gear: true, member: true },
            order: { checkedOutOn: "DESC" },
        }),
    ])
    if (!member) {
        return notFound(res, id)
    }

    res.render("Member/show", {
        title: member.getFullName(),
        member,
        current: checkouts
            .filter((checkout) => checkout.returnedOn === null)
            .sort((a, b) => a.dueOn.localeCompare(b.dueOn)),
        past: checkouts.filter((checkout) => checkout.returnedOn !== null),
        today: today(),
    })
}

// The members list, with the add form filled from `form` and an optional error
async function renderIndex(res, form, error = null) {
    const [members, openCheckouts] = await Promise.all([
        AppDataSource.getRepository("Member").find({ order: { lastName: "ASC", firstName: "ASC" } }),
        AppDataSource.getRepository("Checkout").find({
            where: { returnedOn: IsNull() },
            relations: { member: true },
        }),
    ])

    const outCounts = new Map()
    openCheckouts.forEach((checkout) => {
        outCounts.set(checkout.member.id, (outCounts.get(checkout.member.id) || 0) + 1)
    })

    res.render("Member/index", {
        title: "Members",
        members,
        outCounts,
        form,
        error,
    })
}

function notFound(res, id) {
    res.status(404).render("404", {
        title: "Not found",
        message: `Member #${id} doesn't exist (or was removed).`,
    })
}

module.exports = { index, create, show }
