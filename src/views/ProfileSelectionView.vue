<template>
  <AuthLayout>
    <div class="profile-selection-content">
      <div class="profile-header">
        <h1 class="profile-title">What is your preferred style?</h1>
        <p class="profile-subtitle">Help us customize your Trova experience</p>
      </div>

      <!-- Main Style Categories -->
      <div class="main-categories">
        <h3 class="section-title">Choose up to 2 main styles</h3>
        <div class="categories-grid">
          <div
            class="category-card"
            :class="{
              selected: selectedCategories.includes('street'),
              disabled:
                selectedCategories.length >= 2 &&
                !selectedCategories.includes('street'),
            }"
            @click="toggleCategory('street')"
          >
            <div class="category-icon">
              <n-icon size="32">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M14.12 4L12 2L9.88 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-5.88zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3s3-1.35 3-3s-1.35-3-3-3z"
                  />
                </svg>
              </n-icon>
            </div>
            <h4 class="category-title">Street Photography</h4>
            <p class="category-description">
              Capture life as it happens in urban environments
            </p>
          </div>

          <div
            class="category-card"
            :class="{
              selected: selectedCategories.includes('documentary'),
              disabled:
                selectedCategories.length >= 2 &&
                !selectedCategories.includes('documentary'),
            }"
            @click="toggleCategory('documentary')"
          >
            <div class="category-icon">
              <n-icon size="32">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                  />
                </svg>
              </n-icon>
            </div>
            <h4 class="category-title">Documentary Photography</h4>
            <p class="category-description">
              Tell stories and document real-world events
            </p>
          </div>

          <div
            class="category-card"
            :class="{
              selected: selectedCategories.includes('artistic'),
              disabled:
                selectedCategories.length >= 2 &&
                !selectedCategories.includes('artistic'),
            }"
            @click="toggleCategory('artistic')"
          >
            <div class="category-icon">
              <n-icon size="32">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14l-5-4.87l6.91-1.01L12 2z"
                  />
                </svg>
              </n-icon>
            </div>
            <h4 class="category-title">Artistic Photography</h4>
            <p class="category-description">
              Create expressive and creative visual art
            </p>
          </div>
        </div>
      </div>

      <!-- Detailed Tags -->
      <div class="detailed-tags">
        <h3 class="section-title">Or select specific interests</h3>
        <p class="section-subtitle">
          Choose tags that best describe your photography interests
        </p>

        <div class="tags-sections">
          <!-- Street Photography Tags -->
          <div class="tag-category">
            <h4 class="tag-category-title">
              <n-icon size="18" class="category-title-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M14.12 4L12 2L9.88 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-5.88z"
                  />
                </svg>
              </n-icon>
              Street Photography
            </h4>
            <div class="tags-grid">
              <n-tag
                v-for="tag in streetTags"
                :key="tag"
                :type="selectedTags.includes(tag) ? 'primary' : 'default'"
                :bordered="false"
                checkable
                :checked="selectedTags.includes(tag)"
                @update:checked="toggleTag(tag)"
                class="custom-tag"
              >
                {{ tag }}
              </n-tag>
            </div>
          </div>

          <!-- Documentary Photography Tags -->
          <div class="tag-category">
            <h4 class="tag-category-title">
              <n-icon size="18" class="category-title-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                  />
                </svg>
              </n-icon>
              Documentary Photography
            </h4>
            <div class="tags-grid">
              <n-tag
                v-for="tag in documentaryTags"
                :key="tag"
                :type="selectedTags.includes(tag) ? 'primary' : 'default'"
                :bordered="false"
                checkable
                :checked="selectedTags.includes(tag)"
                @update:checked="toggleTag(tag)"
                class="custom-tag"
              >
                {{ tag }}
              </n-tag>
            </div>
          </div>

          <!-- Artistic Photography Tags -->
          <div class="tag-category">
            <h4 class="tag-category-title">
              <n-icon size="18" class="category-title-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22L12 18.77L5.82 22L7 14.14l-5-4.87l6.91-1.01L12 2z"
                  />
                </svg>
              </n-icon>
              Artistic Photography
            </h4>
            <div class="tags-grid">
              <n-tag
                v-for="tag in artisticTags"
                :key="tag"
                :type="selectedTags.includes(tag) ? 'primary' : 'default'"
                :bordered="false"
                checkable
                :checked="selectedTags.includes(tag)"
                @update:checked="toggleTag(tag)"
                class="custom-tag"
              >
                {{ tag }}
              </n-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="profile-actions">
        <n-button
          type="primary"
          size="large"
          :disabled="
            selectedCategories.length === 0 && selectedTags.length === 0
          "
          @click="completeProfile"
          class="complete-button"
        >
          Complete Setup
        </n-button>
        <n-button text size="medium" @click="skipProfile" class="skip-button">
          Skip for now
        </n-button>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import AuthLayout from "../components/AuthLayout.vue";

