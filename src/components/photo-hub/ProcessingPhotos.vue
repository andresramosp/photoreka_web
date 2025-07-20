<template>
  <div class="tab-content">
    <div class="processing-section">
      <!-- Processing Jobs Table -->

      <div class="photo-hub-header">
        <n-icon :color="`var(--warning-color)`" size="18">
          <BookInformation20Regular />
        </n-icon>
        <h3 class="photo-hub-title">
          Here you can monitor the analysis process for your photos. They will
          appear in your Workspace once the process is complete (up to two
          hours).
        </h3>
      </div>
      <div v-if="processingJobs.length > 0" class="processing-table-container">
        <div class="processing-table">
          <div
            v-for="job in processingJobs"
            :key="job.id"
            class="processing-row"
            :class="{
              expanded: job.expanded,
              finished: job.status === 'finished',
            }"
            @click="toggleJobExpansion(job.id)"
          >
            <!-- Main Row -->
            <div class="row-main">
              <div class="row-cell date-cell">
                <span class="cell-label">Started</span>
                <span class="cell-value">{{ formatDate(job.startDate) }}</span>
              </div>

              <div class="row-cell photos-cell">
                <span class="cell-label">Photos</span>
                <span class="cell-value">{{ job.photoCount }}</span>
              </div>
              <div class="row-cell type-cell progress-cell">
                <span class="cell-label">Progress</span>
                <n-tooltip placement="top">
                  <template #trigger>
                    <PieProgress
                      :percentage="job.progressPercent"
                      :size="24"
                      :progress-color="
                        job.status === 'finished' ? '#10b981' : '#f59e0b'
                      "
                      background-color="#2c2c32"
                      stroke-color="#1a1a1f"
                      :stroke-width="1"
                      class="progress-compact"
                    />
                  </template>
                  <span>{{ job.currentStageLabel }}</span>
                </n-tooltip>
              </div>

              <div class="row-cell status-cell">
                <span class="cell-label">Status</span>
                <n-tag
                  size="small"
                  class="status-tag element-with-spinner"
                  :class="{
                    'status-processing': job.status === 'processing',
                    'status-finished': job.status === 'finished',
                  }"
                >
                  <template v-if="job.status === 'processing'">
                    <n-spin
                      size="12"
                      class="spinner-status-badge spinner-small spinner-centered"
                    />
                  </template>
                  {{ job.status === "processing" ? "Processing" : "Finished" }}
                </n-tag>
              </div>
              <div class="row-cell expand-cell">
                <n-icon size="16" class="expand-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6l1.41-1.41z"
                    />
                  </svg>
                </n-icon>
              </div>
            </div>

            <!-- Expanded Row Content -->
            <div v-if="job.expanded" class="row-expanded">
              <div class="expanded-content">
                <div class="photos-grid-mini">
                  <PhotoCardHub
                    v-for="photo in job.photos"
                    :key="photo.id"
                    :photo="photo"
                    :show-delete="false"
                    :show-name="false"
                    :show-footer="false"
                    :showDuplicate="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Processing State -->
      <div v-if="processingJobs.length === 0" class="empty-processing-state">
        <div class="empty-state-content">
          <n-icon size="64" color="#6b7280">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
          </n-icon>
          <h3 class="empty-state-title">No photos being processed</h3>
          <p class="empty-state-description">
            Upload photos in the
            <button class="tab-link" @click="navigateToTab('upload')">
              Lightbox
            </button>
            to see them here during processing
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, h } from "vue";
import { api } from "@/utils/axios";
import { BookInformation20Regular } from "@vicons/fluent";
import PhotoCardHub from "../photoCards/PhotoCardHub.vue";
import PieProgress from "../PieProgress.vue";
import {
  NTooltip,
  NSpin,
  NButton,
  useMessage,
  useNotification,
} from "naive-ui";
import { usePhotosStore } from "@/stores/photos"; // o donde tengas el store
import { useRoute } from "vue-router";

