require("reflect-metadata")
const path = require("path")
const { DataSource } = require("typeorm")

const AppDataSource = new DataSource({
    type: "postgres",
    host: "db.toapita.com",
    port:  5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {rejectUnauthorized:false},
    synchronize: true,
    entities: [path.join(__dirname, "entities", "*.js")],
})

module.exports = { AppDataSource }
