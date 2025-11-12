import { test, expect } from './fixtures/auth';
import { QuestionnaireHelper } from './helpers/questionnaire';

/**
 * Test E2E: Parcours Duo sans destination précise
 * 
 * Scénario:
 * - Duo
 * - Pas de destination en tête
 * - Services: Vols + Activités
 * - Climat et affinités
 */
test.describe('Questionnaire E2E - Duo sans destination', () => {
  test('devrait compléter le parcours duo sans destination avec critères de recherche', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // ===== Groupe =====
    await helper.selectCard(/duo|couple/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Destination en tête =====
    await helper.selectCard(/non|no/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Services =====
    await helper.selectMultipleOptions([
      /vol|flight/i,
      /activité|activities/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Climat =====
    await helper.selectMultipleOptions([
      /chaud|hot|tropical/i,
      /tempéré|temperate/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Affinités =====
    await helper.selectMultipleOptions([
      /plage|beach/i,
      /culture/i,
      /nature/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Ambiance =====
    await helper.selectCard(/romantique|romantic|relaxant|relaxing/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Ville de départ =====
    await helper.selectCity('Paris');
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Type de dates =====
    await helper.selectCard(/flexible/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Période approximative =====
    await helper.selectCard(/non|no/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Flexibilité =====
    await helper.selectCard(/très.*flexible|very.*flexible/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Durée =====
    await helper.selectCard(/7.*14/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Budget =====
    await helper.selectCard(/1200.*1800/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Préférence vol =====
    await helper.selectCard(/prix|price|cheap/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Bagages (2 voyageurs) =====
    const luggageOptions = page.locator('[role="button"]').filter({ hasText: /cabine|cabin/i });
    await luggageOptions.first().click();
    await page.waitForTimeout(200);
    
    // Pour le deuxième voyageur
    const nextLuggageButton = page.getByRole('button', { name: /suivant|next|continuer/i }).first();
    if (await nextLuggageButton.isVisible().catch(() => false)) {
      await nextLuggageButton.click();
      await page.waitForTimeout(300);
      await luggageOptions.first().click();
    }
    
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Mobilité =====
    await helper.selectMultipleOptions([
      /marche|walk/i,
      /vélo|bike/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Sécurité =====
    await helper.selectCard(/zones.*sécurisées|safe.*areas|aucune/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Rythme =====
    await helper.selectCard(/relaxé|relaxed|équilibré|balanced/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Zone ouverte =====
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('Recherche d\'une destination romantique et ensoleillée');
    }
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Récapitulatif =====
    await helper.expectReviewStep();
    
    await expect(page.getByText(/duo|couple/i)).toBeVisible();
    await expect(page.getByText(/chaud|tropical|tempéré/i)).toBeVisible();
    
    await helper.submitQuestionnaire();
    await helper.expectSuccess();
  });
});