const photosStore = usePhotosStore();
const message = useMessage();
const notification = useNotification();
const route = useRoute();

const emit = defineEmits(["navigate-to-tab"]);

// Utilidades
const API_URL = "/api/analyzer-process";

// Estado de procesos
const processingJobs = ref([]);
const intervalId = ref(null); // Usar ref para evitar problemas de ciclo de vida
const isPolling = ref(false); // Flag para evitar múltiples intervalos
const isMounted = ref(false); // Flag para evitar código después del unmount
const componentId = Math.random().toString(36).substring(2, 9); // ID único para debug
// Helpers para el polling seguro
function clearPollingInterval() {
  if (intervalId.value) {
    console.log(
      `[ProcessingPhotos-${componentId}] Limpio intervalId`,
      intervalId.value
    );
    clearInterval(intervalId.value);
    intervalId.value = null;
  } else {
    console.log(
      `[ProcessingPhotos-${componentId}] clearPollingInterval: No hay interval activo`
    );
  }
  isPolling.value = false;
}

function startPolling() {
  console.log(
    `[ProcessingPhotos-${componentId}] startPolling llamado, isPolling:`,
    isPolling.value,
    "isMounted:",
    isMounted.value
  );

  if (!isMounted.value) {
    console.log(
      `[ProcessingPhotos-${componentId}] Componente desmontado, no inicio polling`
    );
    return;
  }

  if (isPolling.value) {
    console.log(
      `[ProcessingPhotos-${componentId}] Ya hay polling activo, ignorando`
    );
    return;
  }

  clearPollingInterval();
  isPolling.value = true;

  const newIntervalId = setInterval(() => {
    if (!isMounted.value) {
      console.log(
        `[ProcessingPhotos-${componentId}] Componente desmontado, limpiando interval`
      );
      clearInterval(newIntervalId);
      return;
    }
    // Solo ejecutar loadProcesses si el hash es #processing
    const hash = window.location.hash.replace("#", "");
    if (hash === "processing") {
      console.log(
        `[ProcessingPhotos-${componentId}] setInterval tick (loadProcesses ejecutado)`,
        newIntervalId,
        new Date().toISOString()
      );
      loadProcesses();
    } else {
      console.log(
        `[ProcessingPhotos-${componentId}] setInterval tick (NO ejecuta loadProcesses, hash actual: #${hash})`,
        newIntervalId,
        new Date().toISOString()
      );
    }
  }, 5000);

  intervalId.value = newIntervalId;
  console.log(
    `[ProcessingPhotos-${componentId}] Creo intervalId`,
    intervalId.value
  );
}

// Orden de las stages del pipeline
const STAGES = [
  { key: "init", label: "Initializing" },
  { key: "clip_embeddings", label: "CLIP Embeddings" },
  { key: "vision_context_story_accents", label: "Vision Context & Accents" },
  { key: "tags_context_story", label: "Tags & Story" },
  { key: "tags_visual_accents", label: "Visual Accents" },
  {
    key: "chunks_context_story_visual_accents",
    label: "Story Chunks & Accents",
  },
  { key: "visual_color_embedding_task", label: "Color Embedding" },
  { key: "topological_tags", label: "Topological Tags" },
  { key: "finished", label: "Finished" },
];

// Devuelve el índice de la etapa actual
function getCurrentStageIndex(stage) {
  return STAGES.findIndex((s) => s.key === stage);
}

// Mapear proceso
const mapProcess = (proc) => {
  const currentStageIdx = getCurrentStageIndex(proc.currentStage || "init");
  const totalStages = STAGES.length - 1; // 'finished' no cuenta para el progreso
  const isFinished = proc.currentStage === "finished";
  return {
    id: proc.id,
    expanded: false,
    startDate: proc.createdAt,
    photoCount: proc.photos?.length ?? 0,
    status: isFinished ? "finished" : "processing",
    // El porcentaje es etapas completadas respecto al total (sin finished)
    progressPercent: isFinished
      ? 100
      : Math.max(0, Math.round((currentStageIdx / totalStages) * 100)),
    currentStageLabel: STAGES[currentStageIdx]?.label || "Starting...",
    photos: proc.photos,
  };
};

