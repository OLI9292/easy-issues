const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const { Org, Repo, Issue } = require("./db/")

const app = express()
app.use(bodyParser.json())
app.use("*", cors())

app.post("/api/orgs", (req, res) => {
  Org.create(req.body).then(data => res.json(data))
})

app.get("/api/orgs", (req, res) => {
  Org.findAll({ include: [{ model: Repo, include: [Issue] }] }).then(data =>
    res.json(data)
  )
})

app.delete("/api/orgs/:id", (req, res) => {
  Org.destroy({ where: { id: req.params.id } }).then(data => res.json(data))
})

const PORT = process.env.PORT || 3004
app.listen(PORT, () => console.log("listening on " + PORT))
