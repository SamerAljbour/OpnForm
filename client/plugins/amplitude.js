// Hook function used by event listener
function hookLogEvent(eventName, eventData) {
  useAmplitude().logEvent(eventName, eventData)
}

// Allowlist of valid event names — only these can be tracked.
// Add any new Amplitude event names here before using them in templates.
const VALID_EVENTS = new Set([
  'button_clicked',
  'form_submitted',
  'form_viewed',
  'form_started',
  'page_viewed',
  'signup_started',
  'signup_completed',
  'login',
  'logout',
  'workspace_created',
  'form_created',
  'form_deleted',
  'form_duplicated',
  'form_published',
  'form_closed',
  'submission_viewed',
  'submission_deleted',
  'integration_connected',
  'integration_disconnected',
  'upgrade_clicked',
  'billing_visited',
])

/**
 * Safely parse data-track-properties attribute value.
 * - Rejects non-objects (arrays, primitives)
 * - Strips prototype pollution keys (__proto__, constructor, prototype)
 * - Returns null on any parse failure
 */
function safeParseProperties(raw) {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    // Must be a plain object, not an array or primitive
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
      return null
    }
    // Block prototype pollution keys
    const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
    const safe = Object.create(null)
    for (const [key, value] of Object.entries(parsed)) {
      if (!UNSAFE_KEYS.has(key)) {
        safe[key] = value
      }
    }
    return safe
  } catch (e) {
    console.warn('[tracking] Failed to parse tracking properties:', raw, e)
    return null
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  // New v-track directive that only sets data attributes
  nuxtApp.vueApp.directive("track", {
    beforeMount(el, binding) {
      const modifiers = Object.keys(binding.modifiers)
      if (modifiers.length !== 1) {
        throw new Error(
          "Amplitude directive takes only one modifier which is the event name.",
        )
      }
      const eventName = modifiers[0]

      // Set data attributes instead of adding event listeners
      el.setAttribute('data-track-event', eventName)
      if (binding.value) {
        el.setAttribute('data-track-properties', JSON.stringify(binding.value))
      }
    },
    updated(el, binding) {
      // Update data attributes if the binding changes
      const modifiers = Object.keys(binding.modifiers)
      if (modifiers.length !== 1) {
        throw new Error(
          "Amplitude directive takes only one modifier which is the event name.",
        )
      }
      const eventName = modifiers[0]

      el.setAttribute('data-track-event', eventName)
      if (binding.value) {
        el.setAttribute('data-track-properties', JSON.stringify(binding.value))
      } else {
        el.removeAttribute('data-track-properties')
      }
    }
  })

  // Global click event listener using event delegation
  if (import.meta.client) {
    document.addEventListener('click', (event) => {
      // Find the closest element with tracking data
      const trackableElement = event.target.closest('[data-track-event]')

      if (trackableElement) {
        const eventName = trackableElement.getAttribute('data-track-event')

        // Reject any event name not in the allowlist —
        // prevents injected/spoofed elements from firing arbitrary events
        if (!VALID_EVENTS.has(eventName)) {
          console.warn('[tracking] Blocked unknown event name:', eventName)
          return
        }

        const propertiesAttr = trackableElement.getAttribute('data-track-properties')
        const eventData = safeParseProperties(propertiesAttr)

        hookLogEvent(eventName, eventData)
      }
    })
  }
})
