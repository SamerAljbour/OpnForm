<template>
  <AdminCard
    v-if="props.user.two_factor_enabled"
    title="تعطيل التحقق بخطوتين"
    icon="i-heroicons-shield-exclamation-20-solid"
  >
    <div class="space-y-6 flex flex-col justify-between">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="subtle"
      >
        <template #description>
          <div>
            تعطيل التحقق بخطوتين إجراء أمني حرج. تأكد من أن لديك سببًا وجيهًا
            ودليلًا قويًا على ملكية الحساب (مثل الهوية المُحققة أو موافقة
            مكتوبة) قبل المتابعة. سيُطلب من المستخدم إعادة تفعيل التحقق بخطوتين
            عند تسجيل الدخول التالي.
          </div>
        </template>
      </UAlert>

      <VForm @submit.prevent="submit">
        <TextAreaInput
          label="السبب"
          name="reason"
          :form="form"
          :required="true"
          help="سيتم إرسال السبب إلى Slack للاستخدام الداخلي فقط."
        />
        <div class="flex space-x-2 mt-4">
          <UButton
            block
            :loading="form.busy"
            type="submit"
            class="grow"
            :label="'تعطيل التحقق بخطوتين'"
          />
        </div>
      </VForm>
    </div>
  </AdminCard>
</template>

<script setup>
const props = defineProps({
  user: { type: Object, required: true },
});
const emit = defineEmits(["user-updated"]);

const alert = useAlert();

const form = useForm({
  user_id: props.user.id,
  reason: "",
});

async function submit() {
  try {
    let response;
    response = await form.post("/moderator/disable-two-factor-authentication");
    alert.success(response.message);
    emit("user-updated", response.user);
    form.reset();
  } catch (error) {
    alert.error(error.data?.message || "An error occurred.");
  }
}
</script>
