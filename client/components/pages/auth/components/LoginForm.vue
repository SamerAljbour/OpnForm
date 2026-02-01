<template>
  <div>
    <forgot-password-modal
      :show="showForgotModal"
      @close="showForgotModal = false"
    />

    <two-factor-verification-modal
      v-if="pendingAuthToken"
      :show="showTwoFactorModal"
      :pending-auth-token="pendingAuthToken"
      @verified="handleTwoFactorVerifiedAndRedirect"
      @cancel="handleTwoFactorCancel"
    />

    <v-form method="POST" :form="form" @submit.prevent="login">
      <!-- البريد الإلكتروني -->
      <text-input
        name="email"
        label="البريد الإلكتروني"
        required
        placeholder="أدخل بريدك الإلكتروني"
        @blur="checkOidcOptions"
      />

      <!-- كلمة المرور - مخفية إذا كان OIDC متاح وغير مُجبر على العرض -->
      <VTransition name="fadeHeight">
        <text-input
          v-if="showPasswordField"
          ref="passwordInputRef"
          native-type="password"
          placeholder="كلمة المرور"
          name="password"
          label="كلمة المرور"
          required
          @input-filled="login"
        />
      </VTransition>

      <!-- تذكرني / نسيت كلمة المرور -->
      <div v-if="showPasswordField" class="relative flex items-center mt-1.5">
        <CheckboxInput
          class="w-full md:w-1/2"
          name="remember"
          size="small"
          label="تذكرني"
        />

        <div class="w-full md:w-1/2 text-right">
          <a
            href="#"
            class="text-xs hover:underline text-neutral-500 sm:text-sm hover:text-neutral-700"
            @click.prevent="showForgotModal = true"
          >
            هل نسيت كلمة المرور؟
          </a>
        </div>
      </div>

      <!-- زر تسجيل الدخول -->
      <UButton
        class="mt-2"
        block
        size="lg"
        :loading="form.busy"
        type="submit"
        :label="
          oidcAvailable && !showPasswordField
            ? 'متابعة'
            : 'تسجيل الدخول للمتابعة'
        "
      />

      <!-- تسجيل الدخول عبر جوجل -->
      <UButton
        v-if="
          useFeatureFlag('services.google.auth') &&
          !useFeatureFlag('self_hosted')
        "
        native-type="button"
        color="neutral"
        variant="outline"
        size="lg"
        class="space-x-4 mt-4 flex items-center"
        block
        :disabled="form.busy"
        :loading="false"
        @click.prevent="signInwithGoogle"
        icon="devicon:google"
        label="تسجيل الدخول عبر جوجل"
      />

      <!-- رابط التسجيل -->
      <p
        v-if="!useFeatureFlag('self_hosted')"
        class="text-neutral-500 text-sm text-center mt-4"
      >
        ليس لديك حساب؟
        <a
          v-if="isQuick"
          href="#"
          class="font-semibold ml-1"
          @click.prevent="$emit('openRegister')"
          >سجل الآن</a
        >
        <NuxtLink v-else :to="{ name: 'register' }" class="font-semibold ml-1">
          سجل الآن
        </NuxtLink>
      </p>
    </v-form>

    <!-- تسجيل الدخول السريع من جوجل One Tap -->
    <ClientOnly>
      <GoogleOneTap context="signin" />
    </ClientOnly>
  </div>
</template>

<script setup>
import ForgotPasswordModal from "../ForgotPasswordModal.vue";
import GoogleOneTap from "~/components/vendor/GoogleOneTap.vue";
import { WindowMessageTypes } from "~/composables/useWindowMessage";

