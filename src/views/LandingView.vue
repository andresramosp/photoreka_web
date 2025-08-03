<template>
  <n-message-provider>
    <div class="landing-page">
      <!-- Navigation Header -->
      <nav class="landing-nav">
        <div class="nav-container">
          <div class="nav-brand">
            <div class="logo">
              <img :src="logoName" alt="Photoreka" class="logo-image" />
            </div>
          </div>
          <div class="nav-actions">
            <n-button text @click="goToAuth('login')"> Login </n-button>
            <!-- <n-button type="primary" @click="goToAuth('signup')">
            Sign Up
          </n-button> -->
            <n-button type="info" size="large" @click="goToAuth('signup')">
              <template #icon>
                <n-icon><RocketOutline /></n-icon>
              </template>
              Request Access
            </n-button>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">
                Photoreka
                <span class="hero-accent">Curation Lab</span>
              </h1>
              <span class="hero-subtitle">Street | Documentary | Abstract</span>
              <p class="hero-description">
                Start making sense of your photographic body of work with our
                powerful engine. 🕵️‍♂️ Explore through natural language queries. 🎨
                Build series for artistic or documentary projects. 🎞️ Sequence
                images by narrative or chromatic similarity 🔎 Uncover new
                connections hidden in your catalog.
              </p>
              <div class="hero-actions">
                <n-button type="primary" size="medium" @click="goToPlayground">
                  <template #icon>
                    <n-icon><Workspace /></n-icon>
                  </template>
                  Canvas Playground
                </n-button>
              </div>
            </div>
            <div class="hero-visual">
              <div class="video-tabs-container" ref="demoSection">
                <div class="video-tabs">
                  <div
                    v-for="(tab, index) in videoTabs"
                    :key="index"
                    class="video-tab"
                    :class="{ active: activeTab === index }"
                    @click="setActiveTab(index)"
                  >
                    <div class="tab-header">
                      <n-icon
                        size="20"
                        :color="activeTab === index ? '#2563eb' : '#6b7280'"
                      >
                        <component :is="tab.icon" />
                      </n-icon>
                      <span class="tab-title">{{ tab.title }}</span>
                    </div>
                    <div class="tab-progress" v-if="activeTab === index">
                      <div
                        class="progress-bar"
                        :style="{ width: `${videoProgress}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
                <div class="video-container">
                  <video
                    ref="videoPlayer"
                    class="demo-video"
                    :src="videoTabs[activeTab].videoUrl"
                    @timeupdate="updateProgress"
                    @ended="onVideoEnded"
                    @play="onVideoPlay"
                    @loadeddata="onVideoLoaded"
                    muted
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div
                    class="video-overlay"
                    v-if="!videoPlaying"
                    @click="playVideo"
                  >
                    <n-icon size="64" color="#ffffff">
                      <PlayCircleOutline />
                    </n-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="floating-header">
          <h2 class="floating-title">Powerful Features for Photographers</h2>
          <p class="floating-description">
            Everything you need to organize, discover, and enhance your photo
            collection
          </p>
        </div>
        <div class="floating-features">
          <div class="floating-feature-card">
            <div class="feature-icon">
              <n-icon size="40" color="#2563eb">
                <SearchOutline />
              </n-icon>
            </div>
            <h3 class="feature-title">Semantic Search</h3>
            <p class="feature-description">
              Find photos instantly using natural language. Search for "sunset
              beach" or "happy moments" and discover exactly what you're looking
              for.
            </p>
          </div>
          <div class="floating-feature-card">
            <div class="feature-icon">
              <n-icon size="40" color="#8b5cf6">
                <Workspace />
              </n-icon>
            </div>
            <h3 class="feature-title">Interactive Canvas</h3>
            <p class="feature-description">
              Create stunning photo layouts and compositions with our intuitive
              canvas tool. Perfect for mood boards and creative projects.
            </p>
          </div>
          <div class="floating-feature-card">
            <div class="feature-icon">
              <n-icon size="40" color="#22c55e">
                <AppsOutline />
              </n-icon>
            </div>
            <h3 class="feature-title">Grid Maker</h3>
            <p class="feature-description">
              Generate beautiful photo grids automatically. Choose from various
              layouts and export high-quality compositions for social media.
            </p>
          </div>
          <div class="floating-feature-card">
            <div class="feature-icon">
              <n-icon size="40" color="#f59e0b">
                <ImagesOutline />
              </n-icon>
            </div>
            <h3 class="feature-title">Smart Curation</h3>
            <p class="feature-description">
              Let our engine automatically curate your best photos based on
              composition, lighting, and emotional impact. Save hours of manual
              sorting.
            </p>
          </div>
          <!-- <div class="floating-feature-card">
          <div class="feature-icon">
            <n-icon size="40" color="#ef4444">
              <ColorPaletteOutline />
            </n-icon>
          </div>
          <h3 class="feature-title">Style Transfer</h3>
          <p class="feature-description">
            Apply artistic styles to your photos with advanced tools. Transform
            ordinary photos into artistic masterpieces with one click.
          </p>
        </div>
        <div class="floating-feature-card">
          <div class="feature-icon">
            <n-icon size="40" color="#06b6d4">
              <CloudUploadOutline />
            </n-icon>
          </div>
          <h3 class="feature-title">Cloud Sync</h3>
          <p class="feature-description">
            Seamlessly sync your photos across all devices. Access your entire
            collection anywhere with automatic backup and organization.
          </p>
        </div> -->
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section">
        <div class="floating-header">
          <h2 class="floating-title">How Photoreka Works</h2>
          <p class="floating-description">
            Get started in minutes with our simple 3-step process
          </p>
        </div>
        <div class="floating-steps">
          <div class="floating-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">Synchronize Your Photos</h3>
              <p class="step-description">
                Simply drag and drop your photos or connect your existing photo
                library. We support all major formats and cloud storage
                providers.
              </p>
            </div>
          </div>
          <div class="floating-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">Vision Analysis</h3>
              <p class="step-description">
                Our computer vision algorithms analyze your photos for
                narrative, chromatic, cultural and aesthetics aspects based on
                your profile.
              </p>
            </div>
          </div>
          <div class="floating-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">Discover & Create</h3>
              <p class="step-description">
                Use powerful natural language search, create stunning and
                coherent grids, sequence images by different criteria, and
                discover hidden gems in your collection.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <!-- <section class="testimonials-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Loved by Photographers Worldwide</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p class="testimonial-text">
                "Photoreka has revolutionized how I manage my wedding
                photography business. The AI search is incredibly accurate and
                saves me hours every week."
              </p>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <n-avatar size="medium" color="#2563eb">
                    <n-icon><PersonOutline /></n-icon>
                  </n-avatar>
                </div>
                <div class="author-info">
                  <span class="author-name">Sarah Johnson</span>
                  <span class="author-role">Wedding Photographer</span>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p class="testimonial-text">
                "The canvas feature is a game-changer for creating client
                presentations. I can quickly put together stunning mood boards
                that wow my clients."
              </p>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <n-avatar size="medium" color="#8b5cf6">
                    <n-icon><PersonOutline /></n-icon>
                  </n-avatar>
                </div>
                <div class="author-info">
                  <span class="author-name">Mike Chen</span>
                  <span class="author-role">Portrait Photographer</span>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p class="testimonial-text">
                "As a travel blogger, I needed a tool that could help me find
                the perfect shots from thousands of photos. Photoreka's AI
                search is exactly what I needed."
              </p>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <n-avatar size="medium" color="#22c55e">
                    <n-icon><PersonOutline /></n-icon>
                  </n-avatar>
                </div>
                <div class="author-info">
                  <span class="author-name">Emma Rodriguez</span>
                  <span class="author-role">Travel Blogger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> -->

      <!-- CTA Section -->
      <!-- <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Transform Your Photo Workflow?</h2>
          <p class="cta-description">
            Join thousands of photographers who have already discovered the
            power of AI-driven photo management.
          </p>
          <div class="cta-actions">
            <n-button type="primary" size="large" @click="goToAuth('signup')">
              <template #icon>
                <n-icon><RocketOutline /></n-icon>
              </template>
              Get Started Free
            </n-button>
            <n-button size="large" quaternary @click="goToAuth('login')">
              <template #icon>
                <n-icon><LogInOutline /></n-icon>
              </template>
              Sign In
            </n-button>
          </div>
          <p class="cta-note">No credit card required • 14-day free trial</p>
        </div>
      </div>
    </section> -->

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-container">
          <!-- <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">
              <n-icon size="24" color="#2563eb">
                <CameraOutline />
              </n-icon>
              <span class="brand-name">Photoreka</span>
            </div>
            <p class="footer-description">
              Discovery photo assistant and organization platform for creative
              professionals.
            </p>
          </div>
          <div class="footer-links">
            <div class="link-group">
              <h4 class="link-title">Product</h4>
              <a href="#" class="link">Features</a>
              <a href="#" class="link">Pricing</a>
              <a href="#" class="link">API</a>
            </div>
            <div class="link-group">
              <h4 class="link-title">Company</h4>
              <a href="#" class="link">About</a>
              <a href="#" class="link">Blog</a>
              <a href="#" class="link">Careers</a>
            </div>
            <div class="link-group">
              <h4 class="link-title">Support</h4>
              <a href="#" class="link">Help Center</a>
              <a href="#" class="link">Contact</a>
              <a href="#" class="link">Privacy</a>
            </div>
          </div>
        </div> -->
          <div class="footer-bottom">
            <p class="copyright">© 2024 Photoreka. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <!-- Request Access Dialog -->
      <RequestAccessDialog
        v-model:show="showRequestDialog"
        @success="onRequestSuccess"
      />

      <!-- Mobile Notice Dialog -->
      <MobileNoticeDialog
        v-model:show="showMobileNotice"
        @goHome="onMobileNoticeGoHome"
      />
    </div>
  </n-message-provider>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { NButton, NIcon, NAvatar, useMessage } from "naive-ui";
