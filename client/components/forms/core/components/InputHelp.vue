<template>
  <div v-if="shouldRender" class="flex input-help">
    <small :class="helpClasses" class="grow flex">
      <slot>
        <span
          v-if="help"
          class="field-help break-words whitespace-break-spaces"
          v-html="sanitizedHelp"
        />
      </slot>
    </small>
    <slot name="after-help">
      <small v-if="shouldRender || !!slots.default" class="flex-grow" />
    </slot>
  </div>
</template>

<script setup>
const { $sanitize } = useNuxtApp();

const slots = useSlots();
const props = defineProps({
  helpClasses: { type: String, default: "text-neutral-500" },
  help: { type: String, required: false },
});

const sanitizedHelp = computed(() => $sanitize(props.help));

const shouldRender = computed(() => {
  return props.help || !!slots.default || !!slots["after-help"];
});
</script>