// --- Notificación de procesos finalizados ---
const FINISHED_JOBS_KEY = "notifiedFinishedJobs";
function getNotifiedFinishedJobs() {
  try {
    return JSON.parse(localStorage.getItem(FINISHED_JOBS_KEY)) || [];
  } catch {
    return [];
  }
}
function setNotifiedFinishedJobs(ids) {
  localStorage.setItem(FINISHED_JOBS_KEY, JSON.stringify(ids));
}
function notifyFinished(job) {
  let markAsRead = false;
  const n = notification.create({
    title: "Process Finished",
    content: `The analysis for ${
      job.photoCount
    } photo(s) started on ${formatDate(job.startDate)} is complete.`,
    meta: new Date().toLocaleString(),
    action: () =>
      h(
        NButton,
        {
          text: true,
          type: "primary",
          onClick: () => {
            markAsRead = true;
            n.destroy();
          },
        },
        { default: () => "Mark as Read" }
      ),
    onClose: () => {
      if (!markAsRead) {
        message.warning("Please mark as read");
        return false;
      }
    },
  });
}

async function loadProcesses() {
  if (!isMounted.value) {
    console.log(
      `[ProcessingPhotos-${componentId}] Componente desmontado, no cargo procesos`
    );
    return;
  }

  try {
    const response = await api.get(API_URL);

    // Verificar nuevamente después del await
    if (!isMounted.value) {
      console.log(
        `[ProcessingPhotos-${componentId}] Componente desmontado después del API call`
      );
      return;
    }

    const previousJobs = [...processingJobs.value]; // Clonar los anteriores

    const updated = response.data
      .filter((proc) => !proc.isPreprocess) // && proc.mode == "adding"
      .map((proc) => {
        const current = processingJobs.value.find((j) => j.id === proc.id);
        const mapped = mapProcess(proc);
        if (current) mapped.expanded = current.expanded;
        return mapped;
      });

    processingJobs.value = updated.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // --- Notificación de procesos finalizados ---
    let notifiedIds = getNotifiedFinishedJobs();
    let newNotified = false;

    // Detectar si alguno ha pasado de "processing" a "finished"
    for (const updatedJob of processingJobs.value) {
      const previousJob = previousJobs.find((j) => j.id == updatedJob.id);
      if (
        previousJob &&
        previousJob.status === "processing" &&
        updatedJob.status === "finished"
      ) {
        await photosStore.getOrFetch(true);
        if (!notifiedIds.includes(updatedJob.id)) {
          notifyFinished(updatedJob);
          notifiedIds.push(updatedJob.id);
          newNotified = true;
        }
        break; // solo una vez
      }
    }

    // Al entrar, notificar procesos terminados no notificados
    for (const job of processingJobs.value) {
      if (job.status === "finished" && !notifiedIds.includes(job.id)) {
        notifyFinished(job);
        notifiedIds.push(job.id);
        newNotified = true;
      }
    }

    if (newNotified) setNotifiedFinishedJobs(notifiedIds);
  } catch (error) {
    console.error(
      `[ProcessingPhotos-${componentId}] Error loading processes:`,
      error
    );
  }
}

// Inicia carga y auto-refresh
onMounted(async () => {
  console.log(`[ProcessingPhotos-${componentId}] onMounted`);
  isMounted.value = true;
  await loadProcesses();

  // Verificar si el componente sigue montado después del await
  if (isMounted.value) {
    startPolling();
  } else {
    console.log(
      `[ProcessingPhotos-${componentId}] Componente desmontado durante onMounted, no inicio polling`
    );
  }
});
onBeforeUnmount(() => {
  console.log(`[ProcessingPhotos-${componentId}] onBeforeUnmount`);
  isMounted.value = false;
  clearPollingInterval();
});

