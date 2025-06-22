<template>
  <div class="login-form">
    <div class="form-header">
      <h2 class="form-title">Log In</h2>
      <p class="form-description">Access your Trova account</p>
    </div>

    <AuthProviders />

    <div class="email-divider">
      <span class="divider-text">Or with email</span>
    </div>

    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      size="large"
      :show-label="false"
      @submit.prevent="handleSubmit"
    >
      <n-form-item path="email" class="form-item">
        <n-input
          v-model:value="formData.email"
          type="email"
          placeholder="Email"
          :input-props="{ autocomplete: 'email' }"
          class="form-input"
        >
          <template #prefix>
            <n-icon :component="EmailIcon" />
          </template>
        </n-input>
      </n-form-item>

      <n-form-item path="password" class="form-item">
        <n-input
          v-model:value="formData.password"
          type="password"
          placeholder="Password"
          :input-props="{ autocomplete: 'current-password' }"
          class="form-input"
          show-password-on="click"
        >
          <template #prefix>
            <n-icon :component="LockIcon" />
          </template>
        </n-input>
      </n-form-item>

      <div class="form-options">
        <n-checkbox v-model:checked="rememberMe" class="remember-checkbox">
          Remember me
        </n-checkbox>
        <n-button text type="primary" class="forgot-password">
          Forgot password?
        </n-button>
      </div>

      <n-button
        type="primary"
        size="large"
        :loading="userStore.isLoading"
        class="submit-button"
        attr-type="submit"
        @click="handleSubmit"
      >
        Log In
      </n-button>
    </n-form>

    <div class="form-footer">
      <span class="footer-text">Don't have an account?</span>
      <n-button
        text
        type="primary"
        @click="$emit('switch-mode', 'register')"
        class="switch-button"
      >
        Sign up here
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { useMessage } from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";
import AuthProviders from "./AuthProviders.vue";

// Icons
const EmailIcon = () =>
  h(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
    },
    [
      h("path", {
        d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
      }),
      h("polyline", { points: "22,6 12,13 2,6" }),
    ],
  );

const LockIcon = () =>
  h(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
    },
    [
      h("rect", {
        x: "3",
        y: "11",
        width: "18",
        height: "11",
        rx: "2",
        ry: "2",
      }),
      h("circle", { cx: "12", cy: "16", r: "1" }),
      h("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }),
    ],
  );

const emit = defineEmits(["switch-mode"]);

const router = useRouter();
const userStore = useUserStore();
const message = useMessage();

const formRef = ref<FormInst | null>(null);
const rememberMe = ref(false);

const formData = reactive({
  email: "",
  password: "",
});

const rules: FormRules = {
  email: [
    {
      required: true,
      message: "Email is required",
      trigger: ["input", "blur"],
    },
    {
      type: "email",
      message: "Invalid email format",
      trigger: ["input", "blur"],
    },
  ],
  password: [
    {
      required: true,
      message: "Password is required",
      trigger: ["input", "blur"],
    },
    {
      min: 6,
      message: "Password must be at least 6 characters",
      trigger: ["input", "blur"],
    },
  ],
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const result = await userStore.login(formData.email, formData.password);

    if (result.success) {
      message.success("Welcome back!");
      router.push("/dashboard");
    } else {
      message.error(result.error || "Error logging in");
    }
  } catch (error) {
    // Validation failed, errors will be shown in form
  }
};
</script>

<script lang="ts">
import { h } from "vue";

export default {
  name: "LoginForm",
};
</script>

<style scoped>
.login-form {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 16px;
}

.form-description {
  margin: 0;
  font-size: 16px;
  color: #ffffff73;
  font-weight: 400;
}

.form-item {
  margin-bottom: 8px;
}

.form-input {
  height: 40px;
  border-radius: 6px;
}

.form-input :deep(.n-input__input-el) {
  font-size: 14px;
}

.form-input :deep(.n-input__border),
.form-input :deep(.n-input__state-border) {
  border-color: #2c2c32;
}

.form-input :deep(.n-input--focus .n-input__border),
.form-input :deep(.n-input--focus .n-input__state-border) {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.remember-checkbox :deep(.n-checkbox__label) {
  font-size: 14px;
  color: #ffffff73;
}

.forgot-password {
  font-size: 14px;
  padding: 0;
  height: auto;
}

.submit-button {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
}

.email-divider {
  position: relative;
  text-align: center;
  margin: 12px 0;
}

.email-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #2c2c32;
}

.divider-text {
  background-color: #1a1a1f;
  padding: 0 16px;
  font-size: 13px;
  color: #ffffff73;
  position: relative;
  z-index: 1;
}

.form-footer {
  text-align: center;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-text {
  font-size: 14px;
  color: #ffffff73;
}

.switch-button {
  font-size: 14px;
  padding: 0;
  height: auto;
  font-weight: 500;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .form-header {
    margin-bottom: 24px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-description {
    font-size: 14px;
  }

  .form-input,
  .submit-button {
    height: 44px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }

  .form-footer {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
