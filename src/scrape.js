const Sequelize = require("sequelize")
const axios = require("axios")
const moment = require("moment")

const { Org, Repo, Issue } = require("./db/")
const organizations = require("./data/organizations")
const goodStartingPlaceSubstrings = require("./data/goodStartingPlaceSubstrings")

const GITHUB_API_URL = "https://api.github.com/"
const ID = process.env.GITHUB_CLIENT_ID
const SECRET = process.env.GITHUB_CLIENT_SECRET
const AUTH = `client_id=${ID}&client_secret=${SECRET}`

const fetchRepos = (organization, perPage = 100, page = 1) =>
  axios
    .get(
      `${GITHUB_API_URL}orgs/${organization}/repos?page=${page}&per_page=${perPage}&${AUTH}`
    )
    .then(res => res.data)

const fetchIssues = async repo => {
  const name = repo.full_name
  const url = `${GITHUB_API_URL}repos/${name}/issues?per_page=100&${AUTH}`
  repo.issues = await axios.get(url).then(res => res.data)
  repo.issues = repo.issues.filter(isBeginnerIssue)
  return repo
}

const activeRepo = data => {
  const hasOpenIssues = data.open_issues_count > 5

  const updatedRecently =
    moment(data.updated_at, "YYYY-MM-DDTHH:mm:ssZ") >
    moment().subtract(2, "months")

  return hasOpenIssues && updatedRecently
}

const isBeginnerIssue = data => {
  const hasBeginnerLabel = data.labels.some(label => {
    const name = label.name.toLowerCase()
    return goodStartingPlaceSubstrings.some(str => name.includes(str))
  })

  const createdRecently =
    moment(data.created_at, "YYYY-MM-DDTHH:mm:ssZ") >
    moment().subtract(6, "months")

  return hasBeginnerLabel && createdRecently
}

const cleanRepo = r => ({
  id: r.id,
  name: r.name,
  url: r.url,
  htmlUrl: r.html_url,
  description: r.description,
  language: r.language,
  stargazersCount: r.stargazers_count,
  openIssuesCount: r.open_issues_count,
  repoCreatedAt: r.created_at,
  issues: r.issues.map(i => ({
    title: i.title,
    url: i.url,
    htmlUrl: i.html_url,
    issueCreatedAt: i.created_at
  }))
})

const run = async name => {
  if (!name) {
    console.log("Error: github org name required")
    return
  }

  const existing = await Org.findOne({ where: { name } })

  if (existing) {
    console.log("Error: org exists")
    return
  }

  try {
    let repos = await fetchRepos(name)

    repos = repos.filter(activeRepo).slice(0, 20)
    repos = await Promise.all(repos.map(fetchIssues))
    repos = repos.filter(({ issues }) => issues.length).map(cleanRepo)

    if (!repos.length) {
      console.log("Error: no good repos")
      return
    }

    const params = { name, crawledAt: Date.now(), repos }
    const include = [{ model: Repo, include: [Issue] }]

    Org.create(params, { include }).then(org => {
      const issuesCount = org.repos[0].issues.length
      console.log(`scraped ${name}, found ${issuesCount} issues`)
      return org
    })
  } catch (error) {
    console.log("Error: " + error.message)
    return process.exit(1)
  }
}

// run process.argv[1]
;(async () => {
  for (const name of organizations) {
    await run(name)
  }
  console.log("DONE")
  process.exit(0)
})()
