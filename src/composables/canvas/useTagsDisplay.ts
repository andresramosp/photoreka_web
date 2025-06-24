// composables/useTagDisplay.ts
import { computed } from "vue";
import { shortenTag } from "@/utils/utils";
import { useTheme } from "vuetify";

export function useTagDisplay(tagsSource: () => any[] | undefined) {
  const allowedGroups = [
    "person",
    "animals",
    "objects",
    "environment",
    "misc",
    "toponym",
    "mood",
    "weather",
    "symbols",
  ];

  const filteredTags = computed(() => {
    const seen = new Map();
    const tags = tagsSource() || [];
    for (const tagPhoto of tags) {
      const tag = tagPhoto.tag || tagPhoto; // Soporta tanto `tagPhoto.tag` como `tag`
      const id = tag.id;
      if (allowedGroups.includes(tag.group) && !seen.has(id)) {
        seen.set(id, tagPhoto);
      }
    }
    return Array.from(seen.values()).sort(
      (t1, t2) =>
        shortenTag((t2.tag || t2).name).length -
        shortenTag((t1.tag || t1).name).length
    );
  });

  const theme = useTheme();
  const selectedColor = theme.current.value.colors.secondary;
  const hoverColor = "lightgray";
  const defaultColor = "gray";
  const textColor = theme.current.value.colors.primary;
  const pillHeight = 18;

  return {
    filteredTags,
    allowedGroups,
    selectedColor,
    hoverColor,
    defaultColor,
    textColor,
    pillHeight,
  };
}
