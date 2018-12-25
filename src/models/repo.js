module.exports = (sequelize, t) => {
  return sequelize.define("repo", {
    id: {
      type: t.INTEGER,
      primaryKey: true
    },
    name: {
      type: t.STRING
    },
    url: {
      type: t.STRING
    },
    htmlUrl: {
      field: "html_url",
      type: t.STRING
    },
    description: {
      type: t.STRING
    },
    language: {
      type: t.STRING
    },
    stargazersCount: {
      field: "stargazers_count",
      type: t.INTEGER
    },
    openIssuesCount: {
      field: "open_issues_count",
      type: t.INTEGER
    },
    repoCreatedAt: {
      field: "repo_created_at",
      type: t.DATE
    }
  })
}
