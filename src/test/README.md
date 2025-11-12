# 🧪 Tests Unitaires du Questionnaire Travliaq

## 📋 Vue d'ensemble

Cette suite de tests professionnels vérifie la cohérence, la logique et l'intégrité des données du questionnaire Travliaq, avec un focus particulier sur la synchronisation entre les fonctions critiques et la normalisation des données.

## 🎯 Fichiers de tests

1. **`questionnaire.test.tsx`** : Tests de validation de tous les flux utilisateurs possibles
2. **`questionnaire-submission.test.tsx`** : Tests de normalisation et soumission des données
3. **`questionnaire-data-integrity.test.tsx`** : Tests d'intégrité des constantes et codes internes

## 📦 Installation

Les dépendances de test ont déjà été installées :
- `vitest` : Framework de test rapide et moderne
- `@testing-library/react` : Utilitaires pour tester React
- `@testing-library/jest-dom` : Matchers personnalisés pour le DOM
- `@vitest/ui` : Interface graphique pour les tests
- `jsdom` : Environnement DOM pour Node.js

## 🚀 Lancement des tests

### Mode watch (recommandé en développement)
```bash
npm test
```
Les tests se relanceront automatiquement à chaque modification.

### Interface graphique
```bash
npm run test:ui
```
Ouvre une interface web interactive pour explorer et exécuter les tests.

### Exécution unique (CI/CD)
```bash
npm run test:run
```
Lance tous les tests une seule fois et affiche le résultat.

### Avec couverture de code
```bash
npm run test:coverage
```
Génère un rapport HTML de couverture dans `coverage/index.html`.

### Tests spécifiques
```bash
# Tests de soumission uniquement
npm run test -- questionnaire-submission

# Tests d'intégrité uniquement
npm run test -- questionnaire-data-integrity

# Tests de logique uniquement
npm run test -- questionnaire.test
```

## 📊 Tests disponibles

### 1. Tests de logique et cohérence (questionnaire.test.tsx)

Suite de 12 tests vérifiant tous les flux utilisateurs possibles :

1. **Solo avec destination et tous services** (21 étapes)
2. **Duo sans destination avec dates flexibles** (17 étapes)
3. **Famille avec hébergement uniquement** (14 étapes)
4. **Groupe avec budget >1800€** (19 étapes)
5. **Activités uniquement** (13 étapes)
6. **Vols uniquement** (11 étapes)
7. **Dates flexibles >14 nuits** (19 étapes)
8. **Hôtel avec repas** (15 étapes)
9. **Hôtel sans repas** (14 étapes)
10. **Scénario complet maximal** (27 étapes)
11. **Hébergement seul** (13 étapes)
12. **Activités sans hébergement** (13 étapes)

+ 3 tests de validation des données

### 2. Tests de normalisation (questionnaire-submission.test.tsx)

Tests vérifiant la normalisation des données du questionnaire :

✅ **Groupe de voyage** : `SOLO`, `DUO`, `GROUP35`, `FAMILY`
✅ **Services demandés** : `FLIGHTS`, `ACCOMMODATION`, `ACTIVITIES`
✅ **Préférences climatiques** : 6 options + "peu importe"
✅ **Affinités de voyage** : 17 types d'activités + "peu importe"
✅ **Ambiance recherchée** : 6 types d'ambiance
✅ **Styles d'activités** : 10 styles différents
✅ **Mobilité** : 11 moyens de transport + "peu importe"
✅ **Type d'hébergement** : 9 types + "peu importe"
✅ **Équipements** : 13 équipements + "peu importe"
✅ **Contraintes** : 15 types de contraintes
✅ **Niveau de confort** : 5 niveaux
✅ **Rythme** : 3 rythmes
✅ **Préférences horaires** : 6 préférences
✅ **Préférences de vol** : 5 options
✅ **Bagages** : 4 options

