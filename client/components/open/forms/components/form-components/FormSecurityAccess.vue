<template>
  <VForm size="sm">
    <div class="space-y-4">
      <div
        class="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h3 class="text-lg font-medium text-neutral-900">
            الأمان وإمكانية الوصول
          </h3>
          <p class="mt-1 text-sm text-neutral-500">
            إدارة من يمكنه الوصول إلى النموذج ومتى.
          </p>
        </div>
      </div>

      <TextInput
        name="password"
        :form="form"
        class="mt-4 max-w-xs"
        label="كلمة مرور النموذج"
        placeholder="********"
        help="اترك الحقل فارغًا لتعطيل حماية كلمة المرور"
      />

      <DateInput
        :with-time="true"
        name="closes_at"
        class="mt-4 max-w-xs"
        :form="form"
        label="تاريخ الإغلاق"
        help="اتركه فارغًا ليبقى النموذج مفتوحًا بدون تاريخ انتهاء"
        :required="false"
      />

      <div
        v-if="form.closes_at || form.visibility == 'closed'"
        class="bg-neutral-50 border rounded-lg px-4 py-2"
      >
        <rich-text-area-input
          name="closed_text"
          :form="form"
          :allow-fullscreen="true"
          label="نص إغلاق النموذج"
          help="سيتم عرض هذه الرسالة عند إغلاق النموذج"
          :required="false"
          wrapper-class="mb-0"
        />
      </div>

      <text-input
        name="max_submissions_count"
        native-type="number"
        :min="1"
        :form="form"
        label="تحديد عدد الردود"
        placeholder="الحد الأقصى للردود"
        class="mt-4 max-w-xs"
        help="اتركه فارغًا لعدد غير محدود من الردود"
        :required="false"
      />

      <div
        v-if="form.max_submissions_count && form.max_submissions_count > 0"
        class="bg-neutral-50 border rounded-lg px-4 py-2"
      >
        <rich-text-area-input
          wrapper-class="mb-0"
          :allow-fullscreen="true"
          name="max_submissions_reached_text"
          :form="form"
          label="نص الوصول للحد الأقصى للردود"
          help="سيتم عرض هذه الرسالة عند الوصول إلى الحد الأقصى لعدد الردود"
          :required="false"
        />
      </div>

      <h4 class="font-semibold mt-4 border-t pt-4">الأمان</h4>
      <p class="text-neutral-500 text-sm">حماية النموذج والملفات الحساسة.</p>

      <div v-if="hasCaptcha" class="flex items-start gap-6 flex-wrap">
        <ToggleSwitchInput
          name="use_captcha"
          :form="form"
          class="mt-4"
          label="الحماية من البوتات"
          help="يحمي النموذج من الرسائل المزعجة وسوء الاستخدام باستخدام كابتشا"
        />

        <FlatSelectInput
          v-if="form.use_captcha"
          name="captcha_provider"
          :form="form"
          :options="captchaOptions"
          class="mt-4 w-80"
          label="اختر مزود الكابتشا"
        />
      </div>
    </div>
  </VForm>
</template>

<script setup>
const workingFormStore = useWorkingFormStore();
const { content: form } = storeToRefs(workingFormStore);
const config = useRuntimeConfig();

const hasCaptcha = computed(() => {
  return config.public.hCaptchaSiteKey || config.public.reCaptchaSiteKey;
});

const captchaOptions = computed(() => {
  const options = [];

  if (config.public.reCaptchaSiteKey) {
    options.push({ name: "reCAPTCHA", value: "recaptcha" });
  }

  if (config.public.hCaptchaSiteKey) {
    options.push({ name: "hCaptcha", value: "hcaptcha" });
  }

  return options;
});
</script>