const router = useRouter();
const message = useMessage();

const selectedCategories = ref<string[]>([]);
const selectedTags = ref<string[]>([]);

// Tag data
const streetTags = [
  "Street Portraits",
  "Urban Architecture",
  "Funny Street Scenes",
  "Night Street Photography",
  "Street Art & Graffiti",
  "Market Scenes",
  "Transportation",
  "Urban Wildlife",
  "Street Fashion",
  "City Life",
  "Public Spaces",
  "Street Events",
];

const documentaryTags = [
  "Social Issues",
  "Cultural Events",
  "Historical Documentation",
  "Environmental Stories",
  "Community Life",
  "Political Events",
  "Human Rights",
  "Economic Conditions",
  "Daily Life",
  "Traditional Crafts",
  "Migration Stories",
  "Urban Development",
];

const artisticTags = [
  "Abstract Images",
  "Geometric Photography",
  "Minimalist Composition",
  "Light & Shadow",
  "Color Theory",
  "Conceptual Art",
  "Surreal Photography",
  "Fine Art Portraits",
  "Experimental Techniques",
  "Pattern & Texture",
  "Emotional Expression",
  "Visual Metaphors",
];

const toggleCategory = (category: string) => {
  const index = selectedCategories.value.indexOf(category);

  if (index > -1) {
    // Remove if already selected
    selectedCategories.value.splice(index, 1);
  } else {
    // Add if not selected and under limit
    if (selectedCategories.value.length < 2) {
      selectedCategories.value.push(category);
    }
  }
};

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);

  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
};

const completeProfile = () => {
  // TODO: Save profile preferences to store/backend
  console.log("Selected Categories:", selectedCategories.value);
  console.log("Selected Tags:", selectedTags.value);

  message.success("Profile setup completed! Welcome to Trova.");
  router.push("/dashboard");
};

const skipProfile = () => {
  message.info("You can set up your profile later in settings");
  router.push("/dashboard");
};
</script>

<style scoped>
.profile-selection-content {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 32px;
}

.profile-title {
  margin: 16px 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #ffffffd1;
  letter-spacing: -0.025em;
}

.profile-subtitle {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #ffffff73;
  font-weight: 400;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffffd1;
}

.section-subtitle {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #ffffff73;
  font-weight: 400;
}

/* Main Categories */
.main-categories {
  margin-bottom: 40px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.category-card {
  background-color: #2c2c32;
  border: 2px solid #3c3c42;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.category-card:hover:not(.disabled) {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
}

.category-card.selected {
  border-color: #2563eb;
  background-color: rgba(37, 99, 235, 0.1);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

.category-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.category-icon {
  margin-bottom: 12px;
  color: #ffffffd1;
}

.category-card.selected .category-icon {
  color: #2563eb;
}

.category-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffffd1;
}

.category-description {
  margin: 0;
  font-size: 13px;
  color: #ffffff73;
  line-height: 1.4;
}

/* Detailed Tags */
.detailed-tags {
  margin-bottom: 32px;
}

.tags-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tag-category {
  background-color: rgba(44, 44, 50, 0.3);
  border-radius: 8px;
  padding: 20px;
}

.tag-category-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffffd1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-title-icon {
  color: #ffffff73;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  font-size: 13px;
}

.custom-tag:hover {
  transform: translateY(-1px);
}

/* Actions */
.profile-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
}

.complete-button {
  width: 200px;
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.skip-button {
  font-size: 14px;
  color: #ffffff73;
}

/* Responsive design */
@media (max-width: 768px) {
  .profile-title {
    font-size: 28px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .category-card {
    min-height: 120px;
    padding: 20px;
  }

  .tags-sections {
    gap: 20px;
  }

  .tag-category {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .profile-title {
    font-size: 24px;
  }

  .category-card {
    min-height: 100px;
    padding: 16px;
  }

  .category-title {
    font-size: 14px;
  }

  .category-description {
    font-size: 12px;
  }
}
</style>
