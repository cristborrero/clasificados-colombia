import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import { cn } from '@/components/ui/cn'
import { asRecord, asString, toImageRef } from '@/data/project'

import { Callout, type CalloutVariant } from './blocks/Callout'
import { CorrectionNotice, type CorrectionType } from './blocks/CorrectionNotice'
import { EmbedBlock } from './blocks/EmbedBlock'
import { FactBox, type FactBoxItem } from './blocks/FactBox'
import { GalleryBlock, type GalleryImage } from './blocks/GalleryBlock'
import { PullQuote } from './blocks/PullQuote'
import { SourceNote } from './blocks/SourceNote'
import { EditorialImage } from '../media/EditorialImage'

/**
 * Article body renderer (PRD Nº8 §65-§69).
 *
 * §65 asks for Payload rich text rendered with our own components, and §30 of
 * PRD Nº7 is why: the body is stored as structured nodes, not HTML, so a pull
 * quote arrives as a pull quote and gets the pull quote component — rather than
 * as a `<blockquote>` that has to be styled by guessing.
 *
 * Rhythm is set once here, on the container, not per block (§66). Every child
 * inherits the same paragraph spacing, so a body cannot end up with four
 * different vertical gaps depending on which block an editor reached for.
 *
 * Links are underlined (§69), because colour alone is not a channel (§108).
 */
type Fields = Record<string, unknown>

/*
 * The converter map is typed against generated block interfaces when a project
 * threads them through the generics. Ours reads the node defensively instead —
 * `fieldsOf` plus the `asString`/`asRecord` guards — so a block whose schema
 * changed renders nothing rather than crashing the article. Declaring the
 * argument once here keeps that decision in one place instead of eight
 * inline annotations.
 */
type BlockArgs = { node: unknown }

const fieldsOf = (node: unknown): Fields => (asRecord((node as Fields)?.fields as never) ?? {}) as Fields

function toFactBoxItems(value: unknown): FactBoxItem[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((raw) => {
    const item = asRecord(raw as never)
    const label = asString(item?.label)
    const itemValue = asString(item?.value)

    return label && itemValue
      ? [{ label, value: itemValue, description: asString(item?.description) }]
      : []
  })
}

function toGalleryImages(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((raw) => {
    const entry = asRecord(raw as never)
    const image = toImageRef(entry?.image as never)

    if (!image) return []

    const record = asRecord(entry?.image as never)

    return [
      {
        url: image.url,
        alt: image.alt,
        caption: asString(entry?.captionOverride) ?? asString(record?.caption),
        width: typeof record?.width === 'number' ? record.width : null,
        height: typeof record?.height === 'number' ? record.height : null,
      },
    ]
  })
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  blocks: {
    pullQuote: ({ node }: BlockArgs) => {
      const fields = fieldsOf(node)
      const text = asString(fields.text)

      return text ? (
        <PullQuote
          text={text}
          attribution={asString(fields.attribution)}
          source={asString(fields.source)}
        />
      ) : null
    },

    factBox: ({ node }: BlockArgs) => {
      const fields = fieldsOf(node)
      const title = asString(fields.title)
      const items = toFactBoxItems(fields.items)

      return title && items.length > 0 ? (
        <FactBox title={title} items={items} source={asString(fields.source)} />
      ) : null
    },

    callout: ({ node }: BlockArgs) => {
      const fields = fieldsOf(node)
      const body = asString(fields.body)

      return body ? (
        <Callout
          variant={(asString(fields.variant) ?? 'context') as CalloutVariant}
          title={asString(fields.title)}
          body={body}
        />
      ) : null
    },

    sourceNote: ({ node }: BlockArgs) => {
      const text = asString(fieldsOf(node).text)

      return text ? <SourceNote text={text} /> : null
    },

    imageBlock: ({ node }: BlockArgs) => {
      const fields = fieldsOf(node)
      const image = toImageRef(fields.image as never)

      if (!image) return null

      const record = asRecord(fields.image as never)

      return (
        <EditorialImage
          src={image.url}
          alt={image.alt}
          width={typeof record?.width === 'number' ? record.width : 1200}
          height={typeof record?.height === 'number' ? record.height : 800}
          caption={asString(fields.captionOverride) ?? asString(record?.caption)}
          credit={asString(record?.credit)}
          className="my-10"
        />
      )
    },

    gallery: ({ node }: BlockArgs) => {
      const images = toGalleryImages(fieldsOf(node).images)

      return images.length > 0 ? <GalleryBlock images={images} /> : null
    },

    embed: ({ node }: BlockArgs) => {
      const fields = fieldsOf(node)
      const provider = asString(fields.provider)
      const url = asString(fields.url)

      return provider && url ? (
        <EmbedBlock provider={provider} url={url} caption={asString(fields.caption)} />
      ) : null
    },

    correctionNotice: ({ node }: BlockArgs) => {
      const fields = fieldsOf(node)
      const date = asString(fields.date)
      const text = asString(fields.text)

      return date && text ? (
        <CorrectionNotice
          type={(asString(fields.type) ?? 'correction') as CorrectionType}
          date={date}
          text={text}
        />
      ) : null
    },
  },
})

export function RichText({ data, className }: { data: unknown; className?: string }) {
  if (!data) return null

  return (
    <div
      className={cn(
        /*
         * §66: one rhythm for the whole body. The `[&_p]` selectors set it on
         * the container rather than inside each block component, so no block
         * can quietly introduce a different gap.
         */
        'font-[family-name:var(--font-sans)] text-[length:var(--text-body)] leading-[var(--text-body--line-height)]',
        '[&>*+*]:mt-6',
        '[&_h2]:mt-12 [&_h2]:font-[family-name:var(--font-editorial)] [&_h2]:text-[length:var(--text-h3)] [&_h2]:font-bold',
        '[&_h3]:mt-10 [&_h3]:font-[family-name:var(--font-sans)] [&_h3]:text-[length:var(--text-lead)] [&_h3]:font-semibold',
        '[&_a]:underline [&_a]:underline-offset-4',
        '[&_a:visited]:text-[color:var(--color-link-visited)]',
        '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
        '[&_li+li]:mt-2',
        className,
      )}
    >
      <LexicalRichText
        data={data as never}
        converters={converters}
        disableContainer
        disableIndent={false}
      />
    </div>
  )
}
