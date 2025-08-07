<template>
  <div ref="scrollContainer" class="search-container view-container">
    <!-- Search Toolbar -->
    <div class="search-toolbar" :class="{ 'is-collapsed': isToolbarCollapsed }">
      <!-- Search Type and Mode Selector -->
      <div class="search-selector-section">
        <!-- Search Type -->
        <div class="selector-group">
          <div class="selector-label">Search Type:</div>
          <div class="type-pills">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <div
                  class="type-pill"
                  :class="{ active: activeSearchType === 'semantic' }"
                  @click="!isSearching && setSearchType('semantic')"
                  :aria-disabled="isSearching"
                  :tabindex="isSearching ? -1 : 0"
                  :style="
                    isSearching ? 'pointer-events: none; opacity: 0.5;' : ''
                  "
                >
                  <n-icon size="14" class="type-icon">
                    <DocumentOutline />
                  </n-icon>
                  Natural Language
                </div>
              </template>
              Search using natural language descriptions like "sunset beach
              photos with people"
            </n-tooltip>
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <div
                  class="type-pill"
                  :class="{ active: activeSearchType === 'tags' }"
                  @click="!isSearching && setSearchType('tags')"
                  :aria-disabled="isSearching"
                  :tabindex="isSearching ? -1 : 0"
                  :style="
                    isSearching ? 'pointer-events: none; opacity: 0.5;' : ''
                  "
                >
                  <n-icon size="16" class="type-icon">
                    <TagOutlined />
                  </n-icon>
                  Tags
                </div>
              </template>
              Search by specific tags and keywords assigned to your photos
            </n-tooltip>
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <div
                  class="type-pill"
                  :class="{ active: activeSearchType === 'topological' }"
                  @click="!isSearching && setSearchType('topological')"
                  :aria-disabled="isSearching"
                  :tabindex="isSearching ? -1 : 0"
                  :style="
                    isSearching ? 'pointer-events: none; opacity: 0.5;' : ''
                  "
                >
                  <n-icon size="16" class="type-icon">
                    <MapOutline />
                  </n-icon>
                  Spatial
                </div>
              </template>
              Search based on spatial arrangement of objects in your photos
              (left, center, right)
            </n-tooltip>
          </div>
        </div>

        <!-- Search Mode -->
        <div class="selector-group">
          <div class="selector-label">Search Mode:</div>
          <div class="mode-pills">
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <div
                  class="mode-pill premium-pill"
                  :class="{ active: searchMode === 'logical' }"
                  @click="!isSearching && (searchMode = 'logical')"
                  :aria-disabled="isSearching"
                  :tabindex="isSearching ? -1 : 0"
                  :style="
                    isSearching ? 'pointer-events: none; opacity: 0.5;' : ''
                  "
                >
                  <n-icon size="14" class="mode-icon">
                    <CheckOutlined />
                  </n-icon>
                  Strict
                  <div class="premium-indicator-pill"></div>
                </div>
              </template>
              Heavy search that prioritizes logical accuracy
            </n-tooltip>
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <div
                  class="mode-pill premium-pill"
                  :class="{ active: searchMode === 'flexible' }"
                  @click="!isSearching && (searchMode = 'flexible')"
                  :aria-disabled="isSearching"
                  :tabindex="isSearching ? -1 : 0"
                  :style="
                    isSearching ? 'pointer-events: none; opacity: 0.5;' : ''
                  "
                >
                  <n-icon size="16" class="mode-icon">
                    <PencilOutline />
                  </n-icon>
                  Flexible
                  <div class="premium-indicator-pill"></div>
                </div>
              </template>
              Adaptive search that finds similar and indirect associations
            </n-tooltip>
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <div
                  class="mode-pill"
                  :class="{ active: searchMode === 'low_precision' }"
                  @click="!isSearching && (searchMode = 'low_precision')"
                  :aria-disabled="isSearching"
                  :tabindex="isSearching ? -1 : 0"
                  :style="
                    isSearching ? 'pointer-events: none; opacity: 0.5;' : ''
                  "
                >
                  <n-icon size="16" class="mode-icon">
                    <PencilOutline />
                  </n-icon>
                  Fast
                </div>
              </template>
              Shallow search with basic matching for faster results
            </n-tooltip>
          </div>
        </div>
      </div>

      <!-- Search Filters Section -->
      <div class="search-filters-section">
        <!-- More Filters Toggle -->
        <div
          class="more-filters-toggle"
          @click="showMoreFilters = !showMoreFilters"
        >
          <div class="more-filters-content">
            <span class="more-filters-label">More filters</span>
            <div class="more-filters-status">
              <span v-if="hasActiveFilters" class="active-filters-indicator">
                {{ selectedCollections.length + selectedVisualAspects.length }}
                active
              </span>
              <n-icon
                size="14"
                class="toggle-icon"
                :class="{ rotated: showMoreFilters }"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"
                  />
                </svg>
              </n-icon>
            </div>
          </div>
        </div>

        <!-- Collapsible Filters Container -->
        <div v-if="showMoreFilters" class="filters-container">
          <div class="filters-inline-container">
            <!-- Collections Filter -->
            <div class="filter-inline-group">
              <span class="filter-inline-label">Collections:</span>
              <n-select
                v-model:value="selectedCollections"
                multiple
                clearable
                placeholder="Any collection"
                :options="collectionsOptions"
                :max-tag-count="2"
                class="filter-inline-select collections-select"
                :loading="collectionsStore.isLoading"
                :disabled="isSearching"
                size="small"
              >
                <template #empty>
                  <div style="padding: 8px; color: #888; font-size: 12px">
                    No collections found
                  </div>
                </template>
              </n-select>
              <span
                v-if="selectedCollections.length > 0"
                class="filter-inline-count"
              >
                {{ selectedCollections.length }}
              </span>
            </div>

            <!-- Visual Aspects Filter -->
            <div class="filter-inline-group">
              <span class="filter-inline-label">Visual aspects:</span>
              <n-select
                v-model:value="selectedVisualAspects"
                multiple
                clearable
                placeholder="Any aspect"
                :options="visualAspectsOptions"
                :max-tag-count="2"
                class="filter-inline-select"
                :disabled="isSearching"
                size="small"
              >
                <template #empty>
                  <div style="padding: 8px; color: #888; font-size: 12px">
                    No visual aspects found
                  </div>
                </template>
              </n-select>
              <span
                v-if="selectedVisualAspects.length > 0"
                class="filter-inline-count"
              >
                {{ selectedVisualAspects.length }}
              </span>
            </div>
          </div>

          <!-- Clear All Filters Button -->
          <!-- <div v-if="hasActiveFilters" class="clear-filters-container">
            <n-button
              size="small"
              text
              @click="clearAllFilters"
              class="clear-filters-button"
            >
              Clear all filters
            </n-button>
          </div> -->
        </div>
      </div>

      <!-- Conditional Search Content -->
      <div class="search-content">
        <!-- Semantic Language Search -->
        <div
          v-if="activeSearchType === 'semantic'"
          key="semantic-search"
          class="semantic-search-section"
        >
          <div class="search-input-row">
            <n-input
              v-model:value="semanticQuery"
              type="textarea"
              placeholder="Describe what you're looking for... e.g., 'sunset photos with people on the beach' or 'close-up portraits with red background'"
              :autosize="{ minRows: 1, maxRows: 2 }"
              class="semantic-input"
              @input="onSearchChange"
              :key="`semantic-${activeSearchType}`"
            />

            <div class="search-actions-inline">
              <n-button
                type="primary"
                :loading="isSearching"
                :disabled="!hasSearchQuery"
                @click="performSearch"
                class="search-button"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Search Photos
              </n-button>
              <n-button
                secondary
                @click="clearSearch"
                :disabled="!hasSearchQuery"
                class="clear-button icon-only"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </div>
            <div
              v-if="photoStore.processedPhotos.length < 100"
              class="usage-limit-warning"
            >
              <WarningBadge
                message="Search on a few photos"
                tooltip="You have fewer than 100 photos processed. Searches may return irrelevant results."
              />
            </div>
            <!-- Usage Limit Warning Badge -->
            <!-- <div
              v-else-if="
                userStore.usageLimits.search.exceeded &&
                !userStore.usageLimits.search.dismissed
              "
              class="usage-limit-warning"
            >
              <WarningBadge
                message="Low performance"
                :tooltip="performanceTooltip"
                :closable="true"
                @close="userStore.dismissUsageWarning('search')"
              />
            </div> -->
          </div>
        </div>

        <!-- Tags Search -->
        <div
          v-else-if="activeSearchType === 'tags'"
          key="tags-search"
          class="tags-search-section"
        >
          <div class="tags-input-row">
            <div class="tags-row">
              <div class="tags-group">
                <n-select
                  ref="tagIncSelect"
                  :value="includedTags"
                  @update:value="handleIncludedTagsChange"
                  multiple
                  filterable
                  clearable
                  tag
                  placeholder="Add tags to include..."
                  :options="includedTagSuggestionsFormatted"
                  :clear-filter-after-select="true"
                  :max-tag-count="5"
                  class="tags-select include-tags"
                  @search="onSearchInputIncluded"
                >
                  <template #empty>
                    <div style="padding: 8px; color: #888">
                      Start typing to search tags...
                    </div>
                  </template></n-select
                >
              </div>
              <div class="tags-group">
                <n-select
                  ref="tagExcSelect"
                  :value="excludedTags"
                  @update:value="handleExcludedTagsChange"
                  multiple
                  filterable
                  clearable
                  tag
                  placeholder="Add tags to exclude..."
                  :options="excludedTagSuggestionsFormatted"
                  :max-tag-count="5"
                  class="tags-select exclude-tags"
                  @search="onSearchInputExcluded"
                >
                  <template #empty>
                    <div style="padding: 8px; color: #888">
                      Start typing to search tags...
                    </div>
                  </template></n-select
                >
              </div>
            </div>

            <div class="search-actions-inline">
              <n-button
                type="primary"
                :loading="isSearching"
                :disabled="!hasSearchQuery"
                @click="performSearch"
                class="search-button"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Search Photos
              </n-button>
              <n-button
                secondary
                @click="clearSearch"
                :disabled="!hasSearchQuery"
                class="clear-button icon-only"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </div>
            <!-- Usage Limit Warning Badge -->
            <div
              v-if="
                userStore.usageLimits.search.exceeded &&
                !userStore.usageLimits.search.dismissed
              "
              class="usage-limit-warning"
            >
              <div class="warning-badge">
                <n-icon size="14" class="warning-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M1 21h22L12 2L1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                    />
                  </svg>
                </n-icon>
                <span class="warning-text">Low performance</span>
                <n-tooltip trigger="hover" placement="top">
                  <template #trigger>
                    <n-icon size="12" class="info-icon">
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                  {{ performanceTooltip }}
                </n-tooltip>
                <button
                  @click="userStore.dismissUsageWarning('search')"
                  class="close-badge-btn"
                >
                  <n-icon size="12">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                      />
                    </svg>
                  </n-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Topological Search -->
        <div
          v-else-if="activeSearchType === 'topological'"
          key="topological-search"
          class="topological-search-section"
        >
          <div class="topological-input-row">
            <div class="topological-grid">
              <div class="topological-area">
                <n-input
                  :value="topological.left"
                  @input="updateTopologicalLeft"
                  type="textarea"
                  placeholder="Left side objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="topological-input"
                  :key="`topological-left-${activeSearchType}`"
                />
              </div>
              <div class="topological-area">
                <n-input
                  :value="topological.center"
                  @input="updateTopologicalCenter"
                  type="textarea"
                  placeholder="Center objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="topological-input center-input"
                  :key="`topological-center-${activeSearchType}`"
                />
              </div>
              <div class="topological-area">
                <n-input
                  :value="topological.right"
                  @input="updateTopologicalRight"
                  type="textarea"
                  placeholder="Right side objects..."
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  class="topological-input"
                  :key="`topological-right-${activeSearchType}`"
                />
              </div>
            </div>

            <div class="search-actions-inline">
              <n-button
                type="primary"
                :loading="isSearching"
                :disabled="!hasSearchQuery"
                @click="performSearch"
                class="search-button"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Search Photos
              </n-button>
              <n-button
                secondary
                @click="clearSearch"
                :disabled="!hasSearchQuery"
                class="clear-button icon-only"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                      />
                    </svg>
                  </n-icon>
                </template>
              </n-button>
            </div>
            <!-- Usage Limit Warning Badge -->
            <div
              v-if="
                userStore.usageLimits.search.exceeded &&
                !userStore.usageLimits.search.dismissed
              "
              class="usage-limit-warning"
            >
              <div class="warning-badge">
                <n-icon size="14" class="warning-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M1 21h22L12 2L1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                    />
                  </svg>
                </n-icon>
                <span class="warning-text">Low performance</span>
                <n-tooltip trigger="hover" placement="top">
                  <template #trigger>
                    <n-icon size="12" class="info-icon">
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                        />
                      </svg>
                    </n-icon>
                  </template>
                  {{ performanceTooltip }}
                </n-tooltip>
                <button
                  @click="userStore.dismissUsageWarning('search')"
                  class="close-badge-btn"
                >
                  <n-icon size="12">
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
                      />
                    </svg>
                  </n-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results / Empty State -->
    <div class="search-results-container">
      <div
        v-if="!hasSearchQuery && !isSearching && !searchStore.hasSearched"
        class="search-inspiration"
      >
        <div class="inspiration-content">
          <n-icon size="64" color="#6b7280" class="inspiration-icon">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14S14 11.99 14 9.5S11.99 5 9.5 5Z"
              />
            </svg>
          </n-icon>

          <div class="search-examples">
            <h3 class="examples-title">Try something like...</h3>

            <!-- Carousel Container -->
            <div class="examples-carousel">
              <div class="carousel-container">
                <div
                  class="example-card carousel-item"
                  :class="{ sliding: isSliding }"
                  @click="handleExampleClick"
                >
                  <div class="example-text">{{ currentExampleText }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isSearching" class="search-loading">
        <!-- Search Loading Message -->
        <div class="loading-message">
          <n-spin size="large" />
          <p class="loading-text">Searching through your photos...</p>
        </div>

        <!-- Skeleton Grid -->
        <div
          class="photo-grid photo-grid-base"
          :class="`grid-cols-${gridColumns}`"
        >
          <div
            v-for="n in skeletonCount"
            :key="`search-skeleton-${n}`"
            class="photo-skeleton"
          >
            <n-skeleton height="100%" />
          </div>
        </div>
      </div>

      <div v-else class="search-results">
        <!-- Grid Controls -->
        <div class="grid-controls grid-controls-base">
          <div class="controls-left">
            <div class="results-info results-info-base">
              <span class="results-count results-count-base">
                {{ filteredSearchResults.length }} photos found
                <span v-if="minStarRating > 0" class="filter-applied">
                  ({{ filteredSearchResults.length }} of
                  {{ searchResults.length }} with {{ minStarRating }}+ stars)
                </span>
                <span v-if="hasActiveFilters" class="filter-applied">
                  {{ filterSummaryText }}
                </span>
              </span>
            </div>
            <!-- Action buttons (show when photos are selected) -->
            <div v-if="localSelectedPhotoIds.length > 0" class="action-buttons">
              <n-button
                type="info"
                size="small"
                @click="handleAddToCollection"
                :disabled="localSelectedPhotoIds.length === 0"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M17 14H19V17H22V19H19V22H17V19H14V17H17V14M12 18H6V16H12V18M12 14H6V12H12V14M16 10H6V8H16V10M20 6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H13.35C13.13 21.37 13 20.7 13 20C13 16.69 15.69 14 19 14C19.34 14 19.67 14.03 20 14.08V8C20 6.9 19.1 6 18 6H20Z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Add to Collection ({{ localSelectedPhotoIds.length }})
              </n-button>
              <n-button
                type="info"
                size="small"
                @click="moveToCanvas"
                :disabled="localSelectedPhotoIds.length === 0"
              >
                <template #icon>
                  <n-icon>
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M17 14H19V17H22V19H19V22H17V19H14V17H17V14M12 18H6V16H12V18M12 14H6V12H12V14M16 10H6V8H16V10M20 6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H13.35C13.13 21.37 13 20.7 13 20C13 16.69 15.69 14 19 14C19.34 14 19.67 14.03 20 14.08V8C20 6.9 19.1 6 18 6H20Z"
                      />
                    </svg>
                  </n-icon>
                </template>
                Take to Canvas ({{ localSelectedPhotoIds.length }})
              </n-button>
            </div>
          </div>

          <div class="controls-right">
            <!-- Star Filter -->
            <div class="star-filter">
              <span class="filter-label">Min. Rating:</span>
              <div class="star-buttons">
                <n-rate
                  v-model:value="minStarRating"
                  :readonly="isSearching || isLoadingMore"
                  :count="3"
                  size="small"
                  clearable
                  @update:value="onStarFilterChange"
                  class="star-rating"
                  :allow-half="false"
                />
              </div>
            </div>

            <div class="grid-size-controls grid-size-controls-base">
              <span class="grid-label grid-label-base">Columns:</span>
              <n-button-group>
                <n-button
                  v-for="size in [3, 4, 5, 6]"
                  :key="size"
                  :type="gridColumns === size ? 'primary' : 'default'"
                  size="small"
                  @click="setGridColumns(size)"
                >
                  {{ size }}
                </n-button>
              </n-button-group>
            </div>
          </div>
        </div>

        <!-- Photo Grid -->
        <div
          class="photo-grid photo-grid-base"
          :class="`grid-cols-${gridColumns}`"
        >
          <!-- Photo Cards -->
          <PhotoCard
            v-for="photo in filteredSearchResults"
            :key="photo.id"
            :photo="photo"
            :computed-stars="photo.computedStars"
            :show-low-relevance-icon="photo.showLowRelevanceIcon"
            :selected="localSelectedPhotoIds.includes(photo.id)"
            @select="togglePhotoSelection"
            @info="showPhotoInfo"
          />

          <!-- Skeleton Loading for Load More -->
          <template v-if="isLoadingMore">
            <div
              v-for="n in pageSize"
              :key="`skeleton-${n}`"
              class="photo-skeleton"
            >
              <n-skeleton height="100%" />
            </div>
          </template>
        </div>

        <!-- Load More Button -->
        <div class="load-more-container" v-if="hasMoreIterations">
          <n-button
            size="large"
            :loading="isLoadingMore"
            @click="loadMorePhotos"
            class="load-more-button"
          >
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  />
                </svg>
              </n-icon>
            </template>
            Load More Photos
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Nombre del componente
defineOptions({ name: "SearchPage" });

// Imports básicos
import {
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from "vue";
import { api } from "@/utils/axios";
import { io } from "socket.io-client";
import { NTooltip, NRate } from "naive-ui";

// Componentes e íconos
import PhotoCard from "@/components/photoCards/PhotoCard.vue";
import WarningBadge from "@/components/WarningBadge.vue";

// Composable de tags y ejemplos
import { useSearchTags } from "@/composables/useSearchTags";
import { useLocalPhotoSelection } from "@/composables/useLocalPhotoSelection";
import { useQueryExamples } from "@/composables/useQueryExamples";
import queryExamples from "@/assets/query_examples.json";
import { DocumentOutline, MapOutline, PencilOutline } from "@vicons/ionicons5";
import { CheckOutlined, TagOutlined } from "@vicons/antd";
import { usePhotosStore } from "@/stores/photos";
import { useCanvasStore } from "@/stores/canvas.js";
import { useUserStore } from "@/stores/userStore";
import { useSearchStore } from "@/stores/searchStore";
import { useCollectionsStore } from "@/stores/collections";
import { useRouter } from "vue-router";
import { usePhotoScored } from "@/composables/usePhotoScored";

// Conexión real-time para resultados incrementales
const socket = io(import.meta.env.VITE_API_WS_URL);

const photoStore = usePhotosStore();
const canvasStore = useCanvasStore();
const userStore = useUserStore();
const searchStore = useSearchStore();
const collectionsStore = useCollectionsStore();
const router = useRouter();

// Photo scoring utilities
const { computePhotoStars, shouldShowLowRelevanceIcon } = usePhotoScored();

// Estado local de selección de fotos (independiente del store global)
const {
  selectedPhotosRecord: localSelectedPhotosRecord,
  selectedPhotoIds: localSelectedPhotoIds,
  togglePhotoSelection: localTogglePhotoSelection,
  clearAllSelections: localClearAllSelections,
} = useLocalPhotoSelection();

// Estado del toolbar colapsable
const isToolbarCollapsed = ref(false);
const lastScrollY = ref(0);

// Usar el store para el estado de búsqueda
const activeSearchType = computed({
  get: () => searchStore.activeSearchType,
  set: (value) => searchStore.setSearchType(value),
});

const searchMode = computed({
  get: () => searchStore.searchMode,
  set: (value) => searchStore.setSearchMode(value),
});

const isSearching = computed(() => searchStore.isSearching);
const isLoadingMore = computed(() => searchStore.isLoadingMore);
const searchResults = computed(() => searchStore.searchResults);
const hasSearchQuery = computed(() => searchStore.hasSearchQuery);
const hasMoreIterations = computed(
  () => searchStore.currentSearchState.hasMoreIterations
);

// Computed properties for photos with pre-computed stars and filtering
const photosWithComputedStars = computed(() => {
  return searchResults.value.map((photo) => ({
    ...photo,
    computedStars: computePhotoStars(photo),
    showLowRelevanceIcon: shouldShowLowRelevanceIcon(photo),
  }));
});

const filteredSearchResults = computed(() => {
  if (minStarRating.value === 0) {
    return photosWithComputedStars.value;
  }
  return photosWithComputedStars.value.filter(
    (photo) => photo.computedStars >= minStarRating.value
  );
});

// Computed para acceder a los valores específicos de cada tipo de búsqueda
const semanticQuery = computed({
  get: () => searchStore.searchStates.semantic.query,
  set: (value) => searchStore.updateSemanticQuery(value),
});

const includedTags = computed({
  get: () => searchStore.searchStates.tags.includedTags,
  set: (value) =>
    searchStore.updateTagsSearch(
      value,
      searchStore.searchStates.tags.excludedTags
    ),
});

const excludedTags = computed({
  get: () => searchStore.searchStates.tags.excludedTags,
  set: (value) =>
    searchStore.updateTagsSearch(
      searchStore.searchStates.tags.includedTags,
      value
    ),
});

const topological = computed({
  get: () => ({
    left: searchStore.searchStates.topological.left,
    center: searchStore.searchStates.topological.center,
    right: searchStore.searchStates.topological.right,
  }),
  set: (value) =>
    searchStore.updateTopologicalSearch(value.left, value.center, value.right),
});

const performanceTooltip =
  "You have exceeded your daily search limit. Strict and figurative modes operate with reduced performance. Fast mode will not be affected.";

// Tags - mantener el composable para las sugerencias
const {
  includedTagSuggestions,
  excludedTagSuggestions,
  onSearchInputIncluded,
  onSearchInputExcluded,
} = useSearchTags();

// Control de carga y paginación
const pageSize = ref(12);

const warmedUp = ref(false);

const warmingMessages = [
  "Warming up the engines...",
  "Stagingaring the stage...",
  "Just a few seconds more...",
  "Aligning the neurons...",
  "Summoning the muses...",
];
const warmingMessage = ref(warmingMessages[0]);
let warmingInterval = null;

const scrollContainer = ref(null);

const includedTagSuggestionsFormatted = computed(() =>
  includedTagSuggestions.value.map((tagName) => ({
    label: tagName,
    value: tagName,
  }))
);

const excludedTagSuggestionsFormatted = computed(() =>
  excludedTagSuggestions.value.map((tagName) => ({
    label: tagName,
    value: tagName,
  }))
);

const tagIncSelect = ref(null);
const tagExcSelect = ref(null);

function handleTagSelected() {
  tagIncSelect.value?.blur();
  tagExcSelect.value?.blur();
}

// Función para manejar cambios en tags incluidas
function handleIncludedTagsChange(value) {
  searchStore.updateTagsSearch(value, excludedTags.value);
}

// Función para manejar cambios en tags excluidas
function handleExcludedTagsChange(value) {
  searchStore.updateTagsSearch(includedTags.value, value);
}

// Helpers
const skeletonCount = computed(() => pageSize.value);

// Función simple para manejar el scroll del toolbar
function handleScroll() {
  if (!scrollContainer.value) return;

  const currentScrollY = scrollContainer.value.scrollTop;

  // Solo aplicar si hay contenido de búsqueda
  if (searchResults.value.length > 0 && !isSearching.value) {
    // Si hacemos scroll hacia abajo y pasamos cierto punto, ocultar
    if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
      isToolbarCollapsed.value = true;
    }
    // Si hacemos scroll hacia arriba, mostrar
    else if (currentScrollY < lastScrollY.value && currentScrollY < 500) {
      isToolbarCollapsed.value = false;
    }
  } else {
    // Sin contenido, siempre mostrar
    isToolbarCollapsed.value = false;
  }

  lastScrollY.value = currentScrollY;
}

// Columnas del grid y paginación
const gridColumns = ref(6);

// Star filter for minimum rating
const minStarRating = ref(1);

// Collections filter
const selectedCollections = ref([]);

// Visual aspects filter (mock data)
const selectedVisualAspects = ref([]);

// Filters visibility state
const showMoreFilters = ref(false);

// NOTA: Variables disponibles para implementar en la búsqueda:
// - selectedCollections.value: Array de IDs de colecciones seleccionadas
// - getSelectedCollectionNames(): Array de nombres de colecciones seleccionadas
// - hasActiveFilters.value: Boolean que indica si hay filtros activos
// - filterSummaryText.value: String con resumen de filtros para mostrar en UI

// Computed for collections options
const collectionsOptions = computed(() => {
  return collectionsStore.allCollections.map((collection) => ({
    label: collection.name,
    value: collection.id,
  }));
});

// Mock visual aspects options
const visualAspectsOptions = [
  { label: "High contrast", value: "high_contrast" },
  { label: "Low contrast", value: "low_contrast" },
  { label: "Vibrant colors", value: "vibrant_colors" },
  { label: "Muted colors", value: "muted_colors" },
  { label: "Black & white", value: "black_white" },
  { label: "Sepia tone", value: "sepia_tone" },
  { label: "Close-up", value: "close_up" },
  { label: "Wide shot", value: "wide_shot" },
  { label: "Portrait orientation", value: "portrait" },
  { label: "Landscape orientation", value: "landscape" },
  { label: "Blurred background", value: "blurred_bg" },
  { label: "Sharp details", value: "sharp_details" },
];

function setGridColumns(n) {
  gridColumns.value = n;
}

// Star filter handler
function onStarFilterChange(rating) {
  minStarRating.value = rating || 0;
  console.log("Min star rating filter set to:", minStarRating.value);
}

function togglePhotoSelection(id) {
  localTogglePhotoSelection(id);
}
function clearSelection() {
  localClearAllSelections();
}
async function moveToCanvas() {
  await Promise.all(
    localSelectedPhotoIds.value.map((id) => photoStore.fetchPhoto(id))
  );
  const photosToAdd = localSelectedPhotoIds.value
    .map((id) => photoStore.photos.find((p) => p.id == id))
    .filter(Boolean);

  localClearAllSelections();
  canvasStore.addPhotos(photosToAdd);

  router.push("/canvas");
}
// Cambio de tipo de búsqueda
function setSearchType(type) {
  searchStore.setSearchType(type);
}

// Limpia inputs de búsqueda solo del tipo actual
function clearSearch() {
  searchStore.clearCurrentSearch();

  // Reset star filter
  minStarRating.value = 0;

  // Reset all filters
  clearAllFilters();

  // Resetear estado del toolbar
  isToolbarCollapsed.value = false;
  lastScrollY.value = 0;
}

// Ejecución de búsqueda
async function performSearch() {
  clearSelection();
  searchStore.resetCurrentIteration();
  searchStore.setSearching(true);

  await searchPhotos();
  searchStore.setSearching(false);
}

// Cargar más resultados
async function loadMorePhotos() {
  searchStore.setLoadingMore(true);
  await searchPhotos();
  searchStore.setLoadingMore(false);
}

// Llamada a la API
async function searchPhotos() {
  try {
    const currentState = searchStore.currentSearchState;
    const options = {
      iteration: currentState.iteration,
      pageSize: pageSize.value,
      searchMode: searchStore.searchMode,
    };

    let payload;
    if (activeSearchType.value === "semantic") {
      payload = { description: semanticQuery.value, options };
    } else if (activeSearchType.value === "tags") {
      payload = {
        included: includedTags.value,
        excluded: excludedTags.value,
        options,
      };
    } else {
      payload = {
        left: topological.value.left,
        middle: topological.value.center,
        right: topological.value.right,
        options,
      };
    }
    await api.post(`/api/search/${activeSearchType.value}`, payload);
  } catch (err) {
    console.error("Error al buscar fotos:", err);
  }
}

async function ensureWarmUp() {
  let i = 0;
  warmingInterval = setInterval(() => {
    i = (i + 1) % warmingMessages.length;
    warmingMessage.value = warmingMessages[i];
  }, 5000);

  const { data } = await api.get("/api/search/warmUp");
  warmedUp.value = data.result;

  if (data.result && warmingInterval) {
    clearInterval(warmingInterval);
    warmingInterval = null;
  }
}

function scrollToLast() {
  nextTick(() => {
    const el = scrollContainer.value;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  });
}

// Manejo de respuestas en tiempo real
onMounted(() => {
  ensureWarmUp();

  // Fetch collections when component mounts
  collectionsStore.getOrFetch();

  // Añadir scroll listener después de que el DOM esté completamente montado
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }
  });
});