import {
  CameraOutline,
  RocketOutline,
  PlayOutline,
  PlayCircleOutline,
  SearchOutline,
  AppsOutline,
  ImagesOutline,
  ColorPaletteOutline,
  CloudUploadOutline,
  PersonOutline,
  LogInOutline,
} from "@vicons/ionicons5";
import { Workspace } from "@vicons/carbon";
import logoName from "@/assets/logo_name.png";
import RequestAccessDialog from "@/components/RequestAccessDialog.vue";
import MobileNoticeDialog from "@/components/MobileNoticeDialog.vue";
import { isMobileDevice } from "@/utils/utils.js";

const router = useRouter();
const demoSection = ref(null);
const videoPlayer = ref(null);
const videoPlaying = ref(false);
const activeTab = ref(0);
const videoProgress = ref(0);
const showRequestDialog = ref(false);
const showMobileNotice = ref(false);
const message = useMessage();

// Video tabs with different use cases
const videoTabs = ref([
  {
    title: "Canvas",
    icon: ColorPaletteOutline,
    videoUrl: new URL("@/assets/videos/canvas_1.mp4", import.meta.url).href, // local video
    speed: 1.9,
  },
  {
    title: "Explorer",
    icon: SearchOutline,
    videoUrl: new URL("@/assets/videos/explorer_1.mp4", import.meta.url).href, // local video
    speed: 1.5,
  },
  {
    title: "Project Builder",
    icon: ImagesOutline,
    videoUrl: new URL("@/assets/videos/project_builder_1.mp4", import.meta.url)
      .href, // local video
    speed: 3.0,
  },
  {
    title: "Grid Maker",
    icon: AppsOutline,
    videoUrl: new URL("@/assets/videos/grid_1.mp4", import.meta.url).href, // local video
    speed: 1.4,
  },
]);

