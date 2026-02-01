<template>
  <div class="space-y-4">
    <div
      class="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div>
        <h3 class="text-lg font-medium text-neutral-900">
          معلومات مساحة العمل
        </h3>
        <p class="mt-1 text-sm text-neutral-500">
          قم بتحديث معلومات مساحة العمل الخاصة بك.
        </p>
      </div>
    </div>

    <VForm @submit.prevent="updateProfile" size="sm">
      <div class="max-w-sm">
        <TextInput
          :disabled="workspace.is_readonly"
          :form="workspaceForm"
          name="name"
          label="اسم مساحة العمل"
          placeholder="مساحة العمل الخاصة بي"
          :required="true"
        />
        <TextInput
          :disabled="workspace.is_readonly"
          :form="workspaceForm"
          name="emoji"
          label="إيموجي (اختياري)"
          placeholder="إيموجي"
          help="اختر إيموجي لتمثيل مساحة العمل الخاصة بك"
        />
      </div>

      <div class="mt-4">
        <UButton
          :disabled="workspace.is_readonly"
          type="submit"
          :loading="workspaceForm.busy"
          color="primary"
        >
          حفظ التغييرات
        </UButton>
      </div>
    </VForm>

    <div class="pt-8 border-t border-neutral-200">
      <div v-if="workspace.is_admin" class="space-y-2">
        <h4 class="text-red-800 font-medium">حذف مساحة العمل</h4>
        <p class="text-neutral-500 text-sm">
          سيؤدي هذا إلى حذف مساحة العمل بالكامل بشكل دائم. سيتم إزالة جميع
          النماذج التي تم إنشاؤها في هذه المساحة. لا يمكن التراجع عن هذا
          الإجراء.
        </p>
        <UButton
          color="error"
          :loading="removeMutation.isPending.value"
          @click="confirmDeleteWorkspace"
        >
          حذف مساحة العمل
        </UButton>
      </div>

      <div v-else class="space-y-2">
        <h4 class="text-neutral-900 font-medium">مغادرة مساحة العمل</h4>
        <p class="text-neutral-500 text-sm">
          سيؤدي هذا إلى إزالتك من مساحة العمل. ستفقد الوصول إلى جميع النماذج في
          هذه المساحة.
        </p>
        <UButton
          color="error"
          :loading="leaveMutation.isPending.value"
          @click="leaveWorkSpace"
        >
          مغادرة مساحة العمل
        </UButton>
      </div>
    </div>
  </div>
</template>
<script setup>
const { update, remove, leave } = useWorkspaces();

const alert = useAlert();
const { closeWorkspaceSettings } = useAppModals();
const router = useRouter();

const { current: workspace } = useCurrentWorkspace();

const updateMutation = update(workspace.value.id);
const removeMutation = remove();
const leaveMutation = leave();

// Workspace form
const workspaceForm = useForm({
  name: "",
  emoji: "",
});

// Update profile
const updateProfile = () => {
  workspaceForm
    .mutate(updateMutation)
    .then(() => {
      useAlert().success("تم تحديث معلومات مساحة العمل!");
    })
    .catch((error) => {
      console.error("Error updating workspace:", error);
    });
};

// Delete workspace confirmation
const confirmDeleteWorkspace = () => {
  alert.confirm("هل تريد حقًا حذف مساحة العمل الخاصة بك؟", deleteWorkspace);
};

// Delete workspace
const deleteWorkspace = () => {
  removeMutation
    .mutateAsync(workspace.value.id)
    .then((data) => {
      alert.success(data.message);
      closeWorkspaceSettings();
      nextTick(() => {
        router.push({ name: "home", query: {} });
      });
    })
    .catch((error) => {
      alert.error(error.data?.message || "Error deleting workspace");
    });
};

// Leave workspace
const leaveWorkSpace = () => {
  alert.confirm(
    "هل تريد حقًا مغادرة مساحة العمل هذه؟ ستفقد الوصول إلى جميع النماذج في هذه المساحة.",
    () => {
      leaveMutation
        .mutateAsync(workspace.value.id)
        .then(() => {
          alert.success("لقد غادرت مساحة العمل.");
          closeWorkspaceSettings();
          nextTick(() => {
            router.push({ name: "home", query: {} });
          });
        })
        .catch((error) => {
          console.error("Error leaving workspace:", error);
          alert.error("حدث خطأ أثناء مغادرة مساحة العمل.");
        });
    },
  );
};

// Watch for user changes
watch(
  workspace,
  (newWorkspace) => {
    if (newWorkspace) {
      workspaceForm.fill({
        name: newWorkspace.name || "",
        emoji: newWorkspace.icon || "",
      });
    }
  },
  { immediate: true },
);
</script>
