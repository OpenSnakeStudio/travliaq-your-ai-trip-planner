# 🎭 Tests End-to-End avec Playwright - Questionnaire Travliaq

## 📋 Vue d'ensemble

Cette suite de tests E2E simule des parcours utilisateurs réels du questionnaire Travliaq, du début à la fin, dans de vrais navigateurs (Chrome, Firefox, Safari).

## ✅ Installation terminée

Playwright a été installé avec la configuration complète :
- ✅ `@playwright/test` - Framework de test E2E
- ✅ Configuration multi-navigateurs
- ✅ Support mobile (iOS & Android)
- ✅ Screenshots et vidéos automatiques
- ✅ Helpers personnalisés

## 🚀 Installation des navigateurs

**Important** : Avant de lancer les tests, installez les navigateurs Playwright :

```bash
npx playwright install
```

Cette commande télécharge Chrome, Firefox et Safari (WebKit).

## 📝 Scripts à ajouter dans package.json

Ajoutez ces scripts dans votre `package.json` :

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:chrome": "playwright test --project=chromium",
    "test:e2e:firefox": "playwright test --project=firefox",
    "test:e2e:mobile": "playwright test --project=mobile-chrome"
  }
}
```

## 🧪 Tests créés (6 fichiers)

### 1. **questionnaire-solo-complete.spec.ts**
- ✅ Parcours complet solo avec tous les services
- ✅ Test de navigation arrière et modification
- **Durée** : ~60-90 secondes
- **Étapes** : 21 étapes

### 2. **questionnaire-family.spec.ts**
- ✅ Parcours famille (2 adultes + 2 enfants)
- ✅ Hébergement uniquement
- ✅ Dates flexibles
- **Durée** : ~45-60 secondes
- **Étapes** : 14 étapes

### 3. **questionnaire-duo-no-destination.spec.ts**
- ✅ Parcours duo sans destination précise
- ✅ Recherche par climat et affinités
- ✅ Vols + Activités
- **Durée** : ~50-70 secondes
- **Étapes** : 17 étapes

### 4. **questionnaire-validation.spec.ts**
- ✅ Validation des champs obligatoires
- ✅ Messages d'erreur
- ✅ Format des dates
- ✅ Prévention soumission incomplète
- **Durée** : ~20-30 secondes par test

### 5. **questionnaire-mobile.spec.ts**
- ✅ Responsive design
- ✅ Scroll sur mobile
- ✅ Cliquabilité des éléments
- **Durée** : ~30-40 secondes par test

### 6. **Helpers & Fixtures**
- `helpers/questionnaire.ts` : Fonctions réutilisables
- `fixtures/auth.ts` : Gestion de l'authentification

## 🎯 Lancement des tests

### Mode de base
```bash
npm run test:e2e
```
Lance tous les tests sur tous les navigateurs.

### Interface graphique (recommandé)
```bash
npm run test:e2e:ui
```
Ouvre une interface interactive pour voir les tests en temps réel.

### Mode debug
```bash
npm run test:e2e:debug
```
Lance les tests en mode pas-à-pas pour déboguer.

### Mode visible (voir le navigateur)
```bash
npm run test:e2e:headed
```
Voir le navigateur s'exécuter en temps réel.

### Tests spécifiques

#### Un seul fichier
```bash
npx playwright test questionnaire-solo-complete
```

#### Un seul navigateur
```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:mobile
```

#### Un seul test
```bash
npx playwright test -g "devrait compléter le parcours solo"
```

## 📊 Rapports

### Voir le dernier rapport
```bash
npm run test:e2e:report
```

Ouvre un rapport HTML détaillé avec :
- ✅ Résultats par test
- 📸 Screenshots de chaque étape
- 🎥 Vidéos des échecs
- ⏱️ Temps d'exécution
- 📈 Traces complètes

### Localisation des rapports
- **Rapport HTML** : `playwright-report/index.html`
- **Screenshots** : `e2e/screenshots/`
- **Vidéos** : `test-results/`

## 🎨 Structure des tests

```
e2e/
├── fixtures/
│   └── auth.ts                          # Gestion authentification
├── helpers/
│   └── questionnaire.ts                 # Fonctions helper
├── questionnaire-solo-complete.spec.ts  # Parcours solo complet
├── questionnaire-family.spec.ts         # Parcours famille
├── questionnaire-duo-no-destination.spec.ts  # Duo sans destination
├── questionnaire-validation.spec.ts     # Tests de validation
└── questionnaire-mobile.spec.ts         # Tests mobile