onUnmounted(() => {
  // Remover scroll listener
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("scroll", handleScroll);
  }

  socket.off("search-matches");
  socket.off("maxPageAttempts");
});

// Carousel de ejemplos dinámico usando composable
function handleSearchExampleClick(example, exampleText, searchType) {
  if (searchType === "semantic") {
    semanticQuery.value = exampleText;
    performSearch();
  }
}

const {
  exampleIndex,
  isSliding,
  currentExamples,
  currentExampleText,
  handleExampleClick,
} = useQueryExamples(activeSearchType, searchMode, handleSearchExampleClick);

let matchesListenerRegistered = false;
watch(
  () => userStore.user && userStore.user.id,
  (val) => {
    if (val) {
      socket.emit("join", { userId: userStore.user.id });
      if (!matchesListenerRegistered) {
        socket.on("search-matches", (data) => {
          console.log(data);
          searchStore.updateSearchResults(data);
          setTimeout(() => {
            scrollToLast();
          }, 0);
        });
        socket.on("maxPageAttempts", () => {
          searchStore.setMaxPageAttempts();
        });
        matchesListenerRegistered = true;
      }
    }
  },
  { immediate: true }
);

// Función para manejar cambios en los inputs de búsqueda
function onSearchChange() {
  // Esta función se puede usar para triggers adicionales si es necesario
  // pero el binding reactivo del store ya se encarga de actualizar automáticamente
}

