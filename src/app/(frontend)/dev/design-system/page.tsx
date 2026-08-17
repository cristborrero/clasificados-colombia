import { readFileSync } from 'fs'
import path from 'path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Cluster } from '@/components/layout/Cluster'
import { Container } from '@/components/layout/Container'
import { Divider } from '@/components/layout/Divider'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Stack } from '@/components/layout/Stack'
import { VisuallyHidden } from '@/components/ui/VisuallyHidden'
import {
  Body,
  BodyLarge,
  Caption,
  DataFigure,
  Dek,
  Display,
  Eyebrow,
  HeadlineLG,
  HeadlineMD,
  HeadlineXL,
  Lead,
  Metadata as MetadataText,
  Quote,
} from '@/components/editorial/Typography'
import { AA_TEXT, contrastRatio, extractColorTokens } from '@/styles/contrast'

/**
 * Design system reference page (PRD Nº8 §158).
 *
 * Development only. The PRD says "solo en development", and this page exposes
 * internal design decisions that have no business being crawlable — it also
 * would end up indexed, which PRD SEO §4 forbids for internal surfaces.
 */
export const metadata: Metadata = {
  title: 'Design System',
  robots: { index: false, follow: false },
}

const tokens = extractColorTokens(
  readFileSync(path.join(process.cwd(), 'src/styles/globals.css'), 'utf8'),
)

const ratio = (fg: string, bg: string): string => {
  const fgValue = tokens[fg]
  const bgValue = tokens[bg]
  if (!fgValue || !bgValue) return '—'
  return contrastRatio(fgValue, bgValue).toFixed(2)
}

const passes = (fg: string, bg: string): boolean => {
  const fgValue = tokens[fg]
  const bgValue = tokens[bg]
  if (!fgValue || !bgValue) return false
  return contrastRatio(fgValue, bgValue) >= AA_TEXT
}

const brandSwatches = [
  ['--color-ink', 'Negro Editorial'],
  ['--color-paper', 'Papel'],
  ['--color-white', 'Blanco'],
  ['--color-red', 'Rojo Investigación'],
  ['--color-alert', 'Alerta'],
  ['--color-alert-surface', 'Superficie alerta'],
] as const

const greySwatches = [
  '--color-gray-900',
  '--color-gray-700',
  '--color-gray-500',
  '--color-gray-300',
  '--color-gray-200',
  '--color-gray-100',
] as const

const textPairs = [
  ['Cuerpo sobre Papel', '--color-text', '--color-surface'],
  ['Muted sobre Papel', '--color-text-muted', '--color-surface'],
  ['Metadata sobre Papel', '--color-text-subtle', '--color-surface'],
  ['Acento sobre Papel', '--color-accent', '--color-surface'],
  ['Visitado sobre Papel', '--color-link-visited', '--color-surface'],
  ['Inverso sobre Ink', '--color-text-inverse', '--color-surface-inverse'],
  ['Muted inverso sobre Ink', '--color-text-inverse-muted', '--color-surface-inverse'],
  ['Acento sobre Ink', '--color-accent', '--color-surface-inverse'],
  ['gray-500 sobre Papel', '--color-gray-500', '--color-surface'],
] as const