playwright.config.ts                     # Configuration Playwright
E2E_TESTING.md                          # Cette documentation
```

## 🔧 Configuration

### Navigateurs testés
- ✅ **Chrome** (Chromium)
- ✅ **Firefox**
- ✅ **Safari** (WebKit)
- ✅ **Mobile Chrome** (Pixel 5)
- ✅ **Mobile Safari** (iPhone 12)

### Timeouts configurés
- **Test timeout** : 120 secondes (2 minutes)
- **Action timeout** : 10 secondes
- **Navigation timeout** : 30 secondes

### Retries
- **En local** : 0 (pas de retry)
- **En CI** : 2 (2 tentatives en cas d'échec)

## 💡 Bonnes pratiques

### Écrire un nouveau test

```typescript
import { test, expect } from './fixtures/auth';
import { QuestionnaireHelper } from './helpers/questionnaire';

test.describe('Mon nouveau test', () => {
  test('devrait faire quelque chose', async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const helper = new QuestionnaireHelper(page);
    
    await page.goto('/questionnaire');
    await helper.waitForStep();
    
    // Vos actions de test
    await helper.selectCard(/option/i);
    await helper.clickContinue();
    
    // Vérifications
    await expect(page.getByText(/succès/i)).toBeVisible();
  });
});
```

### Helpers disponibles

```typescript
// Navigation
await helper.clickContinue();
await helper.clickPrevious();
await helper.waitForStep();

// Sélection
await helper.selectCard(/texte/i);
await helper.selectRadioOption(/option/i);
await helper.selectMultipleOptions([/opt1/i, /opt2/i]);

// Ville et dates
await helper.selectCity('Paris');
await helper.selectDate(15);
await helper.selectDateRange(15, 22);

// Input
await helper.fillInput(/placeholder/i, 'valeur');

// Vérifications
await helper.expectReviewStep();
await helper.expectSuccess();

// Screenshots
await helper.screenshot('nom-etape');
```

## 🐛 Debugging

### Étape 1 : Mode UI
```bash
npm run test:e2e:ui
```
Voir les tests s'exécuter avec l'interface graphique.

### Étape 2 : Mode Debug
```bash
npm run test:e2e:debug
```
Pause à chaque étape pour inspecter.

### Étape 3 : Mode Headed
```bash
npm run test:e2e:headed
```
Voir le navigateur en action.

### Étape 4 : Examiner les traces
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Outils de debug dans le code

```typescript
// Pause le test pour inspecter
await page.pause();

// Console log
console.log('Debug info:', await page.title());

// Screenshot manuel
await page.screenshot({ path: 'debug.png' });

// Attendre pour observer
await page.waitForTimeout(5000);
```

## 📈 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🔍 Tests de régression

Après chaque modification du questionnaire :

1. **Lancez tous les tests E2E**
   ```bash
   npm run test:e2e
   ```

2. **Vérifiez le rapport**
   ```bash
   npm run test:e2e:report
   ```

3. **Si un test échoue**
   - Examinez les screenshots
   - Regardez la vidéo de l'échec
   - Vérifiez la trace complète

## 📊 Métriques attendues

### Temps d'exécution (référence)
- Solo complet : ~60-90s
- Famille : ~45-60s
- Duo sans destination : ~50-70s
- Validation : ~20-30s par test
- Mobile : ~30-40s par test

**Total** : ~10-15 minutes pour tous les tests sur tous les navigateurs

### Taux de réussite attendu
- **Objectif** : 100% ✅
- **Minimum acceptable** : 95%

## 🚨 Troubleshooting

### Problème : "Browser not found"
```bash
npx playwright install
```

### Problème : Tests trop lents
```bash
# Lancer sur un seul navigateur
npm run test:e2e:chrome
```

### Problème : Échecs aléatoires
- Augmenter les timeouts dans `playwright.config.ts`
- Ajouter plus de `waitForTimeout()` entre les actions
- Vérifier la stabilité du réseau

### Problème : Authentification échoue
- Vérifier la fixture `auth.ts`
- Adapter selon votre système d'authentification
- Utiliser des credentials de test dédiés

## 📚 Ressources

- **Documentation Playwright** : https://playwright.dev
- **Best Practices** : https://playwright.dev/docs/best-practices
- **API Reference** : https://playwright.dev/docs/api/class-test

## ✨ Avantages des tests E2E

- ✅ **Confiance totale** : Tests dans de vrais navigateurs
- ✅ **Détection précoce** : Bugs trouvés avant la production
- ✅ **Cross-browser** : Fonctionne sur tous les navigateurs
- ✅ **Mobile-ready** : Tests sur iOS et Android
- ✅ **Screenshots/Vidéos** : Debug facilité
- ✅ **CI/CD Ready** : Automatisation complète

## 🎯 Prochaines étapes

1. ✅ Installer les navigateurs : `npx playwright install`
2. ✅ Ajouter les scripts dans `package.json`
3. ✅ Lancer les tests : `npm run test:e2e:ui`
4. ✅ Examiner le rapport : `npm run test:e2e:report`
5. ✅ Intégrer dans votre CI/CD

---

**Status** : ✅ Prêt à l'emploi
**Mainteneur** : Équipe Travliaq
**Dernière mise à jour** : 2024