const goToAuth = (mode = "login") => {
  if (mode === "signup") {
    showRequestDialog.value = true;
  } else if (mode === "login" && isMobileDevice()) {
    // Show mobile notice for login on mobile devices
    showMobileNotice.value = true;
  } else {
    router.push({ name: "auth", query: { mode } });
  }
};

const goToPlayground = () => {
  router.push({ name: "canvas-playground" });
};

const scrollToDemo = () => {
  demoSection.value?.scrollIntoView({ behavior: "smooth" });
};

const onRequestSuccess = () => {};

const onMobileNoticeGoHome = () => {
  // User is already on home page, just close the dialog
  showMobileNotice.value = false;
};

const setActiveTab = (index) => {
  console.log(`Setting active tab to: ${index}`);
  activeTab.value = index;
  videoProgress.value = 0;
  videoPlaying.value = false;

  if (videoPlayer.value) {
    videoPlayer.value.currentTime = 0;
    videoPlayer.value.load(); // Force reload the video

    // Wait a bit for the video to load, then play
    setTimeout(() => {
      videoPlayer.value
        .play()
        .then(() => {
          console.log("Video started playing");
          videoPlaying.value = true;
        })
        .catch((error) => {
          console.log("Error playing video:", error);
        });
    }, 200);
  }
};

const playVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value
      .play()
      .then(() => {
        videoPlaying.value = true;
      })
      .catch(console.log);
  }
};

const onVideoPlay = () => {
  videoPlaying.value = true;
};

const onVideoLoaded = () => {
  // Video is loaded and ready to play
  if (videoPlayer.value) {
    const currentTab = videoTabs.value[activeTab.value];
    videoPlayer.value.playbackRate = currentTab.speed || 1.0;
  }
  console.log("Video loaded successfully");
};

const updateProgress = () => {
  if (videoPlayer.value) {
    const progress =
      (videoPlayer.value.currentTime / videoPlayer.value.duration) * 100;
    videoProgress.value = progress || 0;
  }
};

const onVideoEnded = () => {
  console.log("Video ended, switching to next tab");
  videoProgress.value = 100;
  videoPlaying.value = false;

  // Auto-switch to next tab after video ends
  const nextTab = (activeTab.value + 1) % videoTabs.value.length;
  console.log(`Switching from tab ${activeTab.value} to tab ${nextTab}`);

  setTimeout(() => {
    setActiveTab(nextTab);
  }, 300);
};

// Watch for tab changes to reset video
watch(activeTab, () => {
  videoProgress.value = 0;
});

onMounted(() => {
  // Start playing the first video automatically after a short delay
  setTimeout(() => {
    if (videoPlayer.value) {
      videoPlayer.value
        .play()
        .then(() => {
          videoPlaying.value = true;
        })
        .catch(console.log);
    }
  }, 500);
});
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f13 0%, #16161a 100%);
  color: var(--text-primary);
  overflow-x: hidden;
  overflow-y: auto;
}

/* Navigation */
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(15, 15, 19, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
}

.nav-brand .logo {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex-shrink: 0;
}

.logo-image {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

/* Hero Section */
.hero-section {
  padding: 80px 0 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-subtitle {
  margin-top: 8px;
  display: block;
  font-size: 15px;
  color: var(--text-primary);
  font-style: italic;
}
.hero-title {
  font-size: 52px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 0px;
  color: var(--text-primary);
}

.hero-accent {
  background: linear-gradient(135deg, #2563eb, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 18px;
  line-height: 1.6;
  /* color: var(--text-secondary); */
  margin-bottom: 40px;
  margin-top: 30px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
  justify-content: center;
  align-items: center;
}

.hero-stats {
  display: flex;
  gap: 48px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 14px;
  color: var(--text-tertiary);
}

.hero-visual {
  position: relative;
  width: 100%;
  max-width: none;
}

.video-tabs-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.video-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 8px;
}

.video-tab {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.video-tab:hover {
  background: rgba(37, 99, 235, 0.1);
}

.video-tab.active {
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid var(--primary-color);
}

.tab-header {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.tab-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.video-tab.active .tab-title {
  color: var(--primary-color);
}

.tab-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(37, 99, 235, 0.2);
  border-radius: 0 0 8px 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #8b5cf6);
  border-radius: 0 0 8px 8px;
  transition: width 0.1s ease;
}

.video-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(37, 99, 235, 0.3);
  width: 100%;
  /* aspect-ratio: 5/ 7; */
}

.demo-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #111;
  display: block;
}

/* Specific styling for the first video (Canvas) to fill the container completely */

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-overlay:hover {
  background: rgba(0, 0, 0, 0.6);
}

/* Sections */
.features-section,
.how-it-works-section,
.testimonials-section,
.cta-section {
  padding-bottom: 60px;
  position: relative;
}

/* Floating Headers */
.floating-header {
  text-align: center;
  margin-bottom: 80px;
  padding: 0 24px;
}

.floating-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.floating-description {
  font-size: 18px;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* Floating Features */
.floating-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
  padding: 0 24px;
  width: 100%;
  box-sizing: border-box;
}

.floating-feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.4s ease;
  width: 320px;
  max-width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.floating-feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.05),
    rgba(139, 92, 246, 0.05)
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.floating-feature-card:hover::before {
  opacity: 1;
}

