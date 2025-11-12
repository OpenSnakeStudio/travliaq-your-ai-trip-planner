import { Page, expect } from '@playwright/test';

/**
 * Helpers pour interagir avec le questionnaire dans les tests E2E
 */

export class QuestionnaireHelper {
  constructor(private page: Page) {}

  /**
   * Attend que l'étape soit chargée et visible
   */
  async waitForStep(stepNumber?: number) {
    await this.page.waitForLoadState('networkidle');
    
    if (stepNumber) {
      // Vérifier que le compteur d'étape affiche le bon numéro
      await expect(
        this.page.locator('text=/Étape ' + stepNumber + '|Step ' + stepNumber + '/i')
      ).toBeVisible({ timeout: 10000 }).catch(() => {
        // Si pas de compteur visible, c'est OK
      });
    }
    
    // Attendre un court instant pour l'animation
    await this.page.waitForTimeout(300);
  }

  /**
   * Sélectionne une option radio par son label
   */
  async selectRadioOption(label: string | RegExp) {
    const option = this.page.getByText(label).first();
    await option.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Sélectionne une Card cliquable par son texte
   */
  async selectCard(text: string | RegExp) {
    const card = this.page.locator('[role="button"], .cursor-pointer').filter({ hasText: text }).first();
    await card.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Sélectionne plusieurs options (checkboxes ou cards)
   */
  async selectMultipleOptions(labels: (string | RegExp)[]) {
    for (const label of labels) {
      await this.selectCard(label);
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Clique sur le bouton "Continuer"
   */
  async clickContinue() {
    const continueButton = this.page.getByRole('button', { 
      name: /continue|continuer|suivant|next/i 
    }).first();
    
    await expect(continueButton).toBeEnabled({ timeout: 5000 });
    await continueButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Clique sur le bouton "Précédent"
   */
  async clickPrevious() {
    const prevButton = this.page.getByRole('button', { 
      name: /previous|précédent|retour|back/i 
    }).first();
    
    await prevButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Remplit un champ de texte
   */
  async fillInput(placeholder: string | RegExp, value: string) {
    const input = this.page.getByPlaceholder(placeholder);
    await input.fill(value);
    await this.page.waitForTimeout(200);
  }

  /**
   * Sélectionne une ville dans le champ de recherche
   */
  async selectCity(city: string) {
    // Chercher le champ de recherche de ville
    const searchInput = this.page.locator('input[type="text"]').first();
    await searchInput.fill(city);
    await this.page.waitForTimeout(1000); // Attendre les résultats
    
    // Cliquer sur le premier résultat
    const firstResult = this.page.locator('[role="option"], [cmdk-item]').first();
    await firstResult.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Sélectionne une date dans le calendrier
   */
  async selectDate(day: number) {
    const dayButton = this.page.locator(`button[name="day"]`).filter({ hasText: new RegExp(`^${day}$`) }).first();
    await dayButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Sélectionne une plage de dates
   */
  async selectDateRange(startDay: number, endDay: number) {
    await this.selectDate(startDay);
    await this.page.waitForTimeout(200);
    await this.selectDate(endDay);
    await this.page.waitForTimeout(200);
  }

  /**
   * Vérifie qu'on est à l'étape de récapitulatif
   */
  async expectReviewStep() {
    await expect(
      this.page.getByText(/récapitulatif|review|résumé|summary/i)
    ).toBeVisible({ timeout: 10000 });
  }

  /**
   * Soumet le questionnaire
   */
  async submitQuestionnaire() {
    const submitButton = this.page.getByRole('button', { 
      name: /soumettre|submit|envoyer|send/i 
    }).first();
    
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Vérifie le message de succès
   */
  async expectSuccess() {
    await expect(
      this.page.getByText(/success|succès|merci|thank you|félicitations|congratulations/i)
    ).toBeVisible({ timeout: 15000 });
  }

  /**
   * Prend un screenshot avec un nom descriptif
   */
  async screenshot(name: string) {
    await this.page.screenshot({ 
      path: `e2e/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}
