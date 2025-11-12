import { test as base } from '@playwright/test';
import { Page } from '@playwright/test';

/**
 * Fixture d'authentification pour les tests E2E
 * Permet de créer un utilisateur de test et de se connecter automatiquement
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigation vers la page d'authentification
    await page.goto('/auth');
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    
    // Option 1: Authentification via email/password (si disponible)
    // Vérifier si le formulaire d'email existe
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(`test-e2e-${Date.now()}@travliaq.com`);
      await passwordInput.fill('TestPassword123!');
      
      // Cliquer sur le bouton de connexion/inscription
      const submitButton = page.getByRole('button', { name: /sign in|sign up|connexion|inscription/i }).first();
      await submitButton.click();
      
      // Attendre la redirection
      await page.waitForURL(/\/questionnaire|\//, { timeout: 30000 });
    }
    
    // Option 2: Si pas d'auth disponible, continuer directement
    // Note: Adapter selon votre système d'authentification
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