// Función para manejar cambios en topological search
function updateTopologicalLeft(value) {
  searchStore.updateTopologicalSearch(
    value,
    topological.value.center,
    topological.value.right
  );
}

function updateTopologicalCenter(value) {
  searchStore.updateTopologicalSearch(
    topological.value.left,
    value,
    topological.value.right
  );
}

function updateTopologicalRight(value) {
  searchStore.updateTopologicalSearch(
    topological.value.left,
    topological.value.center,
    value
  );
}

// Collections filter functions
function clearCollectionsFilter() {
  selectedCollections.value = [];
}

function clearVisualAspectsFilter() {
  selectedVisualAspects.value = [];
}

function clearAllFilters() {
  clearCollectionsFilter();
  clearVisualAspectsFilter();
}

function getSelectedCollectionNames() {
  return selectedCollections.value
    .map((id) => {
      const collection = collectionsStore.getCollectionById(id);
      return collection ? collection.name : null;
    })
    .filter(Boolean);
}

// Computed to check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    selectedCollections.value.length > 0 ||
    selectedVisualAspects.value.length > 0
  );
});

// Helper to get filter summary text
const filterSummaryText = computed(() => {
  const parts = [];

  if (selectedCollections.value.length > 0) {
    const names = getSelectedCollectionNames();
    if (names.length === 1) {
      parts.push(`in "${names[0]}"`);
    } else if (names.length <= 3) {
      parts.push(`in ${names.length} collections`);
    } else {
      parts.push(`in ${names.length} collections`);
    }
  }

  if (selectedVisualAspects.value.length > 0) {
    parts.push(`${selectedVisualAspects.value.length} visual aspects`);
  }

  return parts.join(", ");
});
</script>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Search Toolbar */
.search-toolbar {
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 16px;
  padding: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.search-toolbar.is-collapsed {
  transform: translateY(-120%);
}

/* Combined Search Selector Section */
.search-selector-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #2c2c32;
  overflow: visible;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: visible;
}

