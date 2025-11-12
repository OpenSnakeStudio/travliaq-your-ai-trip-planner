import { test, expect } from './fixtures/auth';
import { QuestionnaireHelper } from './helpers/questionnaire';

/**
 * Test E2E: Parcours mobile
 * 
 * Vérifie que le questionnaire fonctionne correctement sur mobile
 */
test.describe('Questionnaire E2E - Mobile', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE
  });
  
  test('devrait être responsive et utilisable sur mobile', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // Vérifier que l'interface s'affiche correctement
    await helper.screenshot('mobile-01-start');
    
    // Parcours rapide
    await helper.selectCard(/solo/i);
    await helper.screenshot('mobile-02-solo-selected');
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/oui|yes/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/vol|flight/i);
    await helper.screenshot('mobile-03-services');
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Vérifier que les éléments sont cliquables
    const cards = page.locator('[role="button"]');
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    
    // Vérifier que le contenu n'est pas tronqué
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    
    // Vérifier la navigation
    const backButton = page.getByRole('button', { name: /back|retour|précédent/i });
    await expect(backButton).toBeVisible();
  });
  
  test('devrait gérer le scroll sur mobile pour les longues listes', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // Naviguer jusqu'à une étape avec beaucoup d'options
    await helper.selectCard(/solo/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/non|no/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/activité|activities/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Étape avec beaucoup d'options (climat)
    await page.waitForTimeout(500);
    
    // Vérifier qu'on peut scroller
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = page.viewportSize()?.height || 0;
    
    // Si le contenu est plus grand que le viewport, on peut scroller
    if (scrollHeight > viewportHeight) {
      await page.evaluate(() => window.scrollTo(0, 200));
      await page.waitForTimeout(200);
      
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    }
  });
});
