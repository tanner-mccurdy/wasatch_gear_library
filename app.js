require("reflect-metadata")
const express = require("express")
const { IsNull, LessThan } = require("typeorm")
const { AppDataSource } = require("./app-data-source")
const gearRouter = require("./routes/Gear")
const memberRouter = require("./routes/Member")
const checkoutRouter = require("./routes/Checkout")
const { today, dueLabel } = require("./utils/dates")
const app = express()
app.set("view engine","ejs");
// Views can't require modules, so share the date helper with every view
app.locals.dueLabel = dueLabel
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
const PORT = 3000

app.get("/", async (req, res) => {
    const checkouts = AppDataSource.getRepository("Checkout")
    const todayDate = today()
    const [gearCount, memberCount, checkedOutCount, overdueCount, dueNext] = await Promise.all([
        AppDataSource.getRepository("Gear").count(),
        AppDataSource.getRepository("Member").count(),
        checkouts.count({ where: { returnedOn: IsNull() } }),
        checkouts.count({ where: { returnedOn: IsNull(), dueOn: LessThan(todayDate) } }),
        checkouts.find({
            where: { returnedOn: IsNull() },
            relations: { gear: true, member: true },
            order: { dueOn: "ASC" },
        }),
    ])
    res.render("index", {
        title: "Dashboard",
        gearCount,
        memberCount,
        checkedOutCount,
        overdueCount,
        dueNext,
        today: todayDate,
    })
})

app.use("/gear", gearRouter)
app.use("/members", memberRouter)
app.use("/checkouts", checkoutRouter)

app.use((req, res) => {
    res.status(404).render("404", { title: "Not found", message: "That page doesn't exist." })
})

AppDataSource.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
        process.exit(1)
    })