// Props
const props = defineProps({
  isQuick: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// Emits
defineEmits(["openRegister"]);

// Composables
const oAuth = useOAuth();
const router = useRouter();
const { login: loginMutationFactory } = useAuth();
const authFlow = useAuthFlow();
const {
  showTwoFactorModal,
  pendingAuthToken,
  handleTwoFactorVerified,
  handleTwoFactorCancel,
  handleTwoFactorError,
} = authFlow;
const { completeLinkIfNeeded } = useOidcLinking();

// Feature flags
const oidcAvailable = computed(() => useFeatureFlag("oidc.available", false));
const oidcForced = computed(() => useFeatureFlag("oidc.forced", false));

// Reactive data
const form = useForm({
  email: "",
  password: "",
  remember: false,
});

const loginMutation = loginMutationFactory();
const showForgotModal = ref(false);
const showPasswordField = ref(!oidcAvailable.value || oidcForced.value);
const passwordInputRef = ref(null);

// Watch for password field visibility to focus it
watch(showPasswordField, async (newValue) => {
  if (newValue) {
    await nextTick();
    // Find the password input element by name/id
    const passwordInput = document.querySelector(
      'input[name="password"][type="password"]',
    );
    if (passwordInput) {
      passwordInput.focus();
    }
  }
});

// Lifecycle
onMounted(() => {
  // Use the window message composable
  const windowMessage = useWindowMessage(WindowMessageTypes.LOGIN_COMPLETE);

  // Listen for login complete messages
  windowMessage.listen(() => {
    redirect();
  });
});

// Methods
const checkOidcOptions = async () => {
  if (!oidcAvailable.value || !form.email || form.busy) {
    return;
  }

  form
    .post("/auth/oidc/options", { body: { email: form.email } })
    .then(async (response) => {
      if (response.action === "redirect") {
        // Get the redirect URL from the backend
        try {
          const redirectResponse = await form.post(
            `/auth/${response.slug}/redirect`,
          );

          if (redirectResponse.redirect_url) {
            // Redirect to OIDC provider
            window.location.href = redirectResponse.redirect_url;
            return;
          } else if (redirectResponse.error) {
            // Handle error from redirect endpoint
            useAlert().error(
              redirectResponse.error ||
                "Failed to initiate OIDC authentication",
            );
            showPasswordField.value = true;
            return;
          }
        } catch (error) {
          // Handle network or server errors
          const errorMessage =
            error.response?._data?.error ||
            error.response?._data?.message ||
            "Failed to initiate OIDC authentication";
          useAlert().error(errorMessage);
          showPasswordField.value = true;
          return;
        }
      } else if (response.action === "blocked") {
        // OIDC is forced but no connection found
        useAlert().error(
          "OIDC authentication is required. Please contact your administrator.",
        );
        return;
      } else {
        // Fallback to password login
        showPasswordField.value = true;
      }
    })
    .catch((error) => {
      // Form automatically handles 422 validation errors (invalid email, etc.)
      // Only show password field as fallback for non-validation errors
      if (error.response?.status !== 422) {
        showPasswordField.value = true;
      }
    });
};

const login = () => {
  // If OIDC is available and password field is hidden, check OIDC options first
  if (oidcAvailable.value && !showPasswordField.value && form.email) {
    checkOidcOptions();
    return;
  }

  // Normal password login
  if (!form.password && showPasswordField.value) {
    useAlert().error("Password is required");
    return;
  }

  form
    .mutate(loginMutation)
    .then(() => {
      // If 2FA modal is shown, don't redirect yet (handled in handleTwoFactorVerified)
      if (!showTwoFactorModal.value) {
        completeLinkIfNeeded().then((shouldRedirect) => {
          if (shouldRedirect) {
            redirect();
          }
        });
      }
    })
    .catch((error) => {
      // Check if this is a 2FA requirement (422 with requires_2fa flag)
      const twoFactorData = handleTwoFactorError(error);
      if (twoFactorData) {
        // This is a 2FA requirement, already handled in onError, just return
        return;
      }

      // Handle other errors
      console.log(error);
      if (
        error.response?._data?.message ==
        "You must change your credentials when in self host mode"
      ) {
        redirect();
      }
    });
};

const redirect = () => {
  if (props.isQuick) {
    // Use window message instead of event
    const afterLoginMessage = useWindowMessage(WindowMessageTypes.AFTER_LOGIN);
    afterLoginMessage.send(window);
    return;
  }

  const intendedUrlCookie = useCookie("intended_url");

  if (intendedUrlCookie.value) {
    router.push({ path: intendedUrlCookie.value });
    useCookie("intended_url").value = null;
  } else {
    router.push({ name: "home" });
  }
};

const showOAuthError = (error) => {
  if (error.response?.status === 422 && error.response?.data?.message) {
    useAlert().error(error.response.data.message);
  } else {
    useAlert().error("Sign-in failed. Please try again.");
  }
};

const signInwithGoogle = () => {
  try {
    oAuth.guestConnect("google", true);
  } catch (error) {
    showOAuthError(error);
  }
};

const handleTwoFactorVerifiedAndRedirect = (tokenData) => {
  handleTwoFactorVerified(tokenData).then(() => {
    completeLinkIfNeeded().then((shouldRedirect) => {
      if (shouldRedirect) {
        redirect();
      }
    });
  });
};
</script>
