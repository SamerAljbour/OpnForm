<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      content: 'w-full max-w-md',
    }"
  >
    <template #header>
      <div class="flex items-center w-full gap-4 px-2">
        <h2 class="font-semibold">إنشاء مساحة عمل جديدة</h2>
      </div>
      <!-- <UButton
        color="neutral"
        variant="outline"
        icon="i-heroicons-question-mark-circle"
        size="sm"
        @click="
          crisp.openHelpdeskArticle('how-many-workspaces-can-i-create-r4dvt6')
        "
      >
        Help
      </UButton> -->
    </template>

    <template #body>
      <VForm size="sm">
        <form @submit.prevent="handleSubmit">
          <text-input
            name="name"
            :form="form"
            :required="true"
            :disabled="form.busy"
            label="اسم مساحة العمل"
            placeholder="مساحة العمل الخاصة بي"
          />
          <text-input
            name="emoji"
            class="mt-4"
            :form="form"
            :required="false"
            :disabled="form.busy"
            label="إيموجي (اختياري)"
            placeholder="🚀"
            help="اختر إيموجي لتمثيل مساحة العمل الخاصة بك"
          />
        </form>
      </VForm>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton color="neutral" variant="outline" @click="closeModal"
          >إلغاء</UButton
        >
        <UButton block type="submit" :loading="form.busy" @click="handleSubmit"
          >إنشاء مساحة عمل</UButton
        >
      </div>
    </template>
  </UModal>
</template>

<script setup>
const emit = defineEmits(["created", "close"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const { create } = useWorkspaces();
const appStore = useAppStore();
const crisp = useCrisp();
const alert = useAlert();

// Modal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("close", value),
});

// Form state
const form = useForm({
  name: "",
  emoji: "",
});

// Handle form submission
const createMutation = create();

const handleSubmit = () => {
  form
    .mutate(createMutation)
    .then((response) => {
      const newWorkspace = response.workspace;
      appStore.setCurrentId(newWorkspace.id);

      // Show success message
      alert.success("أنت الآن تعمل في مساحة عملك الجديدة", 10000, {
        title: "مساحة العمل تم إنشاؤها بنجاح",
      });

      // Emit created event and close modal
      emit("created", newWorkspace);
      closeModal();
    })
    .catch((error) => {
      console.error("Error creating workspace:", error);
      alert.error(
        error.data?.message ||
          "حدث خطأ أثناء إنشاء مساحة العمل. يرجى المحاولة مرة أخرى.",
        10000,
        {
          title: "خطأ في إنشاء مساحة العمل",
        },
      );
    });
};

// Close modal and reset form
const closeModal = () => {
  form.reset();
  isOpen.value = false;
};

// Reset form when modal opens
watch(isOpen, (newValue) => {
  if (newValue) {
    form.reset();
  }
});
</script>
