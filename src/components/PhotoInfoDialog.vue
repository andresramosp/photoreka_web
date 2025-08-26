<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :style="{ maxWidth: '90vw', width: '1000px', maxHeight: '90vh' }"
  >
    <template #header>
      <div class="dialog-header">
        <h3 class="photo-name">
          {{ selectedPhoto?.originalFileName || "Untitled" }}
        </h3>
        <div class="header-actions">
          <n-button
            size="small"
            @click="copyNameToClipboard"
            title="Copy name to clipboard"
          >
            <template #icon>
              <n-icon>
                <CopyIcon />
              </n-icon>
            </template>
          </n-button>
          <n-button
            size="small"
            @click="handleDownloadPhoto"
            title="Download photo"
          >
            <template #icon>
              <n-icon>
                <DownloadIcon />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </template>

    <div class="dialog-content">
      <!-- Large Photo Display -->
      <div class="photo-display">
        <img
          :src="
            selectedPhoto?.originalUrl ||
            selectedPhoto?.url ||
            selectedPhoto?.thumbnailUrl
          "
          :alt="selectedPhoto?.filename || selectedPhoto?.name || 'Photo'"
          class="main-photo"
          @error="handleImageError"
        />
      </div>
      <!-- Accordion Sections -->
      <div class="info-sections">
        <n-collapse :default-expanded-names="['metadata']">
          <n-collapse-item title="Insights" name="descriptions">
            <template #header-extra>
              <n-icon>
                <DocumentTextIcon />
              </n-icon>
            </template>
            <div class="descriptions-section">
              <div class="custom-description-section">
                <div
                  v-if="!photoInsight && !isGeneratingInsight"
                  class="generate-section"
                >
                  <n-button
                    type="primary"
                    size="medium"
                    @click="getInsight"
                    block
                  >
                    <template #icon>
                      <n-icon>
                        <SparklesIcon />
                      </n-icon>
                    </template>
                    Get a insight
                  </n-button>
                </div>
                <div v-else-if="isGeneratingInsight" class="generating-section">
                  <n-spin size="medium" />
                  <p class="generating-text">Reviewing the image...</p>
                </div>
                <div v-else class="description-display">
                  <div class="description-content">
                    <p>{{ photoInsight }}</p>
                  </div>
                  <div
                    style="display: flex; justify-content: center; width: 100%"
                  >
                    <n-button
                      size="small"
                      @click="showNextInsight"
                      :loading="isGeneratingInsight"
                      class="regenerate-btn"
                      v-if="hasMoreInsights"
                    >
                      <template #icon>
                        <n-icon>
                          <RefreshIcon />
                        </n-icon>
                      </template>
                      Load more insights
                    </n-button>
                  </div>
                </div>
              </div>
            </div>
          </n-collapse-item>

          <!-- Visual Aspects Section -->
          <n-collapse-item
            title="Visual Aspects"
            name="visual-aspects"
            v-if="selectedPhoto?.descriptions?.visual_aspects"
          >
            <template #header-extra>
              <n-icon>
                <EyeIcon />
              </n-icon>
            </template>
            <div class="visual-aspects-section">
              <!-- Summary section -->
              <div
                v-if="selectedPhoto.descriptions.visual_aspects.summary"
                class="visual-aspects-summary"
              >
                <h6 class="summary-title">Summary</h6>
                <div class="summary-content">
                  <p>{{ selectedPhoto.descriptions.visual_aspects.summary }}</p>
                </div>
              </div>

              <!-- Visual aspects grid -->
              <div class="visual-aspects-grid">
                <div
                  v-for="(values, category) in getFilteredVisualAspects(
                    selectedPhoto.descriptions.visual_aspects
                  )"
                  :key="category"
                  class="visual-aspect-category"
                >
                  <h6 class="aspect-category-title">
                    {{ formatCategoryName(category) }}
                  </h6>
                  <div class="aspect-tags">
                    <n-tag
                      v-for="value in values"
                      :key="value"
                      type="info"
                      size="small"
                      class="aspect-tag"
                    >
                      {{ value }}
                    </n-tag>
                  </div>
                </div>
              </div>
            </div>
          </n-collapse-item>

          <!-- Scores Section -->
          <n-collapse-item title="Scores" name="scores">
            <template #header-extra>
              <n-icon>
                <DocumentTextIcon />
              </n-icon>
            </template>
            <div class="descriptions-section">
              <div v-if="selectedPhoto?.descriptions" class="ai-descriptions">
                <div
                  class="description-item"
                  v-if="selectedPhoto.descriptions.artistic_scores"
                >
                  <!-- Overall Rating -->
                  <div class="overall-rating-container">
                    <div class="overall-rating">
                      <span class="overall-label">Overall Rating:</span>
                      <div class="overall-score">
                        <span class="overall-value"
                          >{{ overallRating.average }}/{{
                            scoreScale.max
                          }}</span
                        >
                        <span
                          class="overall-rating-text"
                          :class="
                            'rating-' +
                            overallRating.rating
                              .toLowerCase()
                              .replace(' ', '-')
                              .replace('/', '')
                          "
                        >
                          {{ overallRating.rating }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Genre Presets -->
                  <div class="genre-presets-container">
                    <div class="genre-header">
                      <h6 class="genre-title">Photography Genre Presets</h6>
                      <p class="genre-subtitle">
                        Quick configurations for different photography styles
                      </p>
                    </div>
                    <div class="genre-buttons">
                      <n-tooltip
                        trigger="hover"
                        placement="bottom"
                        :show-arrow="false"
                      >
                        <template #trigger>
                          <n-button
                            :type="
                              selectedGenre === 'street' ? 'primary' : 'default'
                            "
                            size="medium"
                            @click="applyGenrePresetWithUI('street')"
                            class="genre-button"
                          >
                            <template #icon>
                              <n-icon>
                                <WalkOutline />
                              </n-icon>
                            </template>
                            Street
                          </n-button>
                        </template>
                        <div v-html="formatGenreTooltip('street')"></div>
                      </n-tooltip>

                      <n-tooltip
                        trigger="hover"
                        placement="bottom"
                        :show-arrow="false"
                      >
                        <template #trigger>
                          <n-button
                            :type="
                              selectedGenre === 'documentary'
                                ? 'primary'
                                : 'default'
                            "
                            size="medium"
                            @click="applyGenrePresetWithUI('documentary')"
                            class="genre-button"
                          >
                            <template #icon>
                              <n-icon>
                                <BookOpen16Regular />
                              </n-icon>
                            </template>
                            Documentary
                          </n-button>
                        </template>
                        <div v-html="formatGenreTooltip('documentary')"></div>
                      </n-tooltip>

                      <n-tooltip
                        trigger="hover"
                        placement="bottom"
                        :show-arrow="false"
                      >
                        <template #trigger>
                          <n-button
                            :type="
                              selectedGenre === 'abstract'
                                ? 'primary'
                                : 'default'
                            "
                            size="medium"
                            @click="applyGenrePresetWithUI('abstract')"
                            class="genre-button"
                          >
                            <template #icon>
                              <n-icon>
                                <PaletteOutlined />
                              </n-icon>
                            </template>
                            Artistic
                          </n-button>
                        </template>
                        <div v-html="formatGenreTooltip('abstract')"></div>
                      </n-tooltip>
                    </div>
                  </div>

                  <!-- Weights Configuration -->
                  <div
                    class="weights-configuration-container"
                    v-if="showCustomWeights"
                  >
                    <div class="weights-header">
                      <h6 class="weights-title">Score Weights Configuration</h6>
                    </div>
                    <CustomArtisticWeights
                      v-model="artisticScoreWeights"
                      :format-criterion-name="formatCriterionName"
                    />
                  </div>

                  <div class="artistic-scores-grid">
                    <div
                      v-for="scoreData in getOrderedArtisticScores(
                        selectedPhoto.descriptions.artistic_scores
                      )"
                      :key="scoreData.criterion"
                      class="score-item"
                      :class="{ 'bonus-item': scoreData.group === 'bonus' }"
                      :style="{
                        '--weight-scale':
                          artisticScoreWeights[scoreData.criterion],
                        '--weight-opacity':
                          artisticScoreWeights[scoreData.criterion],
                      }"
                    >
                      <span
                        class="score-label"
                        :data-weight="`×${artisticScoreWeights[
                          scoreData.criterion
                        ].toFixed(1)}`"
                        :title="`Score: ${scoreData.score}/${
                          scoreScale.max
                        } | Weight: ${artisticScoreWeights[
                          scoreData.criterion
                        ].toFixed(1)} | Impact: ${(
                          scoreData.score *
                          artisticScoreWeights[scoreData.criterion]
                        ).toFixed(1)}`"
                      >
                        {{ scoreData.label }}
                      </span>
                      <div class="score-bar-container">
                        <div class="score-bar">
                          <div
                            class="score-fill"
                            :style="{
                              width: (scoreData.score / 9) * 100 + '%',
                              opacity: 0.8,
                              background: getScoreBgColor(scoreData.score),
                            }"
                          ></div>
                        </div>
                        <span class="score-value">
                          <span class="score-number">{{
                            scoreData.score
                          }}</span>
                          <span class="max-score">/{{ scoreScale.max }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </n-collapse-item>

          <n-collapse-item title="Tags" name="tags">
            <template #header-extra>
              <n-icon>
                <TagIcon />
              </n-icon>
            </template>
            <div class="tags-section">
              <div class="existing-tags" v-if="photoTags.length > 0">
                <div class="tags-list">
                  <n-tag
                    v-for="tag in photoTags.filter(
                      (tag) => tag.group !== 'misc'
                    )"
                    :key="tag.id || tag.name"
                    closable
                    type="info"
                    :bordered="false"
                    @close="removeTag(tag)"
                    class="photo-tag"
                  >
                    {{ tag.name || tag }} | {{ tag.area }}
                  </n-tag>
                </div>
              </div>
              <div class="add-tag-section">
                <n-input-group>
                  <n-input
                    v-model:value="newTagName"
                    placeholder="Add a new tag..."
                    @keydown.enter="addTag"
                    :disabled="isAddingTag"
                  />
                  <n-button
                    type="primary"
                    @click="addTag"
                    :loading="isAddingTag"
                    :disabled="!newTagName.trim()"
                  >
                    Add
                  </n-button>
                </n-input-group>
              </div>
            </div>
          </n-collapse-item>

          <!-- Descriptions Section -->
          <n-collapse-item title="Descriptions" name="descriptions">
            <template #header-extra>
              <n-icon>
                <DocumentTextIcon />
              </n-icon>
            </template>
            <div class="descriptions-section">
              <div v-if="selectedPhoto?.descriptions" class="ai-descriptions">
                <div class="description-item">
                  <h5 class="description-label">Story</h5>
                  <div class="description-content">
                    <p
                      v-html="
                        highlightMatchingChunks(
                          selectedPhoto.descriptions.story
                        )
                      "
                    ></p>
                  </div>
                </div>

                <div class="description-item">
                  <h5 class="description-label">Context</h5>
                  <div class="description-content">
                    <p
                      v-html="
                        highlightMatchingChunks(
                          selectedPhoto.descriptions.context
                        )
                      "
                    ></p>
                  </div>
                </div>

                <div class="description-item">
                  <h5 class="description-label">Visual Accents</h5>
                  <div class="description-content">
                    <p
                      v-html="
                        highlightMatchingChunks(
                          selectedPhoto.descriptions.visual_accents
                        )
                      "
                    ></p>
                  </div>
                </div>
              </div>
            </div>
          </n-collapse-item>

          <!-- Notes Section -->
          <n-collapse-item title="Notes" name="notes">
            <template #header-extra>
              <n-icon>
                <EditIcon />
              </n-icon>
            </template>
            <div class="notes-section">
              <n-input
                v-model:value="photoNotes"
                type="textarea"
                placeholder="Add your personal notes about this photo..."
                :autosize="{ minRows: 3, maxRows: 8 }"
                @blur="saveNotes"
              />
              <div class="notes-actions">
                <n-button
                  size="small"
                  type="primary"
                  @click="saveNotes"
                  :loading="isSavingNotes"
                >
                  Save Notes
                </n-button>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import {
  NModal,
  NIcon,
  NButton,
  NCollapse,
  NCollapseItem,
  NTag,
  NInput,
  NInputGroup,
  NSpin,
  NSwitch,
  NTooltip,
  useMessage,
} from "naive-ui";
import CustomArtisticWeights from "./CustomArtisticWeights.vue";

// Icons from @vicons
import {
  CopyOutline as CopyIcon,
  DownloadOutline as DownloadIcon,
  InformationCircleOutline as InfoIcon,
  PricetagOutline as TagIcon,
  DocumentTextOutline as DocumentTextIcon,
  SparklesOutline as SparklesIcon,
  RefreshOutline as RefreshIcon,
  CreateOutline as EditIcon,
  EyeOutline as EyeIcon,
  WalkOutline,
} from "@vicons/ionicons5";

import { api } from "@/utils/axios.js";
import { usePhotoDownload } from "@/composables/usePhotoDownload.js";
import { useArtisticScores } from "@/composables/useArtisticScores.js";
import { BookOpen16Regular } from "@vicons/fluent";
import { PaletteOutlined } from "@vicons/material";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  selectedPhoto: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const message = useMessage();
const { downloadPhoto } = usePhotoDownload();
const {
  scoreScale,
  calculateArtisticScore,
  getScoreBgColor,
  formatCriterionName,
  formatGenreTooltip,
  artisticScoreWeights,
  selectedGenre,
  applyGenrePreset,
  getActiveArtisticScores,
  getOrderedArtisticScores,
} = useArtisticScores();

// Reactive state
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const photoTags = ref([]);
const newTagName = ref("");
const isAddingTag = ref(false);
const photoInsight = ref("");
const isGeneratingInsight = ref(false);
const photoNotes = ref("");
const isSavingNotes = ref(false);

const showCustomWeights = ref(false);

// Function to show custom weight controls
const showCustomControls = () => {
  selectedGenre.value = "custom";
  showCustomWeights.value = true; // Show custom weights for manual configuration
  // Don't reset weights, keep current configuration
};

// Override applyGenrePreset to also control showCustomWeights
const applyGenrePresetWithUI = (genre) => {
  applyGenrePreset(genre);
  showCustomWeights.value = false; // Hide custom weights when applying preset
};

// Watch for photo changes and reset data
watch(
  () => props.selectedPhoto,
  (newPhoto) => {
    if (newPhoto) {
      // Initialize tags from photo data
      photoTags.value = newPhoto.tags ? [...newPhoto.tags] : [];

      // Initialize description and notes if they exist
      photoInsight.value = newPhoto.description || "";
      photoNotes.value = newPhoto.notes || "";

      // Add mock metadata if missing
      if (!newPhoto.created_at) {
        newPhoto.created_at = new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ).toISOString();
      }
      if (!newPhoto.size) {
        newPhoto.size = Math.floor(Math.random() * 8000000) + 1500000; // 1.5-8MB
      }
      if (!newPhoto.width || !newPhoto.height) {
        newPhoto.width = 3000 + Math.floor(Math.random() * 3000);
        newPhoto.height = 2000 + Math.floor(Math.random() * 2000);
      }
      if (!newPhoto.location) {
        const locations = [
          "San Francisco, CA",
          "New York, NY",
          "London, UK",
          "Tokyo, Japan",
          "Barcelona, Spain",
          "Sydney, Australia",
        ];
        newPhoto.location =
          Math.random() > 0.3
            ? locations[Math.floor(Math.random() * locations.length)]
            : null;
      }
      if (!newPhoto.camera) {
        const cameras = [
          "Canon EOS R5",
          "Sony A7R IV",
          "Nikon Z9",
          "Fujifilm X-T5",
          "Canon EOS R6 Mark II",
        ];
        newPhoto.camera = cameras[Math.floor(Math.random() * cameras.length)];
      }
      if (!newPhoto.lens) {
        const lenses = [
          "RF 24-70mm f/2.8L IS USM",
          "FE 85mm f/1.4 GM",
          "NIKKOR Z 50mm f/1.2 S",
          "XF 35mm f/1.4 R",
          "RF 16-35mm f/2.8L IS USM",
        ];
        newPhoto.lens = lenses[Math.floor(Math.random() * lenses.length)];
      }
      if (!newPhoto.focalLength) {
        newPhoto.focalLength = 24 + Math.floor(Math.random() * 176); // 24-200mm
      }
      if (!newPhoto.aperture) {
        newPhoto.aperture = (1.4 + Math.random() * 4).toFixed(1); // f/1.4 - f/5.4
      }
      if (!newPhoto.shutterSpeed) {
        const speeds = [
          "1/15",
          "1/30",
          "1/60",
          "1/125",
          "1/250",
          "1/500",
          "1/1000",
          "1/2000",
        ];
        newPhoto.shutterSpeed =
          speeds[Math.floor(Math.random() * speeds.length)];
      }
      if (!newPhoto.iso) {
        const isos = [100, 200, 400, 800, 1600, 3200, 6400];
        newPhoto.iso = isos[Math.floor(Math.random() * isos.length)];
      }
    }
  },
  { immediate: true }
);

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "Unknown";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatCategoryName = (category) => {
  // Convert snake_case to Title Case
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const splitArtisticReview = (text) => {
  if (!text) return [];

  // Split into sentences, keeping the period
  const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];

  if (sentences.length <= 3) {
    return sentences;
  }

  // Calculate approximately equal chunks
  const totalSentences = sentences.length;
  const sentencesPerParagraph = Math.ceil(totalSentences / 3);

  const paragraphs = [];
  for (let i = 0; i < 3; i++) {
    const start = i * sentencesPerParagraph;
    const end = Math.min(start + sentencesPerParagraph, totalSentences);
    const paragraph = sentences.slice(start, end).join(" ").trim();
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  }

  return paragraphs;
};

const getFilteredVisualAspects = (visualAspects) => {
  // Filter out the summary field from visual aspects
  const filtered = { ...visualAspects };
  delete filtered.summary;
  return filtered;
};

const handleImageError = (event) => {
  console.warn("Failed to load original image, falling back to thumbnail");
  // Could implement fallback logic here
};

const copyNameToClipboard = async () => {
  const name = props.selectedPhoto?.originalFileName || "Untitled";

  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(name);
      message.success("Photo name copied to clipboard");
    } else {
      // Fallback for environments where clipboard API is not available
      fallbackCopyTextToClipboard(name);
    }
  } catch (error) {
    console.warn("Clipboard API failed, trying fallback method:", error);
    fallbackCopyTextToClipboard(name);
  }
};

const fallbackCopyTextToClipboard = (text) => {
  try {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    // Try to copy using the old execCommand method
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      message.success("Photo name copied to clipboard");
    } else {
      message.warning(
        "Unable to copy automatically. Please copy manually: " + text
      );
    }
  } catch (err) {
    console.warn("All copy methods failed:", err);
    message.warning("Copy not supported. Photo name: " + text);
  }
};

const handleDownloadPhoto = () => {
  downloadPhoto(props.selectedPhoto);
};

// Tags management
const addTag = async () => {
  const tagName = newTagName.value.trim();
  if (!tagName) return;

  // Check if tag already exists
  if (photoTags.value.some((tag) => (tag.name || tag) === tagName)) {
    message.warning("Tag already exists");
    return;
  }

  isAddingTag.value = true;

  try {
    // Create new tag object
    const newTag = {
      id: Date.now(), // Temporary ID, would be replaced by backend
      name: tagName,
    };

    photoTags.value.push(newTag);
    newTagName.value = "";

    // Here you would typically save to backend
    // await saveTagsToPhoto(props.selectedPhoto.id, photoTags.value)

    message.success("Tag added successfully");
  } catch (error) {
    photoTags.value.pop(); // Remove the tag if save failed
    message.error("Failed to add tag");
    console.error("Add tag failed:", error);
  } finally {
    isAddingTag.value = false;
  }
};

const removeTag = async (tagToRemove) => {
  const index = photoTags.value.findIndex(
    (tag) =>
      (tag.id && tag.id === tagToRemove.id) ||
      (tag.name || tag) === (tagToRemove.name || tagToRemove)
  );

  if (index === -1) return;

  try {
    photoTags.value.splice(index, 1);

    // Here you would typically save to backend
    // await saveTagsToPhoto(props.selectedPhoto.id, photoTags.value)

    message.success("Tag removed successfully");
  } catch (error) {
    // Restore the tag if removal failed
    photoTags.value.splice(index, 0, tagToRemove);
    message.error("Failed to remove tag");
    console.error("Remove tag failed:", error);
  }
};

// Description generation
const allPhotoInsights = ref([]);
const currentInsightIndex = ref(0);
const hasMoreInsights = computed(
  () =>
    allPhotoInsights.value.length > 0 &&
    currentInsightIndex.value < allPhotoInsights.value.length - 1
);

// Computed property for overall rating - automatically updates when weights change
const overallRating = computed(() => {
  if (!props.selectedPhoto?.descriptions?.artistic_scores) {
    return { average: 0, rating: "N/A", total: 0, count: 0 };
  }

  // Use custom weights if in custom mode, otherwise use the selected genre
  const customWeights =
    selectedGenre.value === "custom" ? artisticScoreWeights.value : null;
  return calculateArtisticScore(
    props.selectedPhoto.descriptions.artistic_scores,
    selectedGenre.value,
    customWeights
  );
});

const getInsight = async () => {
  isGeneratingInsight.value = true;
  try {
    if (!props.selectedPhoto?.id) {
      throw new Error("No photo id available");
    }
    const { data } = await api.get(
      `/api/catalog/photoInsight/${props.selectedPhoto.id}`
    );
    if (
      data &&
      typeof data === "object" &&
      (data.cultural || data.technical || data.evaluation)
    ) {
      // Convert object to array for consistent handling
      const insights = [];
      if (data.cultural) insights.push(data.cultural);
      if (data.technical) insights.push(data.technical);
      if (data.evaluation) insights.push(data.evaluation);

      allPhotoInsights.value = insights;
      currentInsightIndex.value = 0;
      photoInsight.value = insights[0];
    } else {
      allPhotoInsights.value = [];
      currentInsightIndex.value = 0;
      photoInsight.value = "No insights found for this photo.";
      message.warning("No insights found");
    }
  } catch (error) {
    message.error("Failed to generate description");
    photoInsight.value = "Failed to generate description.";
    allPhotoInsights.value = [];
    currentInsightIndex.value = 0;
    console.error("Generate description failed:", error);
  } finally {
    isGeneratingInsight.value = false;
  }
};

const showNextInsight = () => {
  if (hasMoreInsights.value) {
    isGeneratingInsight.value = true;
    setTimeout(() => {
      currentInsightIndex.value++;
      photoInsight.value = allPhotoInsights.value[currentInsightIndex.value];
      isGeneratingInsight.value = false;
    }, 1500);
  }
};

// Function to highlight matching chunks in text
const highlightMatchingChunks = (text) => {
  if (
    !text ||
    !props.selectedPhoto?.matchingChunks ||
    props.selectedPhoto.matchingChunks.length === 0
  ) {
    return text;
  }

  let highlightedText = text;

  // Sort chunks by length (longest first) to avoid partial replacements
  const sortedChunks = [...props.selectedPhoto.matchingChunks]
    .filter((chunkObj) => chunkObj.chunk && chunkObj.chunk.trim().length > 0)
    .sort((a, b) => b.chunk.length - a.chunk.length);

  sortedChunks.forEach((chunkObj) => {
    const { chunk, isFullQuery, proximity } = chunkObj;
    const className = isFullQuery
      ? "highlighted-chunk-full"
      : "highlighted-chunk";

    // Format proximity for display
    const proximityText = proximity
      ? `Proximity: ${proximity.toFixed(2)}`
      : "No proximity data";
    const queryType = isFullQuery ? " (Full Query)" : " (Partial Query)";
    const tooltipText = proximityText + queryType;

    // Create a case-insensitive regex to find the chunk
    const regex = new RegExp(
      `(${chunk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    highlightedText = highlightedText.replace(
      regex,
      `<span class="${className}" title="${tooltipText}">$1</span>`
    );
  });

  return highlightedText;
};

