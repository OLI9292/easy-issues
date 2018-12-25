module.exports = (sequelize, t) => {
  return sequelize.define("issue", {
    title: {
      type: t.STRING
    },
    url: {
      type: t.STRING
    },
    htmlUrl: {
      field: "html_url",
      type: t.STRING
    },
    issueCreatedAt: {
      field: "issue_created_at",
      type: t.DATE
    }
  })
}
