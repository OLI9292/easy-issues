const dotenv = require("dotenv")
dotenv.config()

const Sequelize = require("sequelize")

const OrgModel = require("../models/org")
const RepoModel = require("../models/repo")
const IssueModel = require("../models/issue")

const { DATABASE_URL, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST } = process.env

// ssl: true,
// dialectOptions: { ssl: { require: true } }

const db = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      logging: false,
      dialect: "postgres"
    })
  : new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
      host: DB_HOST,
      logging: false,
      dialect: "postgres",
      operatorsAliases: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })

const Repo = RepoModel(db, Sequelize)
const Org = OrgModel(db, Sequelize)
const Issue = IssueModel(db, Sequelize)

Org.hasMany(Repo)
Repo.belongsTo(Org)
Repo.hasMany(Issue)

db.sync(/*{ force: true }*/).then(() => console.log("db running..."))

module.exports = {
  Org,
  Repo,
  Issue,
  db
}
