<template>
  <VForm size="sm">
    <div class="space-y-4">
      <div
        class="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h3 class="text-lg font-medium text-neutral-900">إعدادات الإرسال</h3>
          <p class="mt-1 text-sm text-neutral-500">
            إعداد كيفية التعامل مع ردود النموذج.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-4">
        <TextInput
          name="submit_button_text"
          :form="form"
          class="max-w-xs"
          label="نص زر الإرسال"
        />
        <TextInput
          v-if="isFocused"
          v-model="focusedNextText"
          name="focused_next_button_text"
          class="max-w-xs"
          label="نص زر التالي"
          :placeholder="$t('forms.buttons.next')"
        />
      </div>

      <ToggleSwitchInput
        name="auto_save"
        :form="form"
        label="الحفظ التلقائي للرد"
        help="يحفظ تقدم المستخدم ويسمح له بالمتابعة لاحقًا."
        class="mt-4"
        :disabled="hasPaymentBlock"
      />

      <UAlert
        v-if="hasPaymentBlock"
        color="primary"
        variant="subtle"
        title="يجب تفعيلها مع حقل الدفع."
        class="max-w-md"
      />

      <FlatSelectInput
        :form="submissionOptions"
        name="databaseAction"
        class="mt-4 max-w-xs"
        label="إجراء حفظ البيانات"
        :options="[
          { name: 'إنشاء سجل جديد', value: 'create' },
          { name: 'تحديث سجل موجود', value: 'update' },
        ]"
        :required="true"
      />

      <div
        v-if="submissionOptions.databaseAction == 'update'"
        class="bg-neutral-50 border rounded-lg px-4 py-2"
      >
        <div class="w-auto max-w-lg">
          <p class="mb-2 mt-2 text-neutral-500 text-sm">
            عند العثور على قيم مطابقة في الحقول المحددة، سيتم تحديث أول سجل
            موجود بدلًا من إنشاء سجل جديد. في حال عدم وجود تطابق، سيتم إنشاء سجل
            جديد.
            <a
              href="#"
              class="text-blue-500 hover:underline"
              @click.prevent="
                crisp.openHelpdeskArticle(
                  'how-to-update-a-record-on-form-submission-1t1jwmn',
                )
              "
            >
              معرفة المزيد
            </a>
          </p>

          <select-input
            v-if="filterableFields.length"
            :form="form"
            name="database_fields_update"
            label="الحقول المستخدمة للتحقق"
            :options="filterableFields"
            multiple
            clearable
          />

          <toggle-switch-input
            v-model="clearEmptyFieldsOnUpdate"
            class="mt-4"
            label="مسح الحقول الفارغة عند التحديث"
            help="عند التفعيل سيتم مسح القيم القديمة للحقول الفارغة، وعند التعطيل سيتم تحديث الحقول المعبأة فقط."
          />
        </div>
      </div>

      <!-- Advanced Submission Settings -->
      <div class="mb-8">
        <h4 class="font-semibold mt-4 border-t pt-4">
          خيارات الإرسال المتقدمة <ProTag class="ml-1" />
        </h4>
        <p class="text-gray-500 text-sm mb-4">
          إعداد خيارات متقدمة لجمع البيانات.
        </p>

        <ToggleSwitchInput
          name="enable_partial_submissions"
          :form="form"
          help="تجميع الردود غير المكتملة لتحليل نقاط الانسحاب وجمع بيانات جزئية."
        >
          <template #label>
            <span class="text-sm">جمع الردود الجزئية</span>
            <ProTag
              class="ml-1"
              upgrade-modal-title="الترقية لتجميع الردود الجزئية"
              upgrade-modal-description="احصل على بيانات قيّمة من الردود غير المكتملة وتحليل سلوك المستخدمين."
            />
          </template>
        </ToggleSwitchInput>
      </div>

      <ToggleSwitchInput
        class="mt-4"
        name="enable_ip_tracking"
        :form="form"
        help="جمع عناوين IP لأغراض التحليل والحماية."
      >
        <template #label>
          <span class="text-sm">جمع عناوين IP</span>
          <ProTag
            class="ml-1"
            upgrade-modal-title="الترقية لتجميع عناوين IP"
            upgrade-modal-description="تحليل الموقع الجغرافي، اكتشاف النشاط المشبوه، وتعزيز الأمان."
          />
        </template>
      </ToggleSwitchInput>

      <UAlert
        v-if="form.enable_ip_tracking"
        color="neutral"
        icon="i-heroicons-shield-exclamation"
        variant="subtle"
        title="الامتثال للخصوصية و GDPR"
        description="تأكد من توضيح سياسة الخصوصية والحصول على موافقة المستخدم عند الحاجة."
        class="mt-4 max-w-md"
      />

      <!-- Post-Submission Behavior -->
      <div class="mb-8">
        <h4 class="font-semibold mt-4 border-t pt-4">
          بعد الإرسال
          <pro-tag
            upgrade-modal-title="الترقية لتخصيص ما بعد الإرسال"
            upgrade-modal-description="إعادة توجيه المستخدمين أو عرض رسائل مخصصة بعد الإرسال."
          />
        </h4>

        <p class="text-neutral-500 text-sm mb-4">
          تخصيص تجربة المستخدم بعد إرسال النموذج.
        </p>

        <OptionSelectorInput
          label="الإجراء بعد الإرسال"
          v-model="submissionOptions.submissionMode"
          :options="[
            { name: 'default', label: 'عرض صفحة النجاح' },
            { name: 'redirect', label: 'إعادة توجيه' },
          ]"
          option-key="name"
          :columns="2"
          class="mb-4 max-w-xs"
        />

        <div
          v-if="submissionOptions.submissionMode"
          class="bg-gray-50 border rounded-lg px-4 py-2"
        >
          <div class="w-auto max-w-lg">
            <template v-if="submissionOptions.submissionMode === 'redirect'">
              <MentionInput
                name="redirect_url"
                :form="form"
                :mentions="form.properties"
                class="w-full max-w-xs"
                label="رابط إعادة التوجيه"
                placeholder="https://www.google.com"
                :required="true"
              />
            </template>

            <template v-else>
              <rich-text-area-input
                enable-mentions
                :mentions="form.properties"
                :allow-fullscreen="true"
                name="submitted_text"
                class="w-full"
                :form="form"
                label="نص صفحة النجاح"
                :max-char-limit="10000"
                :show-char-limit="true"
              />

              <div class="flex items-center flex-wrap gap-x-4 mt-4">
                <toggle-switch-input
                  name="re_fillable"
                  class="w-full max-w-xs"
                  :form="form"
                  label="نموذج قابل لإعادة التعبئة"
                  help="يسمح للمستخدم بإرسال النموذج أكثر من مرة"
                />
                <text-input
                  v-if="form.re_fillable"
                  name="re_fill_button_text"
                  :form="form"
                  label="نص زر إعادة البدء"
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Editable Submissions Settings -->
      <div class="mb-8">
        <h4 class="font-semibold mt-4 border-t pt-4">
          الردود القابلة للتعديل
          <ProTag
            class="ml-1"
            upgrade-modal-title="الترقية لاستخدام الردود القابلة للتعديل"
            upgrade-modal-description="السماح للمستخدمين بتعديل ردودهم عبر رابط خاص."
          />
        </h4>

        <p class="text-gray-500 text-sm mb-4">
          السماح للمستخدمين بتعديل ردودهم عبر رابط فريد.
        </p>

        <toggle-switch-input
          name="editable_submissions"
          class="w-full max-w-sm"
          help="يسمح بتعديل الردود عبر رابط خاص"
          :form="form"
          label="تفعيل تعديل الردود"
        />

        <text-input
          v-if="form.editable_submissions"
          name="editable_submissions_button_text"
          class="w-full max-w-64 mt-4"
          :form="form"
          label="نص زر تعديل الرد"
          :required="true"
        />
      </div>
    </div>
  </VForm>
