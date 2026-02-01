<template>
  <div class="px-4 pb-4">
    <EditorSectionHeader
      icon="heroicons:paint-brush-16-solid"
      title="المظهر الأساسي"
      :show-line="false"
    />

    <PresentationStyleSwitch />

    <select-input
      name="theme"
      class="mt-4"
      :options="[
        { name: 'افتراضي', value: 'default' },
        { name: 'نوشن', value: 'notion' },
        { name: 'بسيط (بدون ظلال)', value: 'simple' },
        { name: 'حد أدنى', value: 'minimal' },
        { name: 'شفاف', value: 'transparent' },
      ]"
      :form="form"
      label="ثيم النموذج"
    />

    <color-input name="color" :form="form" label="لون التمييز" class="my-4">
      <template #label>
        <InputLabel label="">
          لون التمييز -
          <a
            href="#"
            class="text-blue-500"
            @click.prevent="form.color = DEFAULT_COLOR"
          >
            إعادة التعيين
          </a>
        </InputLabel>
      </template>
    </color-input>

    <OptionSelectorInput
      v-model="form.dark_mode"
      :form="form"
      name="dark_mode"
      label="وضع اللون"
      :options="[
        { name: 'auto', label: 'النظام', icon: 'i-heroicons-computer-desktop' },
        { name: 'light', label: 'فاتح', icon: 'i-heroicons-sun' },
        { name: 'dark', label: 'داكن', icon: 'i-heroicons-moon' },
      ]"
      :multiple="false"
      :columns="3"
      class="mb-4"
    />

    <EditorSectionHeader icon="octicon:typography-16" title="النص واللغة" />
    <div class="grid grid-cols-2 gap-4">
      <div
        class="flex-grow my-1"
        v-if="useFeatureFlag('services.google.fonts')"
      >
        <label class="text-neutral-700 font-semibold text-xs mb-0.5 block"
          >Font Family</label
        >
        <UButton
          color="neutral"
          variant="outline"
          block
          @click="showGoogleFontPicker = true"
        >
          <span
            :style="{
              'font-family': form.font_family
                ? form.font_family + ' !important'
                : null,
            }"
          >
            {{ form.font_family || "Default" }}
          </span>
        </UButton>
        <GoogleFontPicker
          :show="showGoogleFontPicker"
          :font="form.font_family || null"
          @close="showGoogleFontPicker = false"
          @apply="onApplyFont"
        />
      </div>

      <div class="flex-grow">
        <select-input
          name="language"
          searchable
          :options="availableLocales"
          :form="form"
          label="اللغة"
        />
      </div>
    </div>

    <ToggleSwitchInput
      name="layout_rtl"
      :form="form"
      label="تخطيط من اليمين إلى اليسار"
    />

    <toggle-switch-input
      name="uppercase_labels"
      :form="form"
      label="جعل عناوين الحقول بحروف كبيرة"
    />

    <EditorSectionHeader
      icon="heroicons:rectangle-stack-16-solid"
      title="التخطيط والحجم"
    />

    <div class="grid grid-cols-2 gap-4">
      <OptionSelectorInput
        seamless
        label="حجم الحقول"
        v-model="form.size"
        :form="form"
        name="size"
        :options="[
          { name: 'sm', label: 'صغير' },
          { name: 'md', label: 'متوسط' },
          { name: 'lg', label: 'كبير' },
        ]"
        :multiple="false"
        :columns="3"
        class="mb-4"
      />
      <OptionSelectorInput
        v-if="form.theme !== 'transparent'"
        label="زاوية الحقول"
        v-model="form.border_radius"
        seamless
        :form="form"
        name="border_radius"
        :options="[
          {
            name: 'none',
            icon: 'i-tabler-border-corner-square',
            label: 'بدون',
          },
          {
            name: 'small',
            icon: 'i-tabler-border-corner-rounded',
            label: 'صغير',
          },
          { name: 'full', icon: 'i-tabler-border-corner-pill', label: 'كامل' },
        ]"
        :multiple="false"
        :columns="3"
        class="mb-4"
      />
    </div>

    <OptionSelectorInput
      v-model="form.width"
      label="عرض النموذج"
      :form="form"
      name="width"
      seamless
      v-if="!isFocused"
      :options="[
        { name: 'centered', label: 'مركزي' },
        { name: 'full', label: 'عرض كامل' },
      ]"
      :multiple="false"
      :columns="2"
      class="mb-4 w-2/3"
    />

    <EditorSectionHeader
      icon="heroicons:tag-16-solid"
      title="العلامة التجارية"
    />
    <div class="grid grid-cols-2 gap-4">
      <image-input
        name="logo_picture"
        :form="form"
        label="الشعار"
        :required="false"
      />

      <ImageWithSettings
        :form="form"
        name="cover_picture"
        :label="isFocused ? 'الخلفية' : 'الغلاف (~1500px)'"
        kind="cover"
      />
    </div>

    <toggle-switch-input
      name="no_branding"
      :form="form"
      class="mt-4"
      @update:model-value="onChangeNoBranding"
    >
      <template #label>
        <InputLabel
          :label="'إخفاء شعار OpnForm'"
          :native-for="'no_branding'"
          class="text-sm font-medium!"
        />
        <pro-tag
          upgrade-modal-title="قم بالترقية لإزالة شعار OpnForm"
          class="-mt-1"
        />
      </template>
    </toggle-switch-input>

    <EditorSectionHeader
      icon="heroicons:cog-6-tooth-16-solid"
      title="خيارات متقدمة"
    />

    <toggle-switch-input
      v-if="isFocused"
      name="settings.navigation_arrows"
      :form="form"
      class="mt-2"
      label="عرض أسهم التنقل"
    />
    <toggle-switch-input
      name="show_progress_bar"
      :form="form"
      label="عرض شريط التقدم"
      :help="
        form.show_progress_bar
          ? 'الشريط يظهر في أعلى الصفحة (فوق التنقل في هذا المحرر) أو تحت العنوان عند التضمين)'
          : ''
      "
    />
    <toggle-switch-input
      name="transparent_background"
      :form="form"
      label="خلفية شفافة"
      help="عند تضمين النموذج"
    />
    <toggle-switch-input
      name="confetti_on_submission"
      :form="form"
      label="عرض كونفيتي عند الإرسال الناجح"
      @update:model-value="onChangeConfettiOnSubmission"
    />
    <ToggleSwitchInput
      name="auto_focus"
      :form="form"
      label="التركيز التلقائي على الحقل الأول"
    />
  </div>
