<template>
  <v-group
    :config="{ x: computedX, y: computedY }"
    @click="handleClick"
    @mouseover="handleMouseOver"
    @mouseout="handleMouseOut"
  >
    <v-circle
      :config="{
        radius: buttonRadius,
        fill: fill,
        opacity: 0.65,
      }"
    />
    <v-text
      :config="{
        x: -buttonRadius,
        y: -buttonRadius + 3,
        width: buttonRadius * 2,
        height: buttonRadius * 2,
        text: icon,
        fontSize: computedFontSize,
        align: 'center',
        verticalAlign: 'middle',
        fill: textColor,
      }"
    />
  </v-group>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  photo: Object,
  fill: { type: String, required: true },
  icon: { type: String, default: "+" },
  fontSize: { type: Number, default: 24 },
  textColor: { type: String, default: "white" },
  sizeFactor: { type: Number, default: 1 },
});

const buttonRadius = computed(() => 24 * props.sizeFactor);
const computedFontSize = computed(() => props.fontSize * props.sizeFactor);

const computedX = computed(() => props.photo.config.width / 2);
const computedY = computed(() => props.photo.config.height / 2);

const emit = defineEmits(["click"]);

const handleClick = (position) => {
  emit("click", { photo: props.photo, position });
};

const handleMouseOver = (e) => {
  e.target.getStage().container().style.cursor = "pointer";
};

const handleMouseOut = (e) => {
  e.target.getStage().container().style.cursor = "default";
};
</script>
