import { test, expect } from './fixtures/auth';
import { QuestionnaireHelper } from './helpers/questionnaire';

/**
 * Test E2E: Parcours Famille avec enfants
 * 
 * Scénario:
 * - Famille (2 adultes + 2 enfants)
 * - Destination: Nice, France
 * - Services: Hébergement uniquement
 * - Dates flexibles
 */
test.describe('Questionnaire E2E - Famille', () => {
  test('devrait compléter le parcours famille avec hébergement uniquement', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // ===== Groupe de voyage =====
    await helper.selectCard(/famille|family/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Nombre de voyageurs =====
    // Ajouter 2 adultes et 2 enfants
    const addAdultButton = page.getByRole('button', { name: /adulte|adult/i }).first();
    const addChildButton = page.getByRole('button', { name: /enfant|child/i }).first();
    
    // Ajouter un adulte supplémentaire (déjà 1 par défaut)
    await addAdultButton.click();
    await page.waitForTimeout(200);
    
    // Ajouter 2 enfants
    await addChildButton.click();
    await page.waitForTimeout(200);
    await addChildButton.click();
    await page.waitForTimeout(300);
    
    // Renseigner les âges des enfants
    const ageInputs = page.locator('input[type="number"]');
    await ageInputs.first().fill('8');
    await page.waitForTimeout(100);
    await ageInputs.last().fill('5');
    await page.waitForTimeout(200);
    
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Destination en tête =====
    await helper.selectCard(/oui|yes/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Services =====
    await helper.selectCard(/hébergement|accommodation/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Destination =====
    await helper.selectCity('Nice');
    await page.waitForTimeout(500);
    await helper.selectCity('Paris');
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Type de dates =====
    await helper.selectCard(/flexible/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Période approximative =====
    await helper.selectCard(/oui|yes/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Vers quand =====
    const monthButton = page.locator('button').filter({ hasText: /juillet|august|été|summer/i }).first();
    if (await monthButton.isVisible().catch(() => false)) {
      await monthButton.click();
    }
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Flexibilité =====
    await helper.selectCard(/flexible|très/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Durée =====
    await helper.selectCard(/7.*14|8.*14/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Budget =====
    await helper.selectCard(/600.*900|900.*1200/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Type d'hébergement =====
    await helper.selectCard(/appartement|apartment|maison|house/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Confort =====
    await helper.selectCard(/7|8/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Quartier =====
    await helper.selectCard(/familial|calme|family|quiet/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Équipements =====
    await helper.selectMultipleOptions([
      /wifi/i,
      /cuisine|kitchen/i,
      /lave.*linge|washing/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Zone ouverte =====
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== Récapitulatif =====
    await helper.expectReviewStep();
    
    // Vérifier les informations famille
    await expect(page.getByText(/famille|family/i)).toBeVisible();
    await expect(page.getByText(/4|quatre|four/i)).toBeVisible();
    await expect(page.getByText(/nice/i)).toBeVisible();
    
    await helper.submitQuestionnaire();
    await helper.expectSuccess();
  });
});
