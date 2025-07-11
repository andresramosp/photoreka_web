<template>
  <div class="landing-page">
    <!-- Navigation Header -->
    <nav class="landing-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="logo">
            <n-icon size="28" color="#2563eb">
              <CameraOutline />
            </n-icon>
            <span class="brand-name">Photoreka</span>
          </div>
        </div>
        <div class="nav-actions">
          <n-button text @click="goToAuth('login')"> Login </n-button>
          <n-button type="primary" @click="goToAuth('signup')">
            Sign Up
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
              AI-Powered Photo Discovery
              <span class="hero-accent">Made Simple</span>
            </h1>
            <p class="hero-description">
              Transform your photo library with intelligent organization,
              powerful search capabilities, and creative tools. Discover hidden
              gems in your collection and create stunning visual stories.
            </p>
            <div class="hero-actions">
              <n-button type="primary" size="large" @click="goToAuth('signup')">
                <template #icon>
                  <n-icon><RocketOutline /></n-icon>
                </template>
                Start Free Trial
              </n-button>
              <n-button size="large" quaternary @click="scrollToDemo">
                <template #icon>
                  <n-icon><PlayOutline /></n-icon>
                </template>
                Watch Demo
              </n-button>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <span class="stat-number">10K+</span>
                <span class="stat-label">Photos Organized</span>
              </div>
              <div class="stat">
                <span class="stat-number">500+</span>
                <span class="stat-label">Happy Users</span>
              </div>
              <div class="stat">
                <span class="stat-number">99%</span>
                <span class="stat-label">Accuracy Rate</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="video-container" ref="demoSection">
              <video
                class="demo-video"
                :src="demoVideoUrl"
                controls
                @play="onVideoPlay"
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
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            Powerful Features for Photo Professionals
          </h2>
          <p class="section-description">
            Everything you need to organize, discover, and enhance your photo
            collection
          </p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <n-icon size="40" color="#2563eb">
                <SearchOutline />
              </n-icon>
            </div>
            <h3 class="feature-title">AI-Powered Search</h3>
            <p class="feature-description">
              Find photos instantly using natural language. Search for "sunset
              beach" or "happy moments" and discover exactly what you're looking
              for.
            </p>
          </div>
          <div class="feature-card">
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
          <div class="feature-card">
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
          <div class="feature-card">
            <div class="feature-icon">
              <n-icon size="40" color="#f59e0b">
                <ImagesOutline />
              </n-icon>
            </div>
            <h3 class="feature-title">Smart Curation</h3>
            <p class="feature-description">
              Let AI automatically curate your best photos based on composition,
              lighting, and emotional impact. Save hours of manual sorting.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <n-icon size="40" color="#ef4444">
                <ColorPaletteOutline />
              </n-icon>
            </div>
            <h3 class="feature-title">Style Transfer</h3>
            <p class="feature-description">
              Apply artistic styles to your photos with advanced AI. Transform
              ordinary photos into artistic masterpieces with one click.
            </p>
          </div>
          <div class="feature-card">
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
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">How Photoreka Works</h2>
          <p class="section-description">
            Get started in minutes with our simple 3-step process
          </p>
        </div>
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">Upload Your Photos</h3>
              <p class="step-description">
                Simply drag and drop your photos or connect your existing photo
                library. We support all major formats and cloud storage
                providers.
              </p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">AI Analysis</h3>
              <p class="step-description">
                Our advanced AI analyzes your photos for content, quality, and
                emotional impact. This process creates searchable tags and
                intelligent organization.
              </p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">Discover & Create</h3>
              <p class="step-description">
                Use powerful search, create stunning layouts, and discover
                hidden gems in your collection. Share your creations with the
                world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
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
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
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
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">
              <n-icon size="24" color="#2563eb">
                <CameraOutline />
              </n-icon>
              <span class="brand-name">Photoreka</span>
            </div>
            <p class="footer-description">
              AI-powered photo discovery and organization platform for creative
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
        </div>
        <div class="footer-bottom">
          <p class="copyright">© 2024 Photoreka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { NButton, NIcon, NAvatar } from "naive-ui";
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

const router = useRouter();
const demoSection = ref(null);
const videoPlaying = ref(false);

// Video URL from Pexels
const demoVideoUrl =
  "https://videos.pexels.com/video-files/15162384/15162384-hd_720_1280_30fps.mp4";

const goToAuth = (mode = "login") => {
  router.push({ name: "auth", query: { mode } });
};

const scrollToDemo = () => {
  demoSection.value?.scrollIntoView({ behavior: "smooth" });
};

const playVideo = () => {
  const video = demoSection.value?.querySelector("video");
  if (video) {
    video.play();
  }
};

const onVideoPlay = () => {
  videoPlaying.value = true;
};

onMounted(() => {
  // Any initialization logic here
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
}

.nav-brand .logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Hero Section */
.hero-section {
  padding: 120px 0 80px;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
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
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
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
}

.video-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(37, 99, 235, 0.3);
}

.demo-video {
  width: 100%;
  height: auto;
  display: block;
}

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
  padding: 80px 0;
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

/* Features Grid */
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
  background: var(--primary-color);
  color: white;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
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
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
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

  .section-title {
    font-size: 32px;
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
  }

  .section-container {
    padding: 0 16px;
  }
}
</style>
