/* maximum number of builds to show without folding */
const MAX_VISIBLE_BUILDS = 12

const extractArchiveBuilds = (builds) => {
  const latestStart = builds.findIndex(b => b.commit === builds[builds.length - 1].commit)
  
  /* try including second-to-latest commit if it fits */
  if (latestStart > 0) {
    const secondStart = builds.findIndex(b => b.commit === builds[latestStart - 1].commit)
    if (builds.length - secondStart <= MAX_VISIBLE_BUILDS) {
      return {visible: builds.slice(secondStart), archived: builds.slice(0, secondStart)}
    }
  }
  
  return {visible: builds.slice(latestStart), archived: builds.slice(0, latestStart)}
}

export default extractArchiveBuilds