.floating-feature-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
}

/* Floating Steps */
.floating-steps {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 60px;
  padding: 0 24px;
  flex-wrap: wrap;
}

.floating-step {
  text-align: center;
  max-width: 300px;
  position: relative;
  background: rgba(37, 99, 235, 0.05);
  border-radius: 24px;
  padding: 40px 24px;
  transition: all 0.4s ease;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.floating-step:hover {
  transform: translateY(-6px);
  background: rgba(37, 99, 235, 0.1);
  border-color: var(--primary-color);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.2);
}

.floating-step:not(:last-child)::after {
  content: "→";
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: var(--primary-color);
  font-weight: bold;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.section-description {
  font-size: 18px;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* Features Grid (legacy - keeping for other sections) */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.2);
}

.feature-icon {
  margin-bottom: 24px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* How It Works */
.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 48px;
}

.step {
  text-align: center;
}

.step-number {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
  color: white;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.floating-step:hover .step-number {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.4);
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.step-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Testimonials */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.testimonial-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
}

.testimonial-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
}

.author-role {
  font-size: 14px;
  color: var(--text-tertiary);
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #2563eb, #8b5cf6);
  color: white;
}

.cta-content {
  text-align: center;
}

.cta-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-description {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 16px;
}

.cta-note {
  font-size: 14px;
  opacity: 0.8;
}

/* Footer */
.landing-footer {
  background: #0a0a0e;
  padding: 48px 0 24px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 48px;
  margin-bottom: 32px;
}

.footer-brand .logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.footer-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.link-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.link {
  display: block;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.2s ease;
}

.link:hover {
  color: var(--primary-color);
}

.footer-bottom {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.copyright {
  color: var(--text-tertiary);
  font-size: 14px;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .video-tabs {
    display: none; /* Hide video tabs on tablets and smaller */
  }

  .floating-features {
    gap: 24px;
    padding: 0 20px;
  }

  .floating-feature-card {
    width: calc(50% - 12px);
    min-width: 280px;
  }

  .nav-container {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .hero-content {
    gap: 40px;
  }

  .hero-title {
    font-size: 40px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-stats {
    justify-content: center;
    gap: 32px;
  }

  .video-tabs {
    flex-direction: column;
    gap: 4px;
    display: none; /* Hide video tabs on mobile */
  }

  .video-tab {
    padding: 8px 12px;
  }

  .tab-title {
    font-size: 12px;
  }

  .floating-title {
    font-size: 32px;
  }

  .floating-features {
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 0 16px;
    width: 100%;
    box-sizing: border-box;
  }

  .floating-feature-card {
    width: calc(100% - 32px);
    max-width: 400px;
    min-width: 0;
    box-sizing: border-box;
  }

  .floating-steps {
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 0 16px;
  }

  .floating-step {
    max-width: 100%;
  }

  .floating-step:not(:last-child)::after {
    content: "↓";
    right: 50%;
    transform: translateX(50%);
    top: auto;
    bottom: -20px;
  }

  .features-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .steps-container {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }

  .nav-container {
    padding: 0 16px;
    gap: 8px;
  }

  .nav-actions {
    gap: 8px;
  }

  .brand-name {
    font-size: 18px;
  }

  .section-container {
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .floating-features {
    padding: 0 12px;
  }

  .floating-feature-card {
    width: calc(100% - 24px);
    padding: 24px 20px;
  }

  .floating-header {
    padding: 0 12px;
  }

  .floating-steps {
    padding: 0 12px;
  }

  .nav-container {
    padding: 0 12px;
    height: 56px;
  }

  .nav-actions {
    gap: 6px;
  }

  .brand-name {
    font-size: 16px;
  }

  /* Hide login text on very small screens, keep only button */
  .nav-actions .n-button:first-child {
    display: none;
  }
}

@media (max-width: 360px) {
  .nav-container {
    padding: 0 8px;
  }

  .brand-name {
    font-size: 14px;
  }

  .nav-brand .logo {
    gap: 8px;
  }
}
</style>