</template>

<script setup>
import ProTag from "~/components/app/ProTag.vue";

const workingFormStore = useWorkingFormStore();
const { content: form } = storeToRefs(workingFormStore);
const crisp = useCrisp();

const submissionOptions = ref({});

const filterableFields = computed(() => {
  if (submissionOptions.value.databaseAction !== "update") return [];
  return form.value.properties
    .filter((field) => {
      return (
        !field.hidden &&
        !["files", "signature", "multi_select", "matrix", "payment"].includes(
          field.type,
        )
      );
    })
    .map((field) => {
      return {
        name: field.name,
        value: field.id,
      };
    });
});

const clearEmptyFieldsOnUpdate = computed({
  get: () => form.value.clear_empty_fields_on_update ?? false,
  set: (value) => {
    form.value.clear_empty_fields_on_update = value;
  },
});

watch(
  {
    redirect_url: form.value.redirect_url,
    database_fields_update: form.value.database_fields_update,
  },
  () => {
    if (form.value) {
      submissionOptions.value = {
        submissionMode: form.value.redirect_url ? "redirect" : "default",
        databaseAction: form.value.database_fields_update ? "update" : "create",
      };
    }
  },
  { immediate: true },
);

watch(
  submissionOptions,
  (val) => {
    if (val.submissionMode === "default") form.value.redirect_url = null;
    if (val.databaseAction === "create")
      form.value.database_fields_update = null;
  },
  { deep: true },
);

const hasPaymentBlock = computed(() => {
  return form.value.properties.some((property) => property.type === "payment");
});

const isFocused = computed(() => form.value?.presentation_style === "focused");

onMounted(() => {
  // Ensure translations is a plain, writable object (avoid writing into readonly proxies)
  const t = form.value?.translations;
  if (!t || typeof t !== "object" || Array.isArray(t)) {
    form.value.translations = {};
  } else {
    form.value.translations = { ...t };
  }
});

const focusedNextText = computed({
  get() {
    return form.value?.translations?.focused_next_button_text || "";
  },
  set(val) {
    const current =
      form.value?.translations && typeof form.value.translations === "object"
        ? form.value.translations
        : {};
    // Replace the entire translations object to avoid setting into a readonly proxy
    form.value.translations = { ...current, focused_next_button_text: val };
  },
});
</script>