const typeSteps = [
  ['Display', '44 → 96 px'],
  ['H1', '36 → 72 px'],
  ['H2', '28 → 52 px'],
  ['H3', '22 → 36 px'],
  ['Lead', '18 → 24 px'],
  ['Body large', '17 → 21 px'],
  ['Body', '17 → 19 px'],
  ['Metadata', '13 → 14 px'],
  ['Label', '11 → 13 px'],
] as const

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <main className="pb-24">
      <Section tone="inverse" spacing="lg">
        <Stack gap="md">
          <Eyebrow className="text-[var(--color-accent)]">Fase 1 · Design System</Eyebrow>
          <Display as="h1">Sistema editorial</Display>
          <Dek className="max-w-[var(--container-reading)] text-[var(--color-text-inverse-muted)]">
            Todos los tokens, primitivos y estados. Los ratios de contraste se calculan en tiempo de
            render desde <code>globals.css</code>, así que reflejan el archivo real.
          </Dek>
        </Stack>
      </Section>

      {/* ── Colour ─────────────────────────────────────────────────────── */}
      <Section spacing="lg" aria-labelledby="ds-color">
        <SectionHeader id="ds-color" title="Paleta de marca" />
        <Grid cols={6}>
          {brandSwatches.map(([token, label]) => (
            <Stack key={token} gap="xs">
              <div
                className="h-24 w-full border border-[var(--color-border)]"
                style={{ backgroundColor: `var(${token})` }}
              />
              <MetadataText className="text-[var(--color-text)]">{label}</MetadataText>
              <MetadataText>
                <code>{tokens[token]}</code>
              </MetadataText>
            </Stack>
          ))}
        </Grid>

        <Divider className="my-12" />

        <SectionHeader title="Rampa de grises · PRD Nº8 §5" />
        <Grid cols={6}>
          {greySwatches.map((token) => (
            <Stack key={token} gap="xs">
              <div
                className="h-16 w-full border border-[var(--color-border)]"
                style={{ backgroundColor: `var(${token})` }}
              />
              <MetadataText>
                <code>{tokens[token]}</code>
              </MetadataText>
            </Stack>
          ))}
        </Grid>
      </Section>

      {/* ── Contrast ───────────────────────────────────────────────────── */}
      <Section tone="sunken" spacing="lg" aria-labelledby="ds-contrast">
        <SectionHeader id="ds-contrast" title="Contraste WCAG 2.2 AA" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-[var(--color-border-strong)]">
                <th className="py-2 pr-4 text-[length:var(--text-metadata)]">Par</th>
                <th className="py-2 pr-4 text-[length:var(--text-metadata)]">Ratio</th>
                <th className="py-2 text-[length:var(--text-metadata)]">Texto normal (4.5:1)</th>
              </tr>
            </thead>
            <tbody>
              {textPairs.map(([label, fg, bg]) => (
                <tr key={label} className="border-b border-[var(--color-border)]">
                  <td className="py-2 pr-4 text-[length:var(--text-metadata)]">{label}</td>
                  <td className="py-2 pr-4 text-[length:var(--text-metadata)] tabular-nums">
                    {ratio(fg, bg)}
                  </td>
                  <td className="py-2 text-[length:var(--text-metadata)]">
                    {passes(fg, bg) ? 'Pasa' : 'Solo texto grande / no-texto'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <MetadataText className="mt-4">
          Los dos últimos pares fallan a propósito y están documentados: el rojo sobre Ink solo vale
          para titulares grandes, y <code>gray-500</code> no puede llevar texto normal sobre Papel.
        </MetadataText>
      </Section>

      {/* ── Typography ─────────────────────────────────────────────────── */}
      <Section spacing="lg" aria-labelledby="ds-type">
        <SectionHeader id="ds-type" title="Escala tipográfica" />
        <Stack gap="lg">
          <Stack gap="xs">
            <MetadataText>Display · {typeSteps[0][1]}</MetadataText>
            <Display as="p">La verdad no se negocia</Display>
          </Stack>
          <Stack gap="xs">
            <MetadataText>H1 · {typeSteps[1][1]}</MetadataText>
            <HeadlineXL as="p">Red de contratos millonarios</HeadlineXL>
          </Stack>
          <Stack gap="xs">
            <MetadataText>H2 · {typeSteps[2][1]}</MetadataText>
            <HeadlineLG as="p">Historias que importan</HeadlineLG>
          </Stack>
          <Stack gap="xs">
            <MetadataText>H3 · {typeSteps[3][1]}</MetadataText>
            <HeadlineMD as="p">Cómo investigamos</HeadlineMD>
          </Stack>
          <Stack gap="xs">
            <MetadataText>Lead · {typeSteps[4][1]}</MetadataText>
            <Lead>Investigamos redes de poder y exponemos lo que otros ocultan.</Lead>
          </Stack>
          <Stack gap="xs">
            <MetadataText>Body large · {typeSteps[5][1]}</MetadataText>
            <BodyLarge className="max-w-[var(--container-reading)]">
              El periodismo de investigación exige tiempo, contraste y fuentes confiables.
            </BodyLarge>
          </Stack>
          <Stack gap="xs">
            <MetadataText>Body · {typeSteps[6][1]} · medida 65–75 caracteres</MetadataText>
            <Body className="max-w-[var(--container-reading)]">
              Contrastamos documentos, cruzamos información y verificamos cada dato antes de
              publicar. Nuestro compromiso es con la verdad, no con la velocidad. Este párrafo
              existe para comprobar el ritmo de lectura en la medida real de la columna editorial.
            </Body>
          </Stack>
          <Stack gap="xs">
            <MetadataText>Eyebrow · {typeSteps[8][1]}</MetadataText>
            <Eyebrow>Investigación</Eyebrow>
          </Stack>
          <Stack gap="xs">
            <MetadataText>Quote</MetadataText>
            <Quote className="max-w-[var(--container-reading)]">
              La información es poder. La información verificable sí lo es.
            </Quote>
          </Stack>
          <Stack gap="xs">
            <MetadataText>Data figure</MetadataText>
            <DataFigure>78%</DataFigure>
            <Caption>de los contratos estatales con fallas o sobrecostos.</Caption>
          </Stack>
        </Stack>
      </Section>

      {/* ── Interaction states ─────────────────────────────────────────── */}
      <Section tone="sunken" spacing="lg" aria-labelledby="ds-states">
        <SectionHeader id="ds-states" title="Estados de interacción" />
        <Stack gap="xl">
          <Stack gap="sm">
            <MetadataText>Botón primario</MetadataText>
            <Cluster gap="md">
              <span className="bg-[var(--color-red)] px-6 py-3 text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[var(--color-white)] uppercase">
                Normal
              </span>
              <span className="bg-[var(--color-red-hover)] px-6 py-3 text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[var(--color-white)] uppercase">
                Hover
              </span>
              <span className="bg-[var(--color-red-active)] px-6 py-3 text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[var(--color-white)] uppercase">
                Activo
              </span>
              <span className="bg-[var(--color-disabled-surface)] px-6 py-3 text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[var(--color-disabled-text)] uppercase">
                Desactivado
              </span>
            </Cluster>
          </Stack>

          <Stack gap="sm">
            <MetadataText>Enlaces · el foco es visible con teclado</MetadataText>
            <Cluster gap="lg">
              <a href="#ds-states" className="text-[var(--color-accent)]">
                Normal
              </a>
              <a
                href="#ds-states"
                className="text-[var(--color-accent)] underline underline-offset-4"
              >
                Hover
              </a>
              <a
                href="#ds-states"
                className="font-semibold text-[var(--color-accent)] underline underline-offset-4"
              >
                Activo
              </a>
              <a
                href="#ds-states"
                className="text-[var(--color-link-visited)] underline underline-offset-4"
              >
                Visitado
              </a>
            </Cluster>
          </Stack>

          <Stack gap="sm">
            <MetadataText>Barra de última hora · severidades</MetadataText>
            <div className="flex flex-wrap items-center gap-3 bg-[var(--color-ink)] p-3">
              <span className="bg-[var(--color-breaking)] px-3 py-1 text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[var(--color-white)] uppercase">
                Última hora
              </span>
              <span className="text-[length:var(--text-metadata)] text-[var(--color-text-inverse)]">
                Fiscalía allana oficinas por presunto operativo irregular
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 bg-[var(--color-alert-surface)] p-3">
              <span className="bg-[var(--color-alert)] px-3 py-1 text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] text-[var(--color-ink)] uppercase">
                Alerta
              </span>
              <span className="text-[length:var(--text-metadata)] text-[var(--color-text)]">
                Temblor de magnitud 5.2 se sintió en varias regiones del país
              </span>
            </div>
            <MetadataText>
              El color nunca comunica solo: cada fila imprime también la palabra.
            </MetadataText>
          </Stack>
        </Stack>
      </Section>

      {/* ── Layout ─────────────────────────────────────────────────────── */}
      <Section spacing="lg" aria-labelledby="ds-layout">
        <SectionHeader id="ds-layout" title="Contenedores y grid" />
        <Stack gap="lg">
          {(['wide', 'editorial', 'article', 'reading'] as const).map((width) => (
            <Container key={width} width={width} gutters={false}>
              <div className="border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] p-3">
                <MetadataText className="text-[var(--color-text)]">container-{width}</MetadataText>
              </div>
            </Container>
          ))}

          <Stack gap="sm">
            <MetadataText>Grid de 12 columnas · gutter 24px</MetadataText>
            <Grid cols={12}>
              {Array.from({ length: 12 }, (_, index) => (
                <div
                  key={index}
                  className="bg-[var(--color-accent)]/10 py-6 text-center text-[length:var(--text-label)]"
                >
                  {index + 1}
                </div>
              ))}
            </Grid>
            <MetadataText>4 columnas en móvil · 8 en tablet · 12 en desktop</MetadataText>
          </Stack>
        </Stack>
      </Section>

      {/* ── Primitives ─────────────────────────────────────────────────── */}
      <Section tone="sunken" spacing="lg" aria-labelledby="ds-primitives">
        <SectionHeader id="ds-primitives" title="Primitivos" />
        <Stack gap="lg">
          <Stack gap="sm">
            <MetadataText>Divider · pesos y tonos</MetadataText>
            <Divider weight="hairline" tone="subtle" />
            <Divider weight="hairline" tone="default" />
            <Divider weight="thick" tone="strong" />
            <Divider weight="heavy" tone="accent" />
          </Stack>

          <Stack gap="sm">
            <MetadataText>Cluster · envuelve cuando no hay espacio</MetadataText>
            <Cluster gap="sm">
              {['Investigación', 'Política', 'Justicia', 'Denuncia', 'Análisis', 'Datos'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="border border-[var(--color-border-strong)] px-3 py-1 text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] uppercase"
                  >
                    {tag}
                  </span>
                ),
              )}
            </Cluster>
          </Stack>

          <Stack gap="sm">
            <MetadataText>VisuallyHidden · solo para lectores de pantalla</MetadataText>
            <p className="text-[length:var(--text-body)]">
              Hay texto oculto justo aquí
              <VisuallyHidden> — este texto solo lo anuncia un lector de pantalla.</VisuallyHidden>
            </p>
          </Stack>
        </Stack>
      </Section>
    </main>
  )
}
