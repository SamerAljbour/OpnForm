<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-lg font-medium text-neutral-900">التحقق بخطوتين</h3>
      <p class="text-sm text-neutral-500 mt-1">
        أضف طبقة أمان إضافية إلى حسابك باستخدام تطبيق المصادقة.
      </p>
    </div>

    <!-- حالة التحقق بخطوتين -->
    <div v-if="twoFactorEnabled" class="space-y-4">
      <UAlert
        color="success"
        variant="subtle"
        icon="i-heroicons-check-circle"
        description="تم تفعيل التحقق بخطوتين على حسابك."
      />

      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          @click="showRegenerateModal = true"
        >
          إعادة توليد رموز الاسترداد
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          @click="showDisableModal = true"
        >
          تعطيل التحقق بخطوتين
        </UButton>
      </div>
    </div>

    <!-- تفعيل التحقق بخطوتين -->
    <TwoFactorEnableFlow
      v-else
      :enabling="enabling2FA"
      :confirming="confirming2FA"
      :secret="twoFactorSecret"
      :qr-code="twoFactorQrCode"
      @enable="enableTwoFactor"
      @confirm="confirmTwoFactor"
    />

    <!-- نافذة رموز الاسترداد (بعد الإعداد أو إعادة التوليد) -->
    <RecoveryCodesModal
      :show="showRecoveryCodesModal"
      :codes="recoveryCodesList"
      :just-regenerated="justRegenerated"
      @close="closeRecoveryCodesModal"
      @copy="copyRecoveryCodes"
    />

    <!-- نافذة إعادة توليد رموز الاسترداد -->
    <RegenerateRecoveryCodesModal
      :show="showRegenerateModal"
      :loading="regeneratingCodes"
      @close="closeRegenerateModal"
      @regenerate="handleRegenerateRecoveryCodes"
    />

    <!-- نافذة تعطيل التحقق بخطوتين -->
    <DisableTwoFactorModal
      :show="showDisableModal"
      :loading="disabling2FA"
      @close="closeDisableModal"
      @disable="disableTwoFactor"
    />
  </div>
</template>

<script setup>
import { authApi } from "~/api/auth";
import TwoFactorEnableFlow from "./TwoFactorEnableFlow.vue";
import RecoveryCodesModal from "./RecoveryCodesModal.vue";
import DisableTwoFactorModal from "./DisableTwoFactorModal.vue";
import RegenerateRecoveryCodesModal from "./RegenerateRecoveryCodesModal.vue";

const alert = useAlert();
const auth = useAuth();
const { data: user } = auth.user();

// Two-Factor Authentication
const twoFactorEnabled = computed(
  () => user.value?.two_factor_enabled ?? false,
);
const twoFactorSecret = ref(null);
const twoFactorQrCode = ref(null);
const recoveryCodesList = ref([]);
const showRecoveryCodesModal = ref(false);
const showDisableModal = ref(false);
const showRegenerateModal = ref(false);

const enabling2FA = ref(false);
const confirming2FA = ref(false);
const disabling2FA = ref(false);
const regeneratingCodes = ref(false);
const justRegenerated = ref(false);

const enableTwoFactor = async () => {
  enabling2FA.value = true;
  try {
    const response = await authApi.twoFactor.enable();
    twoFactorSecret.value = response.secret;
    twoFactorQrCode.value = response.qr_code;
  } catch (error) {
    alert.error(
      error.response?._data?.message ||
        "فشل تفعيل التحقق بخطوتين. حاول مرة أخرى.",
    );
  } finally {
    enabling2FA.value = false;
  }
};

const confirmTwoFactor = async (code) => {
  confirming2FA.value = true;
  try {
    const response = await authApi.twoFactor.confirm({ code });

    recoveryCodesList.value = response.recovery_codes || [];
    twoFactorSecret.value = null;
    twoFactorQrCode.value = null;

    // Refresh user data
    await auth.invalidateUser();

    // Show recovery codes modal automatically after enabling
    justRegenerated.value = false;
    showRecoveryCodesModal.value = true;

    alert.success("تم تفعيل التحقق بخطوتين بنجاح.");
  } catch (error) {
    alert.error(
      error.response?._data?.message ||
        error.response?._data?.errors?.code?.[0] ||
        "رمز غير صحيح. يرجى المحاولة مرة أخرى.",
    );
  } finally {
    confirming2FA.value = false;
  }
};

const disableTwoFactor = async (code) => {
  disabling2FA.value = true;
  try {
    await authApi.twoFactor.disable({ code });

    showDisableModal.value = false;

    // Refresh user data
    await auth.invalidateUser();

    alert.success("تم تعطيل التحقق بخطوتين بنجاح.");
  } catch (error) {
    alert.error(
      error.response?._data?.message ||
        error.response?._data?.errors?.code?.[0] ||
        "رمز غير صحيح. يرجى المحاولة مرة أخرى.",
    );
  } finally {
    disabling2FA.value = false;
  }
};

const closeRecoveryCodesModal = () => {
  recoveryCodesList.value = [];
  justRegenerated.value = false;
  showRecoveryCodesModal.value = false;
};

const closeRegenerateModal = () => {
  showRegenerateModal.value = false;
};

const closeDisableModal = () => {
  showDisableModal.value = false;
};

const handleRegenerateRecoveryCodes = async (data) => {
  regeneratingCodes.value = true;
  try {
    const response = await authApi.twoFactor.regenerateRecoveryCodes(data);
    recoveryCodesList.value = response.recovery_codes || [];
    justRegenerated.value = true;
    showRegenerateModal.value = false;
    showRecoveryCodesModal.value = true;
    alert.success("تم إعادة توليد رموز الاسترداد. يرجى حفظها في مكان آمن.");
  } catch (error) {
    alert.error(
      error.response?._data?.message ||
        error.response?._data?.errors?.code?.[0] ||
        "فشل إعادة توليد رموز الاسترداد. حاول مرة أخرى.",
    );
  } finally {
    regeneratingCodes.value = false;
  }
};

const { copy: copyToClipboard } = useClipboard();

const copyRecoveryCodes = () => {
  // Extract just the codes from objects
  const codes = recoveryCodesList.value.map((item) =>
    typeof item === "string" ? item : item.code,
  );
  const codesText = codes.join("\n");
  copyToClipboard(codesText);
  alert.success("تم نسخ رموز الاسترداد إلى الحافظة");
};
</script>
