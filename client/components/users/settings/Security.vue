<template>
  <div class="space-y-8">
    <!-- Password Section -->
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-neutral-900">تغيير كلمة المرور</h3>
        <p class="text-sm text-neutral-500 mt-1">
          حدّث كلمة المرور الخاصة بك للحفاظ على أمان حسابك.
        </p>
      </div>

      <VForm size="sm">
        <form @submit.prevent="updatePassword">
          <div class="max-w-sm">
            <TextInput
              :form="passwordForm"
              name="current_password"
              label="كلمة المرور الحالية"
              native-type="password"
              placeholder="أدخل كلمة المرور الحالية"
              :required="true"
            />

            <TextInput
              :form="passwordForm"
              name="password"
              label="كلمة المرور الجديدة"
              native-type="password"
              placeholder="أدخل كلمة المرور الجديدة"
              :required="true"
              @focus="isPasswordFocused = true"
              @blur="isPasswordFocused = false"
            />
            <PasswordStrengthIndicator
              v-show="isPasswordFocused"
              :password="passwordForm.password"
            />

            <TextInput
              :form="passwordForm"
              name="password_confirmation"
              label="تأكيد كلمة المرور"
              native-type="password"
              placeholder="أكد كلمة المرور الجديدة"
              :required="true"
            />
          </div>

          <div class="mt-4">
            <UButton type="submit" :loading="passwordForm.busy" color="primary">
              تحديث كلمة المرور
            </UButton>
          </div>
        </form>
      </VForm>
    </div>

    <div class="pt-8 border-t border-neutral-200">
      <UsersSettingsTwoFactorAuth />
    </div>
  </div>
</template>

<script setup>
const alert = useAlert();

// Password form
const passwordForm = useForm({
  current_password: "",
  password: "",
  password_confirmation: "",
});

// Password field focus state
const isPasswordFocused = ref(false);

// Update password
const updatePassword = () => {
  passwordForm
    .patch("/settings/password")
    .then(() => {
      passwordForm.reset();
      alert.success("Password updated.");
    })
    .catch((error) => {
      console.error(error);
    });
};
</script>
