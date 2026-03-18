import DOMPurify from 'isomorphic-dompurify'

/**
 * Nuxt plugin that provides a global $sanitize() method.
 * Strips dangerous HTML (scripts, event handlers, javascript: URLs)
 * while preserving safe formatting tags.
 *
 * Usage in any component:
 *   const { $sanitize } = useNuxtApp()
 *   const safe = $sanitize(rawHtml)
 *
 * For code blocks (pre/code tags allowed):
 *   const safe = $sanitize(rawHtml, { allowCode: true })
 */
export default defineNuxtPlugin(() => {
  const defaultOptions = {
    ALLOWED_TAGS: [
      'b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span', 'div',
      'blockquote'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
    FORCE_BODY: true
  }

  const codeOptions = {
    ...defaultOptions,
    ALLOWED_TAGS: [...defaultOptions.ALLOWED_TAGS, 'pre', 'code']
  }

  return {
    provide: {
      sanitize: (html, options = {}) => {
        if (!html) return ''
        const config = options.allowCode ? codeOptions : defaultOptions
        return DOMPurify.sanitize(html, { ...config, ...options })
      }
    }
  }
})
