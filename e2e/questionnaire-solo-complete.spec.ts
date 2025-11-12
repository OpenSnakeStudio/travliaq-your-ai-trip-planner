import { test, expect } from './fixtures/auth';
import { QuestionnaireHelper } from './helpers/questionnaire';

/**
 * Test E2E: Parcours complet Solo avec destination et tous les services
 * 
 * Scénario:
 * - Voyageur solo
 * - Destination: Paris
 * - Services: Vols + Hébergement + Activités
 * - Dates précises
 * - Budget: 1000-1500€
 */
test.describe('Questionnaire E2E - Solo Complet', () => {
  test('devrait compléter le parcours solo avec tous les services', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    // Naviguer vers le questionnaire
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // ===== ÉTAPE 1: Groupe de voyage =====
    await helper.screenshot('01-group-selection');
    await helper.selectCard(/solo/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 2: Destination en tête =====
    await helper.screenshot('02-has-destination');
    await helper.selectCard(/oui|yes/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 3: Comment pouvons-nous aider =====
    await helper.screenshot('03-help-with');
    await helper.selectMultipleOptions([
      /vol|flight/i,
      /hébergement|accommodation/i,
      /activité|activities/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 4: Quelle destination =====
    await helper.screenshot('04-destination');
    await helper.selectCity('Paris');
    await page.waitForTimeout(500);
    
    // Ville de départ
    await helper.selectCity('Lyon');
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 5: Type de dates =====
    await helper.screenshot('05-dates-type');
    await helper.selectCard(/précise|exact|fixed/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 6: Sélection des dates =====
    await helper.screenshot('06-dates-selection');
    // Ouvrir le calendrier et sélectionner des dates
    const calendarButton = page.locator('button').filter({ hasText: /choisir|pick|select/i }).first();
    if (await calendarButton.isVisible().catch(() => false)) {
      await calendarButton.click();
      await page.waitForTimeout(500);
    }
    
    // Sélectionner une plage de dates (par exemple jour 15 au 22)
    await helper.selectDateRange(15, 22);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 7: Budget =====
    await helper.screenshot('07-budget');
    await helper.selectCard(/1000.*1500|1200.*1800/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 8: Style d'activités =====
    await helper.screenshot('08-styles');
    await helper.selectMultipleOptions([
      /culture/i,
      /gastronomie/i,
      /musée/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 9: Préférence de vol =====
    await helper.screenshot('09-flight-preference');
    await helper.selectCard(/direct|meilleur/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 10: Bagages =====
    await helper.screenshot('10-luggage');
    await helper.selectCard(/cabine.*soute|checked/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 11: Mobilité =====
    await helper.screenshot('11-mobility');
    await helper.selectMultipleOptions([
      /marche|walk/i,
      /métro|metro|train/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 12: Type d'hébergement =====
    await helper.screenshot('12-accommodation-type');
    await helper.selectCard(/hôtel|hotel/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 13: Préférences hôtel =====
    await helper.screenshot('13-hotel-preferences');
    await helper.selectMultipleOptions([
      /petit.*déjeuner|breakfast/i,
      /wifi/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 14: Confort =====
    await helper.screenshot('14-comfort');
    await helper.selectCard(/7.*8|8/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 15: Quartier =====
    await helper.screenshot('15-neighborhood');
    await helper.selectCard(/centre|center/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 16: Équipements =====
    await helper.screenshot('16-amenities');
    await helper.selectMultipleOptions([
      /wifi/i,
      /climatisation|air.*conditioning/i
    ]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 17: Sécurité =====
    await helper.screenshot('17-security');
    await helper.selectCard(/aucune|no.*particular|zones.*sécurisées/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 18: Rythme =====
    await helper.screenshot('18-rhythm');
    await helper.selectCard(/équilibr|balanced/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE 19: Zone ouverte (optionnel) =====
    await helper.screenshot('19-open-zone');
    const openTextarea = page.locator('textarea').first();
    if (await openTextarea.isVisible().catch(() => false)) {
      await openTextarea.fill('Test E2E: Parcours solo complet avec tous les services');
    }
    await helper.clickContinue();
    await helper.waitForStep();
    
    // ===== ÉTAPE FINALE: Récapitulatif =====
    await helper.screenshot('20-review');
    await helper.expectReviewStep();
    
    // Vérifier que les informations principales sont affichées
    await expect(page.getByText(/solo/i)).toBeVisible();
    await expect(page.getByText(/paris/i)).toBeVisible();
    
    // Soumettre le questionnaire
    await helper.submitQuestionnaire();
    
    // ===== VÉRIFICATION SUCCÈS =====
    await helper.screenshot('21-success');
    await helper.expectSuccess();
    
    // Vérifier l'URL de redirection (si applicable)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('✅ Questionnaire soumis avec succès. URL actuelle:', currentUrl);
  });
  
  test('devrait permettre de naviguer en arrière et modifier les réponses', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // Avancer de quelques étapes
    await helper.selectCard(/solo/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectCard(/oui|yes/i);
    await helper.clickContinue();
    await helper.waitForStep();
    
    await helper.selectMultipleOptions([/vol|flight/i]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Retour en arrière
    await helper.clickPrevious();
    await helper.waitForStep();
    
    // Modifier la sélection
    await helper.selectMultipleOptions([/hébergement|accommodation/i]);
    await helper.clickContinue();
    await helper.waitForStep();
    
    // Vérifier que la modification est prise en compte
    await expect(page.getByText(/hébergement|accommodation/i)).toBeVisible();
  });
});
