import { describe, expect, it } from 'vitest'

import { isEmbedProvider, resolveEmbed, youtubeVideoId } from './providers'

describe('youtubeVideoId', () => {
  it('reads the id from every shape YouTube publishes', () => {
    expect(youtubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('refuses anything that is not a video', () => {
    expect(youtubeVideoId('https://www.youtube.com/@canal')).toBeNull()
    expect(youtubeVideoId('https://www.youtube.com/playlist?list=PL123')).toBeNull()
  })

  it('refuses a lookalike host', () => {
    // youtube.com.evil.example ends with the same characters and is not YouTube.
    expect(youtubeVideoId('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ')).toBeNull()
  })
})

describe('resolveEmbed', () => {
  it('frames YouTube through the no-cookie domain', () => {
    expect(resolveEmbed('youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      kind: 'iframe',
      src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      title: 'Video de YouTube',
    })
  })

  it('renders the social platforms as links, not as frames', () => {
    // Their embeds need the platform's script, which reads and writes cookies
    // for every reader of the page — including readers of an investigation.
    expect(resolveEmbed('x', 'https://x.com/cuenta/status/1')).toEqual({
      kind: 'link',
      href: 'https://x.com/cuenta/status/1',
      label: 'X',
    })

    expect(resolveEmbed('instagram', 'https://www.instagram.com/p/abc/')?.kind).toBe('link')
    expect(resolveEmbed('tiktok', 'https://www.tiktok.com/@a/video/1')?.kind).toBe('link')
  })

  it('accepts twitter.com for the X provider, since old links still exist', () => {
    expect(resolveEmbed('x', 'https://twitter.com/cuenta/status/1')?.kind).toBe('link')
  })

  it('refuses a URL that does not belong to the declared provider', () => {
    expect(resolveEmbed('youtube', 'https://evil.example/embed/xyz')).toBeNull()
    expect(resolveEmbed('x', 'https://facebook.com/post/1')).toBeNull()
  })

  it('refuses non-http protocols', () => {
    expect(resolveEmbed('youtube', 'javascript:alert(1)')).toBeNull()
    expect(resolveEmbed('youtube', 'data:text/html,<script></script>')).toBeNull()
  })
})

describe('isEmbedProvider', () => {
  it('accepts the four declared providers and nothing else', () => {
    expect(isEmbedProvider('youtube')).toBe(true)
    expect(isEmbedProvider('x')).toBe(true)
    expect(isEmbedProvider('facebook')).toBe(false)
    expect(isEmbedProvider(null)).toBe(false)
  })
})
