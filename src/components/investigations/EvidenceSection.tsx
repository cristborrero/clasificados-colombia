import { HeadlineMD, Metadata } from '@/components/editorial/Typography'
import { EvidenceCard, type PublicEvidenceCard } from '@/components/evidence/EvidenceCard'
import { cn } from '@/components/ui/cn'

/**
 * Public evidence (PRD Nº8 §83, §88).
 *
 * *"Muestra solo evidencia pública aprobada."* This component receives only the
 * public projection built in F6 — the one with no bucket and no object key —
 * so there is no path through it that could reach a restricted document.
 *
 * It also renders nothing at all when the list is empty. §88 forbids the
 * "documento restringido" placeholder, and an empty heading reading "Documentos"
 * on an investigation that has restricted evidence would do the same job: tell
 * the reader, and anyone else watching, that documents exist. The existence of
 * a subpoena can identify the source who provided it.
 */
export function EvidenceSection({
  evidence,
  title = 'Documentos',
  className,
}: {
  evidence: readonly PublicEvidenceCard[]
  title?: string
  className?: string
}) {
  if (evidence.length === 0) return null

  return (
    <section className={cn('my-16', className)} aria-labelledby="documentos">
      <HeadlineMD as="h2" id="documentos">
        {title}
      </HeadlineMD>

      <Metadata className="mt-2 max-w-[60ch] text-[color:var(--color-text-muted)]">
        Documentos públicos en los que se apoya esta investigación.
      </Metadata>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {evidence.map((item) => (
          <EvidenceCard key={item.id} evidence={item} />
        ))}
      </div>
    </section>
  )
}
