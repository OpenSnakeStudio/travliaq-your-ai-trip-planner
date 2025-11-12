import { test, expect } from './fixtures/auth';
import { QuestionnaireHelper } from './helpers/questionnaire';

/**
 * Test E2E: Validation des champs obligatoires
 * 
 * Vérifie que le questionnaire empêche de continuer sans remplir les champs requis
 */
test.describe('Questionnaire E2E - Validation', () => {
  test('ne devrait pas permettre de continuer sans sélectionner de groupe', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // Essayer de continuer sans sélection
    const continueButton = page.getByRole('button', { name: /continue|continuer/i }).first();
    
    // Le bouton devrait être désactivé ou ne pas naviguer
    const isDisabled = await continueButton.isDisabled().catch(() => true);
    
    if (!isDisabled) {
      await continueButton.click();
      await page.waitForTimeout(500);
      
      // Vérifier qu'on est toujours sur la première étape
      await expect(page.getByText(/groupe.*voyage|travel.*group|qui.*voyage/i)).toBeVisible();
    } else {
      // Le bouton est désactivé, c'est bon
      expect(isDisabled).toBe(true);
    }
  });
  
  test('devrait afficher un message d\'erreur pour champs manquants', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // Sélectionner solo
    await helper.selectCard(/solo/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Sélectionner "oui" pour destination
    await helper.selectCard(/oui|yes/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Sélectionner des services
    await helper.selectCard(/vol|flight/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // NE PAS remplir la destination
    // Essayer de continuer
    const continueButton = page.getByRole('button', { name: /continue|continuer/i }).first();
    await continueButton.click();
    await page.waitForTimeout(500);
    
    // Vérifier le message d'erreur ou le toast
    const errorMessage = page.getByText(/requis|required|obligatoire|please.*answer/i);
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Soit un message d'erreur, soit le bouton est désactivé
    if (!hasError) {
      const isDisabled = await continueButton.isDisabled();
      expect(isDisabled).toBe(true);
    } else {
      expect(hasError).toBe(true);
    }
  });
  
  test('devrait valider le format des dates', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // Navigation rapide jusqu'aux dates
    await helper.selectCard(/solo/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/oui|yes/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/hébergement|accommodation/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCity('Nice');
    await page.waitForTimeout(300);
    await helper.selectCity('Paris');
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Sélectionner dates précises
    await helper.selectCard(/précise|exact|fixed/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Ne pas sélectionner de dates et essayer de continuer
    const continueButton = page.getByRole('button', { name: /continue|continuer/i }).first();
    const isDisabled = await continueButton.isDisabled();
    
    // Le bouton devrait être désactivé sans dates
    expect(isDisabled).toBe(true);
  });
  
  test('devrait empêcher la soumission avec des données incomplètes', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // Remplir partiellement le questionnaire
    await helper.selectCard(/solo/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/non|no/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/activité|activities/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Essayer de "hacker" vers l'étape finale
    // (En principe impossible via l'interface, mais test de sécurité)
    await page.goto('/questionnaire?step=999');
    await page.waitForTimeout(500);
    
    // Le système devrait nous rediriger ou bloquer
    const url = page.url();
    expect(url).not.toContain('step=999');
  });
});