// Utilidades de UI
const formatDate = (date) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const toggleJobExpansion = (jobId) => {
  const job = processingJobs.value.find((j) => j.id === jobId);
  if (job) job.expanded = !job.expanded;
};

const navigateToTab = (tabName) => {
  emit("navigate-to-tab", tabName);
};
</script>

<style scoped>
.tab-content {
  padding: var(--spacing-3xl);
  background-color: var(--bg-container);
}

/* Processing Section */
.processing-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 0;
}

.photo-count {
  font-size: 14px;
  color: #ffffff73;
}

/* Processing Table */
.processing-table-container {
  margin-bottom: 32px;
}

.processing-table {
  background-color: #1a1a1f;
  border-radius: 12px;
  border: 1px solid #2c2c32;
  overflow: hidden;
}

.processing-row {
  border-bottom: 1px solid #2c2c32;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.processing-row:last-child {
  border-bottom: none;
}

.processing-row:hover {
  background-color: rgba(139, 92, 246, 0.05);
}

.processing-row.finished {
  opacity: 0.7;
}

.processing-row.expanded {
  background-color: rgba(139, 92, 246, 0.05);
}

.row-main {
  display: grid;
  grid-template-columns: 300px 350px 350px 350px 1fr;
  gap: 16px;
  padding: 16px 20px;
  align-items: center;
}

.row-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-label {
  font-size: 12px;
  color: #ffffff60;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cell-value {
  font-size: 14px;
  color: #ffffffd1;
  font-weight: 500;
}

.photos-cell .cell-value {
  font-size: 16px;
  font-weight: 600;
  color: #8b5cf6;
}

.status-cell {
  align-items: flex-start;
}

.expand-cell {
  justify-content: center;
  align-items: center;
}

.expand-icon {
  color: #ffffff73;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.processing-row.expanded .expand-icon {
  transform: rotate(180deg);
}

/* Expanded Row Content */
.row-expanded {
  border-top: 1px solid #2c2c32;
  background-color: #16161a;
  animation: expandRow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandRow {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.expanded-content {
  padding: 20px;
}

.expanded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.expanded-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffffd1;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.job-progress {
  width: 120px;
}

.progress-text {
  font-size: 12px;
  color: #ffffff73;
  min-width: 80px;
}

/* Mini Photos Grid */
.photos-grid-mini {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.mini-photo {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #2c2c32;
  transition: all 0.2s ease;
}

.mini-photo:hover {
  transform: scale(1.05);
  border-color: #8b5cf6;
}

.mini-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Empty Processing State */
.empty-processing-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.empty-state-content {
  text-align: center;
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffffd1;
  margin: 16px 0 8px 0;
}

.empty-state-description {
  color: #ffffff73;
  margin: 0;
}

/* Custom Status Badge Colors */
.status-processing {
  background-color: var(--warning-color) !important;
  color: #ffffff !important;
  border-color: var(--warning-color) !important;
}

.status-finished {
  background-color: #10b981 !important;
  color: #ffffff !important;
  border-color: #10b981 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .tab-content {
    padding: 16px;
  }

  /* Processing Table Responsive */
  .row-main {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px 16px;
  }

  .row-cell {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #2c2c32;
  }

  .row-cell:last-child {
    border-bottom: none;
  }

  .expand-cell {
    position: absolute;
    top: 12px;
    right: 16px;
  }

  .photos-grid-mini {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 6px;
  }

  .expanded-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .progress-info {
    width: 100%;
  }

  .job-progress {
    width: 100%;
  }
}

.progress-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  width: 56px; /* Ajusta según tu diseño */
}

.progress-compact {
  display: block;
  margin: 0 auto;
}
</style>
