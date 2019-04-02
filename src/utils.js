/* how many builds to show without folding */
const VIS_BUILDS = 3

/* adds archive attribute to builds to mark for folding in template */
const extractArchiveBuilds = (builds) => {
  /* get unique commits */
  const commits = [...new Set(builds.map(b=>b.commit))]
  /* if there's not too many don't archive any */
  if (commits.length < VIS_BUILDS) {
    return {visible: builds, archived: []}
  }
  /* split builds into visible and archived */
  const archivedCommits = commits.slice(0, -(VIS_BUILDS-1))
  const archived = builds.filter(b => archivedCommits.includes(b.commit))
  const visible  = builds.slice(archived.length)
  return {visible, archived}
}

const setDefault = (obj, prop, deflt) => {
  return obj.hasOwnProperty(prop) ? obj[prop] : (obj[prop] = deflt);
}

module.exports = { extractArchiveBuilds, setDefault }
