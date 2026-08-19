/**
 * Whether this deployment may be indexed at all (F22 preparación de lanzamiento).
 *
 * One switch, read by `robots.txt` and by every page's metadata, so the two
 * cannot disagree — a site that says "index me" in its metadata and "go away"
 * in robots.txt is a site whose owner does not know which one is winning.
 *
 * Blocks by default. The variable has to say `true` out loud to allow crawling,
 * which means an environment that forgets it stays private rather than
 * publishing placeholder content under this masthead.
 *
 * Deliberately NOT a `NEXT_PUBLIC_` variable. Those are inlined during the
 * build, so flipping this on for launch would mean rebuilding and redeploying;
 * read at runtime, it is a variable change and a restart. Both callers —
 * `robots.txt` and `buildPageMetadata` — run on the server, so nothing here
 * needs to reach the browser.
 */
export function indexingAllowed(): boolean {
  return process.env.ALLOW_INDEXING === 'true'
}