// Notes management
const saveNotes = async () => {
  isSavingNotes.value = true;

  try {
    // Here you would typically save to backend
    // await saveNotesToPhoto(props.selectedPhoto.id, photoNotes.value)

    message.success("Notes saved successfully");
  } catch (error) {
    message.error("Failed to save notes");
    console.error("Save notes failed:", error);
  } finally {
    isSavingNotes.value = false;
  }
};

// Handle ResizeObserver errors gracefully
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    if (e.message && e.message.includes("ResizeObserver loop limit exceeded")) {
      e.stopImmediatePropagation();
    }
  });
}
</script>

<style scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.photo-name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
}

.photo-display {
  width: 100%;
  height: 400px;
  min-height: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--spacing-md);
  flex-shrink: 0;
}

.main-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  background-color: transparent;
}

.info-sections {
  flex: 1;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-xs);
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.metadata-item .label {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.metadata-item .value {
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.photo-tag {
  margin: 0;
  /* background-color: var(--secondary-color) !important;
  color: var(--text-primary) !important; */
}

.add-tag-section {
  max-width: 300px;
}

.descriptions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.section-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
}

.ai-descriptions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.description-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.description-label {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-description-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.generate-section {
  text-align: center;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 2px dashed var(--border-color);
}

.generating-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}

.generating-text {
  margin: 0;
  color: var(--text-secondary);
}

.description-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.description-content {
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.description-content p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.review-paragraph {
  margin-bottom: var(--spacing-md) !important;
  text-align: justify;
}

.review-paragraph:last-child {
  margin-bottom: 0 !important;
}

.visual-aspects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.visual-aspect-category {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.aspect-category-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: capitalize;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-xs);
}

.aspect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.aspect-tag {
  font-size: var(--font-size-xs);
}

.visual-aspects-section {
  padding: var(--spacing-md);
}

.visual-aspects-summary {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.summary-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-content {
  margin: 0;
}

.summary-content p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.overall-rating-container {
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
  border-top: 2px solid var(--primary-color);
}

.overall-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.overall-label {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.overall-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.overall-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.overall-rating-text {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rating-disastrous {
  background: #7f1d1d;
  color: white;
}

.rating-very-poor {
  background: #b91c1c;
  color: white;
}

.rating-poor {
  background: #ef4444;
  color: white;
}

.rating-needs-improvement {
  background: #f87171;
  color: white;
}

.rating-acceptable {
  background: #f59e0b;
  color: white;
}

.rating-good {
  background: #10b981;
  color: white;
}

.rating-very-good {
  background: #22d3ee;
  color: white;
}

.rating-remarkable {
  background: #3b82f6;
  color: white;
}

.rating-excellent {
  background: #6366f1;
  color: white;
}

.rating-outstanding {
  background: #7c3aed;
  color: white;
}

.genre-presets-container {
  margin-bottom: var(--spacing-md);

  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--accent-color, #8b5cf6);
  border: 1px solid var(--border-color);
}

.genre-header {
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.genre-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.genre-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.genre-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.genre-button {
  min-width: 120px;
  transition: all 0.3s ease;
  position: relative;
}

.genre-button:hover {
  transform: translateY(-2px);
}

.custom-button {
  background: var(--bg-card) !important;
  border: 2px dashed var(--border-color) !important;
}

.weights-configuration-container {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--secondary-color);
  border: 1px solid var(--border-color);
}

.weights-header {
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.weights-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.artistic-scores-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-color);
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  transition: all 0.3s ease;
  position: relative;
}

.score-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: calc(
    var(--weight-scale, 0) * (140px + var(--spacing-sm))
  ); /* Dynamic width based on weight */
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-color) 0%,
    rgba(59, 130, 246, 0.4) 80%,
    rgba(59, 130, 246, 0.1) 100%
  );
  border-radius: var(--radius-sm);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.25;
  z-index: 0;
}

