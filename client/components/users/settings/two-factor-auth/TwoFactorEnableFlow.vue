<template>
  <div class="space-y-4">
    <UButton color="primary" :loading="enabling" @click="handleEnable">
      تفعيل المصادقة الثنائية
    </UButton>

    <!-- QR Code Display -->
    <VTransition name="fadeHeight">
      <div
        v-if="secret"
        class="space-y-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50"
      >
        <div>
          <p class="text-sm font-medium text-neutral-900 mb-2">
            امسح هذا الرمز QR باستخدام تطبيق المصادقة:
          </p>
          <div
            class="flex justify-center p-4 bg-white rounded-lg max-w-xs mx-auto"
          >
            <div v-html="qrCode" class="flex" />
          </div>
        </div>

        <div>
          <p class="text-sm font-medium text-neutral-900 mb-2">
            أو أدخل هذا الرمز يدويًا:
          </p>
          <CopyContent :content="secret" label="نسخ الرمز السري" />
        </div>

        <div>
          <p class="text-sm font-medium text-neutral-900 mb-2">
            أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة للتأكيد:
          </p>
          <div class="flex justify-center mb-4">
            <UPinInput
              v-model="code"
              :length="6"
              type="number"
              otp
              size="lg"
              @complete="handleConfirm"
            />
          </div>
          <UButton
            block
            :loading="confirming"
            :disabled="code.length !== 6"
            @click="handleConfirm"
          >
            تأكيد وتمكين المصادقة الثنائية
          </UButton>
        </div>
      </div>
    </VTransition>
  </div>
</template>

<script setup>
import CopyContent from "~/components/open/forms/components/CopyContent.vue";

const props = defineProps({
  enabling: { type: Boolean, default: false },
  confirming: { type: Boolean, default: false },
  secret: { type: String, default: null },
  qrCode: { type: String, default: null },
});

const emit = defineEmits(["enable", "confirm"]);

const code = ref([]);

const handleEnable = () => {
  emit("enable");
};

const handleConfirm = () => {
  if (code.value.length === 6) {
    emit("confirm", code.value.join(""));
  }
};

watch(
  () => props.secret,
  (newSecret) => {
    if (!newSecret) {
      code.value = [];
    }
  },
);
</script>
