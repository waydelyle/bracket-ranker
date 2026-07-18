// Submit all sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver, etc.).
//
// Usage (run manually after a deploy):
//   node scripts/submit-indexnow.mjs
//
// Optionally submit specific URLs instead of the full sitemap:
//   node scripts/submit-indexnow.mjs https://www.bracketranker.com/some-page
//
// The key must match the static key file served at
// https://www.bracketranker.com/bc1a12285ce29884799d693c1291b6d6.txt (see public/bc1a12285ce29884799d693c1291b6d6.txt).

const HOST = 'www.bracketranker.com'
const KEY = 'bc1a12285ce29884799d693c1291b6d6'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const SITEMAP_URL = `https://${HOST}/sitemap.xml`
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

async function getUrls() {
  const cliUrls = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
  if (cliUrls.length > 0) return cliUrls

  console.log(`Fetching sitemap: ${SITEMAP_URL}`)
  const res = await fetch(SITEMAP_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap: ${res.status} ${res.statusText}`)
  }
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1])
  if (urls.length === 0) {
    throw new Error('No <loc> entries found in sitemap')
  }
  return urls
}

async function main() {
  // With --if-production (used by the postbuild hook), only submit on
  // production deploys — never from local or preview builds.
  if (process.argv.includes('--if-production') && process.env.VERCEL_ENV !== 'production') {
    console.log('Skipping IndexNow submission (not a Vercel production build).')
    return
  }

  const urlList = await getUrls()
  console.log(`Submitting ${urlList.length} URLs to IndexNow...`)

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  })

  const body = await res.text()
  console.log(`IndexNow response: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`)

  if (res.status === 200 || res.status === 202) {
    console.log('Success. URLs accepted for processing.')
  } else {
    console.error('Submission failed. Check that the key file is deployed and reachable at:')
    console.error(`  ${KEY_LOCATION}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
