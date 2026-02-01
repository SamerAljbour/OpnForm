<template>
  <div class="min-h-screen flex flex-col justify-center">
    <div class="flex mt-6 mb-10 justify-center w-full">
      <div
        class="w-full md:max-w-6xl px-4 flex md:flex-row-reverse flex-wrap justify-center"
      >
        <div class="w-full md:w-1/2 md:p-6">
          <div class="border rounded-md p-6 shadow-md sticky top-4">
            <h2 class="font-semibold text-2xl text-center">
              تسجيل الدخول إلى استبيانات
            </h2>
            <p class="text-sm text-neutral-500 mb-4 text-center">
              مرحبًا بعودتك! الرجاء إدخال بياناتك.
            </p>

            <login-form />
          </div>
        </div>

        <!-- <div class="w-full md:w-1/2 md:p-6 mt-8 md:mt-0">
          <h1 class="font-bold">
            Create beautiful forms and share them anywhere
          </h1>
          <p class="text-neutral-900 my-4 text-lg">
            It takes seconds, you don't need to know how to code and it's free.
          </p>
          <div class="flex flex-wrap justify-center">
            <p class="px-3 pb-3 text-sm text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Unlimited forms
            </p>
            <p class="px-3 pb-3 text-sm text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Unlimited fields
            </p>
            <p class="px-3 pb-3 text-sm text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Unlimited submissions
            </p>
          </div>
        </div> -->
      </div>
    </div>
    <open-form-footer />
  </div>
</template>

<script setup>
import LoginForm from "~/components/pages/auth/components/LoginForm.vue";

definePageMeta({
  middleware: "guest",
});
useOpnSeoMeta({
  title: "Login",
});
</script>
