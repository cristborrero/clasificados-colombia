import config from '@payload-config'
import { getPayload } from 'payload'

import { findMediaReferences } from '@/payload/upload/mediaReferences'

/**
 * `pnpm media:rights` — expired image licences, and what is still showing them.
 *
 * PRD Nº10 §13-§16 and the F15 definition of done: an expired `rightsExpiration`
 * has to raise an alert *and* list the published content it affects. The second
 * half is the part that matters. Knowing a licence lapsed is not actionable on
 * its own; knowing which four published pieces are still displaying the picture
 * is what lets someone decide between replacing it and taking it down.
 *
 * Reports rather than acts. Unpublishing a story because a photo licence lapsed
 * is an editorial decision, and a script that made it automatically would take
 * live journalism offline overnight without anybody choosing to.
 */

/** How far ahead to warn, so a lapse is not discovered on the day it happens. */
const WARNING_WINDOW_DAYS = 30

const payload = await getPayload({ config })

const now = new Date()
const horizon = new Date(now.getTime() + WARNING_WINDOW_DAYS * 24 * 60 * 60 * 1000)

const assets = await payload.find({
  collection: 'media',
  where: { rightsExpiration: { less_than_equal: horizon.toISOString() } },
  depth: 0,
  limit: 0,
  pagination: false,
  overrideAccess: true,
})

if (assets.docs.length === 0) {
  payload.logger.info('Ninguna licencia vencida ni próxima a vencer.')
  process.exit(0)
}

let expiredInUse = 0

for (const asset of assets.docs) {
  const expiration = asset.rightsExpiration ? new Date(asset.rightsExpiration) : null
  const expired = expiration !== null && expiration <= now
  const references = await findMediaReferences(payload, asset.id)
  const published = references.filter((reference) => reference.status === 'published')

  const label = asset.alt ?? asset.filename ?? String(asset.id)
  const when = expiration ? expiration.toISOString().slice(0, 10) : 'sin fecha'
  const state = expired ? 'VENCIDA' : 'por vencer'

  if (published.length === 0) {
    payload.logger.info(`${state} · ${when} · «${label}» — sin contenido publicado que la use.`)
    continue
  }

  if (expired) expiredInUse += 1

  const listed = published
    .map((reference) => `${reference.collection}#${reference.id} (${reference.label})`)
    .join(', ')

  payload.logger[expired ? 'error' : 'warn'](
    `${state} · ${when} · «${label}» — publicada en: ${listed}`,
  )
}

/*
 * A non-zero exit is what lets this run from a scheduler and be noticed. Only
 * an expired licence on published content earns it: an upcoming expiry is
 * information, not a failure.
 */
process.exit(expiredInUse > 0 ? 1 : 0)