.score-item.bonus-item::before {
  background: linear-gradient(
    90deg,
    #f59e0b 0%,
    rgba(245, 158, 11, 0.4) 80%,
    rgba(245, 158, 11, 0.1) 100%
  );
}

.score-item:hover::before {
  opacity: 0.4;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.score-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  min-width: 140px;
  flex-shrink: 0;
  padding: var(--spacing-xs) var(--spacing-sm);
  position: relative;
  z-index: 1;
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
}

/* .score-label::after {
  content: attr(data-weight);
  position: absolute;
  right: -25px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--text-tertiary);
  background: var(--bg-card);
  padding: 1px 4px;
  border-radius: 3px;
  font-family: var(--font-mono);
  opacity: var(--weight-opacity, 0.7);
  transition: opacity 0.3s ease;
} */

.score-bar-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.score-bar {
  flex: 1;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.score-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease, opacity 0.3s ease;
  position: relative;
  z-index: 1;
}

.score-fill.score-disastrous {
  background: linear-gradient(90deg, #7f1d1d, #991b1b);
}

.score-fill.score-needs-improvement {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.score-fill.score-acceptable {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.score-fill.score-good {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.score-fill.score-remarkable {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.score-fill.score-outstanding {
  background: linear-gradient(90deg, #7c3aed, #a855f7);
}

.score-value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  gap: 1px;
}

.score-number {
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
}

.max-score {
  color: var(--text-secondary);
}

.regenerate-btn {
  align-self: flex-start;
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notes-actions {
  display: flex;
  justify-content: flex-end;
}

/* Highlighted chunks styling */
:deep(.highlighted-chunk) {
  background-color: rgba(255, 193, 7, 0.3);
  border-radius: 4px;
  padding: 2px 4px;
  font-weight: 500;
  border: 1px solid rgba(255, 193, 7, 0.5);
  cursor: help;
  transition: all 0.2s ease;
}

:deep(.highlighted-chunk:hover) {
  background-color: rgba(255, 193, 7, 0.5);
  border-color: rgba(255, 193, 7, 0.8);
  transform: translateY(-1px);
}

:deep(.highlighted-chunk-full) {
  background-color: rgba(40, 167, 69, 0.3);
  border-radius: 4px;
  padding: 2px 4px;
  font-weight: 600;
  border: 1px solid rgba(40, 167, 69, 0.5);
  color: #1e7e34;
  cursor: help;
  transition: all 0.2s ease;
}

:deep(.highlighted-chunk-full:hover) {
  background-color: rgba(40, 167, 69, 0.5);
  border-color: rgba(40, 167, 69, 0.8);
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dialog-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .photo-name {
    text-align: center;
    white-space: normal;
  }

  .header-actions {
    justify-content: center;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
  }

  .metadata-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .add-tag-section {
    max-width: 100%;
  }

  .overall-rating {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    text-align: center;
  }

  .overall-score {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .genre-buttons {
    flex-direction: column;
    align-items: center;
  }

  .genre-button {
    min-width: 200px;
    width: 100%;
    max-width: 250px;
  }

  .score-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }

  .score-label {
    min-width: auto;
    text-align: center;
    font-size: var(--font-size-xs);
  }

  .score-bar-container {
    justify-content: center;
  }

  .score-value {
    min-width: auto;
    text-align: center;
  }
}

/* Custom tooltip styling */
:deep(.n-tooltip__content) {
  background-color: #1a1a1f !important;
  border: 1px solid #2c2c32 !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
  max-width: 280px !important;
  padding: 12px !important;
}
</style>