**Objectifs** :
- Vérifier que toutes les valeurs sont normalisées en codes internes
- Garantir l'indépendance linguistique (FR/EN produisent les mêmes codes)
- Valider la structure complète des données de soumission
- S'assurer que tous les champs requis sont présents

### 3. Tests d'intégrité (questionnaire-data-integrity.test.tsx)

Tests vérifiant l'intégrité des constantes :

- **Constantes complètes** : Toutes les options sont définies
- **Pas de doublons** : Valeurs uniques dans chaque groupe
- **Format snake_case** : Respect de la convention de nommage
- **Nombre d'options** : Chaque catégorie a le bon nombre d'options
- **Compatibilité arrière** : Les anciens codes restent disponibles

**Objectifs** :
- Détecter immédiatement les codes manquants ou mal formatés
- Documenter les valeurs acceptées
- Garantir la cohérence des données en base

## 🔍 Structure des fichiers de test

```typescript
src/test/
├── setup.ts                              # Configuration globale des tests
├── questionnaire.test.tsx                # Tests de logique et flux utilisateurs
├── questionnaire-submission.test.tsx     # Tests de normalisation des données
├── questionnaire-data-integrity.test.tsx # Tests d'intégrité des constantes
└── README.md                             # Ce fichier
```

## 🎨 Bonnes pratiques

### Écrire un nouveau test

```typescript
describe('Test X: Description du scénario', () => {
  it('doit calculer correctement...', () => {
    const answers: QuestionnaireAnswers = {
      travelGroup: TRAVEL_GROUPS.SOLO,
      hasDestination: YES_NO.YES,
      // ... autres réponses
    };
    
    const totalSteps = calculateTotalSteps(answers);
    
    // Commentaire expliquant le calcul attendu
    expect(totalSteps).toBe(15);
  });
});
```

### Règles importantes

1. **Commentez le calcul** : Expliquez comment vous arrivez au nombre d'étapes
2. **Testez les cas limites** : Scénarios minimaux et maximaux
3. **Un test = un scénario** : Ne testez qu'une chose à la fois
4. **Noms explicites** : Le titre doit expliquer ce qui est testé

## 🐛 Debugging

Si un test échoue :

1. **Lisez le message d'erreur** : Il indique quel nombre était attendu vs reçu
2. **Vérifiez la logique** : Relisez `getTotalSteps()` dans `Questionnaire.tsx`
3. **Tracez manuellement** : Comptez les étapes selon les conditions
4. **Utilisez l'UI** : `npm run test:ui` pour débugger visuellement

## 📈 Couverture de code

Pour vérifier la couverture :
```bash
npm run test:coverage
open coverage/index.html
```

**Objectif** : Maintenir une couverture >80% sur les fonctions critiques.

## 🔄 Maintenance

Après chaque modification du questionnaire :

1. **Exécutez les tests** : `npm test`
2. **Corrigez les tests cassés** : Mettez à jour les attentes si la logique a changé
3. **Ajoutez de nouveaux tests** : Si de nouvelles conditions sont ajoutées
4. **Vérifiez la cohérence** : Assurez-vous que tous les tests passent

## 💡 Notes importantes

- Les tests utilisent la fonction `calculateTotalSteps()` qui réplique la logique de `getTotalSteps()` du questionnaire
- Cette approche permet de tester la logique indépendamment du composant React
- Les tests ne testent PAS le rendu visuel, seulement la logique métier

## 🚨 En cas de régression détectée

Si un test échoue après une modification :

1. ✅ **C'est une bonne chose !** Le test a fait son travail
2. 🔍 **Analysez** : Le changement était-il intentionnel ?
3. 🔧 **Corrigez** : Soit le code, soit le test (selon le cas)
4. ✅ **Vérifiez** : Tous les tests doivent passer avant commit

## 📞 Support

En cas de questions sur les tests :
- Consultez la documentation Vitest : https://vitest.dev
- Consultez Testing Library : https://testing-library.com

---

**Dernière mise à jour** : 2024
**Mainteneur** : Équipe Travliaq