.selector-group:first-child {
  flex: 1 1 auto;
}

.selector-group:last-child {
  flex: 0 0 auto;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  white-space: nowrap;
}

/* Search Type Pills */
.type-pills {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  justify-content: flex-start;
  overflow: visible;
}

.type-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid #2c2c32;
  background-color: transparent;
  color: #ffffff73;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  justify-content: center;
  text-align: center;
  overflow: visible;
}

.type-pill:hover {
  border-color: #2563eb;
  color: #ffffffd1;
  transform: translateY(-1px);
}

.type-pill.active {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

.type-icon {
  flex-shrink: 0;
}

/* Search Mode Pills */
.mode-pills {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
  overflow: visible;
}

.mode-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #2c2c32;
  background-color: transparent;
  color: #ffffff73;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  justify-content: center;
  overflow: visible;
  position: relative;
}

.mode-pill.premium-pill {
  padding-right: 20px;
}

.mode-pill:hover {
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.mode-pill.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.mode-icon {
  flex-shrink: 0;
}

.premium-indicator-pill {
  position: absolute;
  top: -4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  transform: rotate(45deg);
  box-shadow: 0 0 4px rgba(245, 158, 11, 0.4);
  border: 1px solid #18181c;
}

/* Usage Limit Warning Badge */
.usage-limit-warning {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.warning-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.warning-text {
  color: #f59e0b;
  white-space: nowrap;
}

.info-icon {
  color: #f59e0b;
  opacity: 0.8;
  cursor: help;
  flex-shrink: 0;
}

.close-badge-btn {
  background: none;
  border: none;
  color: #f59e0b;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-badge-btn:hover {
  opacity: 1;
  background-color: rgba(245, 158, 11, 0.1);
  transform: scale(1.1);
}

.search-content {
  padding-top: 12px;
}

/* Search Filters Section */
.search-filters-section {
  margin-bottom: 16px;
  padding-bottom: 0;
}

.more-filters-toggle {
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.2s ease;
}

.more-filters-toggle:hover {
  opacity: 0.8;
}

.more-filters-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.more-filters-label {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff73;
}

.more-filters-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-filters-indicator {
  font-size: 11px;
  color: #2563eb;
  background-color: rgba(37, 99, 235, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.toggle-icon {
  color: #ffffff73;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.filters-container {
  margin-top: 12px;
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  border: none;
}

.filters-inline-container {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-inline-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.filter-inline-label {
  font-size: 12px;
  font-weight: 500;
  color: #ffffff73;
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-inline-select {
  min-width: 160px;
  max-width: none;
  width: auto;
}

.collections-select {
  min-width: 200px;
  max-width: none;
  width: auto;
}

.filter-inline-count {
  font-size: 10px;
  color: #2563eb;
  background-color: rgba(37, 99, 235, 0.15);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.clear-filters-container {
  margin-top: 12px;
  padding-top: 0;
  border-top: none;
  display: flex;
  justify-content: center;
}

.clear-filters-button {
  color: #ffffff73 !important;
  font-size: 11px;
  transition: color 0.2s ease;
}

.clear-filters-button:hover {
  color: #ffffff90 !important;
}

/* Semantic Language Search */
.semantic-search-section {
  max-width: 100%;
}

.search-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.semantic-input {
  font-size: 16px;
  flex: 1;
}

/* Tags Search */
.tags-search-section {
  width: 100%;
}

.tags-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.tags-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  flex: 1;
}

.tags-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
}

.tags-select {
  min-height: 40px;
}

/* Topological Search */
.topological-search-section {
  width: 100%;
}

.topological-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.topological-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  flex: 1;
}

.topological-area {
  width: 100%;
}

.topological-input {
  text-align: center;
  width: 100%;
}

.center-input {
  border-color: #2563eb;
}

/* Inline Search Actions */
.search-actions-inline {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-self: flex-start;
  flex-shrink: 0;
}

.search-button {
  min-width: 140px;
  height: 40px;
}

.clear-button {
  min-width: 100px;
  height: 40px;
}

.clear-button.icon-only {
  min-width: 40px;
  width: 40px;
  padding: 0;
}

/* Search Results Container */
.search-results-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  min-height: 0;
}

/* Load More */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.load-more-button {
  min-width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

/* Action buttons (inline with grid controls) */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 24px;
}

/* Controls right container */
.controls-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* Star Filter */
.star-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffffd1;
  white-space: nowrap;
}

.star-buttons {
  display: flex;
  align-items: center;
}

.star-rating {
  --n-item-color-active: #fbbf24;
  --n-item-color: rgba(255, 255, 255, 0.3);
}

.filter-applied {
  color: #ffffff73;
  font-size: 12px;
  margin-left: 4px;
}

/* Search Inspiration */
.search-inspiration {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1;
  padding: var(--spacing-2xl) 0; /* Add padding instead of min-height */
}

.inspiration-content {
  max-width: 600px;
  position: relative;
  z-index: 2;
}

.inspiration-icon {
  margin-bottom: var(--spacing-lg); /* 16px instead of 24px */
}

.inspiration-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffffd1;
  margin: 0 0 12px 0;
}

.inspiration-subtitle {
  font-size: 18px;
  color: #ffffff73;
  margin: 0 0 40px 0;
}

.search-examples {
  text-align: left;
}

.examples-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0 0 0 0;
  text-align: center;
}