</template>

<script setup>
import EditorSectionHeader from "./EditorSectionHeader.vue";
import { useWorkingFormStore } from "../../../../../stores/working_form";
import GoogleFontPicker from "../../../editors/GoogleFontPicker.vue";
import ProTag from "~/components/app/ProTag.vue";
import {
  DEFAULT_COLOR,
  ensureSettingsObject,
} from "@/composables/forms/initForm";
import PresentationStyleSwitch from "./PresentationStyleSwitch.vue";
import ImageWithSettings from "../media/ImageWithSettings.vue";

const workingFormStore = useWorkingFormStore();
const { openSubscriptionModal } = useAppModals();
const form = storeToRefs(workingFormStore).content;
const isMounted = ref(false);
const confetti = useConfetti();
const showGoogleFontPicker = ref(false);
const { $i18n } = useNuxtApp();

const { data: user } = useAuth().user();
const { current: workspace } = useCurrentWorkspace();

const isPro = computed(() => {
  if (!useFeatureFlag("billing.enabled")) return true;
  if (!user.value || !workspace.value) return false;
  return workspace.value.is_pro;
});

const isFocused = computed(() => form.value?.presentation_style === "focused");

const availableLocales = computed(() => {
  return (
    $i18n.locales?.value.map((locale) => ({
      name: locale.name,
      value: locale.code,
    })) ?? []
  );
});

onMounted(() => {
  isMounted.value = true;

  // Ensure settings is a plain, writable object (avoid writing into readonly proxies)
  ensureSettingsObject(form.value);

  // Set default value for navigation_arrows in focused mode if not defined
  if (isFocused.value && form.value.settings.navigation_arrows === undefined) {
    form.value.settings.navigation_arrows = true;
  }
});

const onChangeConfettiOnSubmission = (val) => {
  if (isMounted.value && val) {
    confetti.play();
  }
};

const onChangeNoBranding = (val) => {
  if (!isPro.value && val) {
    openSubscriptionModal({
      modal_title: "Upgrade today to remove OpnForm branding",
    });
    setTimeout(() => {
      form.value.no_branding = false;
    }, 300);
  }
};

const onApplyFont = (val) => {
  form.value.font_family = val;
  showGoogleFontPicker.value = false;
};
</script>
