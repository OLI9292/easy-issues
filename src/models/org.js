module.exports = (sequelize, t) => {
  return sequelize.define("org", {
    name: {
      type: t.STRING
    },
    crawledAt: {
      field: "crawled_at",
      type: t.DATE
    }
  })
}