.examples-carousel {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px 0;
}

.carousel-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-item {
  width: 100%;
  opacity: 1;
  transform: translateX(0);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-item.sliding {
  opacity: 0;
  transform: translateX(-80px);
}

.example-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
}

.example-card:hover .example-text {
  color: #2563eb;
  transform: scale(1.02);
}

.example-text {
  font-size: 16px;
  color: #ffffff73;
  line-height: 1.4;
  text-align: center;
  font-style: italic;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Search Loading */
.search-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 16px;
}

.loading-text {
  font-size: 16px;
  color: #ffffff73;
  margin: 0;
}

/* Search Results */
.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.results-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  background-color: #18181c;
  border: 1px solid #2c2c32;
  border-radius: 12px;
  padding: 40px;
  min-height: 200px;
}

.results-text {
  font-size: 18px;
  color: #ffffffd1;
  margin: 0;
}

.results-query {
  font-size: 14px;
  color: #ffffff73;
  margin: 0;
  text-align: center;
}

/* Medium screens - adjust spacing */
@media (max-width: 1024px) {
  .search-selector-section {
    gap: 16px;
  }

  .type-pill,
  .mode-pill {
    font-size: 11px;
    padding: 7px 8px;
    gap: 3px;
  }
}

/* Tablet responsive - stack vertically */
@media (max-width: 768px) {
  .search-toolbar {
    padding: 16px;
  }

  .search-toolbar.is-collapsed {
    padding: 8px 16px;
    transform: translateY(-4px);
  }

  .search-selector-section {
    flex-direction: column;
    gap: 16px;
  }

  .search-filters-section {
    margin-bottom: 12px;
    padding-bottom: 0;
  }

  .more-filters-label {
    font-size: 12px;
  }

  .active-filters-indicator {
    font-size: 10px;
    padding: 1px 4px;
  }

  .filters-container {
    margin-top: 10px;
    padding: 0;
  }

  .filters-inline-container {
    gap: 16px;
  }

  .filter-inline-label {
    font-size: 11px;
  }

  .filter-inline-select {
    min-width: 140px;
    max-width: none;
  }

  .collections-select {
    min-width: 160px;
    max-width: none;
  }

  .filter-inline-count {
    font-size: 9px;
    padding: 1px 4px;
  }

  .clear-filters-button {
    font-size: 10px;
  }

  .selector-group:first-child,
  .selector-group:last-child {
    flex: 1;
    width: 100%;
  }

  .type-pill,
  .mode-pill {
    font-size: 12px;
    padding: 8px 10px;
  }

  /* Star filter responsive */
  .controls-right {
    gap: 12px;
  }

  .star-filter {
    gap: 6px;
  }

  .filter-label {
    font-size: 12px;
  }

  /* Note: Grid responsive styles moved to global.scss */

  .selection-info {
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    border-radius: 16px;
  }
}

