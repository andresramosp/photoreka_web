<template>
  <n-tag
    :checked="modelValue"
    checkable
    size="small"
    @update:checked="isSelected = $event"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
    :style="{
      opacity: 0.9,
      'border-radius': pillHeight / 2 + 'px',
      'background-color': isSelected
        ? selectedColor
        : hovered
        ? hoverColor
        : defaultColor,
      color: textColor,
      'font-size': fontSize + 'px',
      width: pillWidth + 'px',
      'justify-content': 'center',
      cursor: 'pointer',
    }"
  >
    {{ shortened }}
  </n-tag>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  tag: { type: Object, required: true },
  modelValue: Boolean,
  selectedColor: String,
  hoverColor: String,
  defaultColor: String,
  textColor: String,
  pillHeight: Number,
});

const emit = defineEmits(["update:modelValue"]);

const hovered = ref(false);

const isSelected = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const fontSize = 12;
const textPadding = 2;

const shortened = computed(() => props.tag.name);
const pillWidth = computed(() => {
  const approxWidth = shortened.value.length * (fontSize * 0.5);
  return approxWidth + textPadding + 7;
});
</script>
