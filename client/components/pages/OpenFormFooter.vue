<template>
  <div class="w-full">
    <div class="grid md:grid-cols-3 my-8">
      <div class="flex mt-2 items-center">
        <p
          class="text-sm text-neutral-600 dark:text-neutral-400 text-center w-full"
        >
          © جميع الحقوق محفوظة {{ currYear }}
          <span v-if="version"> <br />الإصدار {{ version }} </span>
        </p>
      </div>
      <div class="flex justify-center mt-5 md:mt-0">
        <router-link
          :to="{ name: user ? 'home' : 'index' }"
          class="flex-shrink-0 font-semibold flex items-center"
        >
          <img
            src="/img/logo.svg"
            alt="شعار دائرة قاضي القضاة"
            class="w-10 h-10"
          />
          <span class="ml-2 text-xl text-black dark:text-white">
            دائرة قاضي القضاة
          </span>
        </router-link>
      </div>
      <!-- <div class="flex justify-center mt-5 md:mt-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
          <a
            :href="opnformConfig.links.feature_requests"
            target="_blank"
            class="text-neutral-600 dark:text-neutral-400 transition-colors duration-300 hover:text-blue-500"
          >
            طلبات الميزات
          </a>
          <a
            :href="opnformConfig.links.roadmap"
            target="_blank"
            class="text-neutral-600 dark:text-neutral-400 transition-colors duration-300 hover:text-blue-500"
          >
            خارطة الطريق
          </a>
          <a
            :href="opnformConfig.links.discord"
            target="_blank"
            class="text-neutral-600 dark:text-neutral-400 transition-colors duration-300 hover:text-blue-500"
          >
            ديسكورد
          </a>
          <a
            :href="opnformConfig.links.tech_docs"
            target="_blank"
            class="text-neutral-600 dark:text-neutral-400 transition-colors duration-300 hover:text-blue-500"
          >
            الوثائق التقنية
          </a>
          <template v-if="!useFeatureFlag('self_hosted')">
            <router-link
              :to="{ name: 'integrations' }"
              class="text-neutral-600 dark:text-neutral-400 transition-colors duration-300 hover:text-blue-500"
            >
              التكاملات
            </router-link>
            <router-link
              :to="{ name: 'report-abuse' }"
              class="text-neutral-600 dark:text-neutral-400 transition-colors duration-300 hover:text-blue-500"
            >
              الإبلاغ عن إساءة
            </router-link>
            <router-link
              :to="{ name: 'privacy-policy' }"
              class="text-neutral-600 dark:text-neutral-400 transition-colors duration-300 hover:text-blue-500"
            >
              سياسة الخصوصية
            </router-link>

            <router-link
              :to="{ name: 'terms-conditions' }"
              class="text-neutral-600 dark:text-neutral-400 transition-colors duration-300 hover:text-blue-500"
            >
              الشروط والأحكام
            </router-link>
          </template>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import opnformConfig from "~/opnform.config.js";

const { data: user } = useAuth().user();
const currYear = ref(new Date().getFullYear());

// Use the reactive version for proper template reactivity
const version = computed(() => useFeatureFlag("version"));
</script>