/* Small mobile - compress further if needed */
@media (max-width: 480px) {
  .search-toolbar {
    padding: 12px;
    margin-bottom: 16px;
  }

  .search-toolbar.is-collapsed {
    padding: 6px 12px;
    transform: translateY(-2px);
  }

  .type-pills {
    gap: 2px;
  }

  .mode-pills {
    gap: 2px;
  }

  .type-pill,
  .mode-pill {
    font-size: 10px;
    padding: 6px 6px;
    gap: 2px;
  }

  .type-icon,
  .mode-icon {
    width: 10px;
    height: 10px;
  }

  .search-filters-section {
    margin-bottom: 10px;
    padding-bottom: 0;
  }

  .more-filters-label {
    font-size: 11px;
  }

  .active-filters-indicator {
    font-size: 9px;
    padding: 1px 3px;
  }

  .filters-container {
    margin-top: 8px;
    padding: 0;
  }

  .filters-inline-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-inline-group {
    width: 100%;
    justify-content: space-between;
  }

  .filter-inline-label {
    font-size: 10px;
  }

  .filter-inline-select {
    min-width: 120px;
    max-width: none;
    flex: 1;
    margin-left: auto;
  }

  .collections-select {
    min-width: 140px;
    max-width: none;
  }

  .filter-inline-count {
    font-size: 8px;
    padding: 1px 3px;
  }

  .clear-filters-container {
    margin-top: 8px;
    padding-top: 0;
  }

  .clear-filters-button {
    font-size: 9px;
  }

  /* Star filter mobile responsive */
  .controls-right {
    gap: 8px;
  }

  .star-filter {
    gap: 4px;
  }

  .filter-label {
    font-size: 10px;
  }

  .search-input-row,
  .tags-input-row,
  .topological-input-row {
    flex-direction: column;
    gap: 16px;
  }

  .tags-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .topological-input-row {
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .topological-grid {
    display: grid;
    grid-template-columns: 1fr !important;
    gap: 20px;
    width: 100% !important;
  }

  .topological-area {
    width: 100% !important;
  }

  .topological-input {
    text-align: left;
    width: 100% !important;
  }

  .topological-search-section {
    width: 100% !important;
  }

  .topological-search-section .topological-input {
    width: 100% !important;
  }

  .topological-search-section .topological-input-row {
    width: 100% !important;
  }

  .topological-search-section .topological-grid {
    width: 100% !important;
  }

  .topological-search-section .topological-area {
    width: 100% !important;
  }

  .topological-search-section .n-input {
    width: 100% !important;
  }

  .topological-search-section :deep(.n-input) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .topological-search-section :deep(.n-input-wrapper) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .topological-search-section :deep(.n-input__input-el) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .search-actions-inline {
    flex-direction: row;
    width: 100%;
  }

  .search-button {
    flex: 1;
  }

  .clear-button.icon-only {
    min-width: 40px;
    width: 40px;
    flex: none;
  }

  .inspiration-title {
    font-size: 24px;
  }

  .inspiration-subtitle {
    font-size: 16px;
  }

  .examples-carousel {
    padding: 12px 0;
  }

  .carousel-container {
    height: 70px;
  }

  .carousel-item.sliding {
    transform: translateX(-60px);
  }

  .example-card {
    min-height: 40px;
    padding: 0;
  }

  .example-text {
    font-size: 14px;
  }

  /* Note: Photo grid mobile styles moved to global.scss */

  .load-more-container {
    margin: 24px 0;
  }

  .load-more-button {
    width: 100%;
    min-width: auto;
  }

  .selection-info {
    bottom: 12px;
    left: 12px;
    right: 12px;
    transform: none;
    padding: 10px 16px;
    font-size: 13px;
  }
}

/* Tablet Responsive */
@media (min-width: 768px) and (max-width: 1024px) {
  .search-input-row,
  .tags-input-row,
  .topological-input-row {
    gap: 12px;
  }

  .topological-grid {
    gap: 16px;
  }

  .tags-row {
    gap: 16px;
  }
}
.controls-left {
  display: flex;
  align-items: center;
}
</style>
