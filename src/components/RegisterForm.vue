<template>
  <div class="register-form">
    <div class="form-header">
      <h2 class="form-title">Crear Cuenta</h2>
      <p class="form-description">Únete a la comunidad de Trova</p>
    </div>

    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      size="large"
      :show-label="false"
      @submit.prevent="handleSubmit"
    >
      <n-form-item path="name" class="form-item">
        <n-input
          v-model:value="formData.name"
          placeholder="Nombre completo"
          :input-props="{ autocomplete: 'name' }"
          class="form-input"
        >
          <template #prefix>
            <n-icon :component="UserIcon" />
          </template>
        </n-input>
      </n-form-item>

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
          placeholder="Contraseña"
          :input-props="{ autocomplete: 'new-password' }"
          class="form-input"
          show-password-on="click"
        >
          <template #prefix>
            <n-icon :component="LockIcon" />
          </template>
        </n-input>
      </n-form-item>

      <n-form-item path="confirmPassword" class="form-item">
        <n-input
          v-model:value="formData.confirmPassword"
          type="password"
          placeholder="Confirmar contraseña"
          :input-props="{ autocomplete: 'new-password' }"
          class="form-input"
          show-password-on="click"
        >
          <template #prefix>
            <n-icon :component="LockIcon" />
          </template>
        </n-input>
      </n-form-item>

      <div class="form-terms">
        <n-checkbox v-model:checked="acceptTerms" class="terms-checkbox">
          <span class="terms-text">
            Acepto los
            <n-button text type="primary" class="terms-link"
              >términos y condiciones</n-button
            >
            y la
            <n-button text type="primary" class="terms-link"
              >política de privacidad</n-button
            >
          </span>
        </n-checkbox>
      </div>

      <n-button
        type="primary"
        size="large"
        :loading="userStore.isLoading"
        :disabled="!acceptTerms"
        class="submit-button"
        attr-type="submit"
        @click="handleSubmit"
      >
        Crear Cuenta
      </n-button>
    </n-form>

    <AuthProviders />

    <div class="form-footer">
      <span class="footer-text">¿Ya tienes cuenta?</span>
      <n-button
        text
        type="primary"
        @click="$emit('switch-mode', 'login')"
        class="switch-button"
      >
        Inicia sesión aquí
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useUserStore } from "../stores/userStore";
import { useMessage } from "naive-ui";
import type { FormInst, FormRules } from "naive-ui";
import AuthProviders from "./AuthProviders.vue";

// Icons
const UserIcon = () =>
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
      h("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
      h("circle", { cx: "12", cy: "7", r: "4" }),
    ],
  );

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

const userStore = useUserStore();
const message = useMessage();

const formRef = ref<FormInst | null>(null);
const acceptTerms = ref(false);

const formData = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const rules: FormRules = {
  name: [
    {
      required: true,
      message: "Nombre es requerido",
      trigger: ["input", "blur"],
    },
    {
      min: 2,
      message: "El nombre debe tener al menos 2 caracteres",
      trigger: ["input", "blur"],
    },
  ],
  email: [
    {
      required: true,
      message: "Email es requerido",
      trigger: ["input", "blur"],
    },
    {
      type: "email",
      message: "Formato de email inválido",
      trigger: ["input", "blur"],
    },
  ],
  password: [
    {
      required: true,
      message: "Contraseña es requerida",
      trigger: ["input", "blur"],
    },
    {
      min: 6,
      message: "La contraseña debe tener al menos 6 caracteres",
      trigger: ["input", "blur"],
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: "Confirma tu contraseña",
      trigger: ["input", "blur"],
    },
    {
      validator: (rule, value) => {
        if (value !== formData.password) {
          return new Error("Las contraseñas no coinciden");
        }
        return true;
      },
      trigger: ["input", "blur"],
    },
  ],
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  if (!acceptTerms.value) {
    message.warning("Debes aceptar los términos y condiciones");
    return;
  }

  try {
    await formRef.value.validate();

    const result = await userStore.register(
      formData.email,
      formData.password,
      formData.name,
    );

    if (result.success) {
      message.success("¡Cuenta creada exitosamente! Bienvenido a Trova.");
      // Note: Navigation will be handled by App.vue watching auth state
    } else {
      message.error(result.error || "Error al crear la cuenta");
    }
  } catch (error) {
    // Validation failed, errors will be shown in form
  }
};
</script>

<script lang="ts">
import { h } from "vue";

export default {
  name: "RegisterForm",
};
</script>

<style scoped>
.register-form {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #ffffffd1;
  letter-spacing: -0.025em;
}

.form-description {
  margin: 0;
  font-size: 16px;
  color: #ffffff73;
  font-weight: 400;
}

.form-item {
  margin-bottom: 20px;
}

.form-input {
  height: 48px;
  border-radius: 8px;
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

.form-terms {
  margin-bottom: 24px;
}

.terms-checkbox :deep(.n-checkbox__label) {
  font-size: 14px;
  color: #ffffff73;
  line-height: 1.5;
}

.terms-text {
  display: inline;
}

.terms-link {
  font-size: 14px;
  padding: 0;
  height: auto;
  display: inline;
  vertical-align: baseline;
}

.submit-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 16px;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
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

  .form-terms {
    margin-bottom: 20px;
  }

  .terms-checkbox :deep(.n-checkbox__label) {
    font-size: 13px;
  }

  .terms-link {
    font-size: 13px;
  }

  .form-footer {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
