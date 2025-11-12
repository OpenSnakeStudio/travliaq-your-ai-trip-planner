import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E du questionnaire Travliaq
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  // Timeout maximum pour chaque test (parcours complet du questionnaire)
  timeout: 120000, // 2 minutes
  
  // Nombre de tentatives en cas d'échec
  retries: process.env.CI ? 2 : 0,
  
  // Exécution parallèle des tests
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list']
  ],
  
  // Configuration globale pour tous les tests
  use: {
    // URL de base de l'application
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',
    
    // Trace complète en cas d'échec
    trace: 'retain-on-failure',
    
    // Screenshots en cas d'échec
    screenshot: 'only-on-failure',
    
    // Vidéos en cas d'échec
    video: 'retain-on-failure',
    
    // Timeout pour les actions
    actionTimeout: 10000,
    
    // Timeout pour la navigation
    navigationTimeout: 30000,
  },
  
  // Configuration des différents navigateurs
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    // Tests mobile
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5']
      },
    },
    
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12']
      },
    },
  ],
  
  // Serveur de développement local
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
