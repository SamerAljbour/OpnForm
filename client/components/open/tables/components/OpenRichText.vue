<template>
  <div class="text-sm text-neutral-900" v-html="sanitizedValue" />
</template>

<script setup>
const { $sanitize } = useNuxtApp();

const props = defineProps({
  value: {
    type: String,
    required: false,
    default: "",
  },
});

const sanitizedValue = computed(() => $sanitize(props.value));
</script>
