import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { Body, HeadlineMD, HeadlineXL, Lead } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { TipForm } from '@/components/forms/TipForm'
import { getSiteSettings } from '@/data/site'

/**
 * Citizen tips (PRD Master §22).
 *
 * *"Debe inspirar seguridad"* — and the way a page does that is by being
 * specific rather than reassuring. Vague promises about confidentiality are
 * exactly what an experienced source distrusts, so this page states what is
 * stored, what is not, and what happens next.
 *
 * `noindex`: a tip form has no business in search results, and a reader who
 * arrives here should arrive deliberately.
 */
export const metadata: Metadata = {
  title: 'Denunciar',
  description: 'Envía información a la redacción de Clasificados Colombia.',
  robots: { index: false, follow: true },
}

export default async function DenunciarPage() {
  const settings = await getSiteSettings()

  return (
    <Container width="wide" className="py-12">
      <Breadcrumbs
        items={[{ label: settings.siteName, href: '/' }, { label: 'Denunciar' }]}
        className="mb-8"
      />

      <div className="mx-auto max-w-3xl text-center pb-8 border-b border-[var(--color-border)]">
        <HeadlineXL className="text-[length:var(--text-h2)]">Cuéntanos qué está pasando</HeadlineXL>

        <Lead className="mx-auto mt-4 max-w-[60ch] text-[color:var(--color-text-muted)]">
          Leemos todo lo que llega. Si tienes documentos, fechas o nombres concretos, dilo: es lo que
          permite verificar.
        </Lead>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TipForm />
        </div>

        <aside className="flex flex-col gap-8 lg:col-span-5">
          <section>
            <HeadlineMD as="h2" className="text-[length:var(--text-lead)]">
              Qué pasa después
            </HeadlineMD>

            <Body className="mt-2 text-[color:var(--color-text-muted)]">
              Un editor lee tu mensaje. Si hay algo que verificar, la redacción decide si abrir una
              investigación. Nada de lo que envíes se publica automáticamente, nunca.
            </Body>
          </section>

          <section>
            <HeadlineMD as="h2" className="text-[length:var(--text-lead)]">
              Si eliges el anonimato
            </HeadlineMD>

            <Body className="mt-2 text-[color:var(--color-text-muted)]">
              No guardamos tu nombre, tu correo ni tu teléfono. No los guardamos ocultos: no los
              guardamos. Eso también significa que no vamos a poder responderte ni pedirte más
              detalles.
            </Body>
          </section>

          <section>
            <HeadlineMD as="h2" className="text-[length:var(--text-lead)]">
              Lo que esta página no puede prometerte
            </HeadlineMD>

            <Body className="mt-2 text-[color:var(--color-text-muted)]">
              Un formulario web deja rastro en tu conexión y en tu equipo, y eso no está bajo
              nuestro control. Si tu situación es delicada, escríbenos desde una red y un
              dispositivo que no sean los de tu trabajo.
            </Body>
          </section>

          {settings.contact.email ? (
            <section>
              <HeadlineMD as="h2" className="text-[length:var(--text-lead)]">
                Prefiero escribir directo
              </HeadlineMD>

              <Body className="mt-2 text-[color:var(--color-text-muted)]">
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  {settings.contact.email}
                </a>
              </Body>
            </section>
          ) : null}
        </aside>
      </div>
    </Container>
  )
}
