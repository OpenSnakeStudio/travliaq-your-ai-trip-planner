# ✅ Validation et Test Sentry - Questionnaire Travliaq

## 🐛 Bug identifié et corrigé

### Problème initial

**Étape bloquée** : "Nombre de personnes" (Step 2)  
**Symptôme** : L'utilisateur ne pouvait pas continuer, sans message d'erreur visible, et aucun log Sentry

### Cause du bug

La validation dans `canProceedToNextStep()` ne vérifiait que :
```typescript
return !!answers.numberOfTravelers && answers.numberOfTravelers > 0;
```

**Ce qui manquait :**
1. ✅ Vérifier qu'il y a au moins **1 adulte** (obligatoire)
2. ✅ Vérifier que **tous les enfants ont un âge valide** (1-17 ans)
3. ✅ Messages d'erreur explicites pour l'utilisateur
4. ✅ Logs Sentry détaillés avec contexte complet

## ✅ Correctifs appliqués

### 1. Validation améliorée (lignes 833-862 de Questionnaire.tsx)

```typescript
// Pour FAMILLE avec le système travelers
if (normalizedGroup === TRAVEL_GROUPS.FAMILY && answers.travelers) {
  const adults = answers.travelers.filter(t => t.type === 'adult').length;
  const children = answers.travelers.filter(t => t.type === 'child');
  
  // ❌ Au moins 1 adulte obligatoire
  if (adults === 0) {
    return false;
  }
  
  // ❌ Tous les enfants doivent avoir un âge valide
  const invalidChildren = children.filter(c => !c.age || c.age <= 0 || c.age > 17);
  if (invalidChildren.length > 0) {
    return false;
  }
  
  return answers.travelers.length > 0;
}
```

### 2. Messages d'erreur contextuels (lignes 1073-1095)

```typescript
// Messages spécifiques selon le problème
if (adults === 0) {
  errorMessage = `Validation échouée: Aucun adulte dans le groupe`;
  userMessage = 'Au moins un adulte est requis pour voyager';
} else if (invalidChildren.length > 0) {
  errorMessage = `Validation échouée: ${invalidChildren.length} enfant(s) sans âge valide`;
  userMessage = 'Veuillez renseigner l\'âge de tous les enfants (1-17 ans)';
}
```

### 3. Logging Sentry enrichi

**Contexte complet envoyé à Sentry :**
- Numéro de l'étape et nom
- Données des voyageurs (adultes, enfants, âges)
- Type de groupe (Famille, Duo, Solo, Groupe)
- Services sélectionnés
- User agent, viewport, langue
- Timestamp précis
- Type d'erreur (validation_failed)

## 🧪 Page de test Sentry créée

### Accès : `/sentry-test`

Une page de développement complète a été créée pour tester Sentry :

**URL** : `http://localhost:8080/sentry-test`

### Tests disponibles

| Test | Description | Type Sentry |
|------|-------------|-------------|
| 🔴 **Erreur Standard** | Erreur classique avec métadonnées | Error |
| 🟠 **Warning** | Avertissement non bloquant | Warning |
| 🔵 **Info** | Log informatif | Info |
| 🟣 **Erreur Validation** | Simule erreur du questionnaire | Error (validation) |
| ⚠️ **Exception Non Gérée** | Exception qui crashe la page | Unhandled Error |

## 📝 Comment tester

### Étape 1 : Ouvrir la page de test

```bash
# Aller sur l'application
http://localhost:8080/sentry-test
```

### Étape 2 : Envoyer un test

1. **Cliquez sur "Erreur Validation"** (recommandé)
2. Un toast vert confirme l'envoi
3. L'erreur apparaît dans l'historique de la page

### Étape 3 : Vérifier dans Sentry

1. **Ouvrez votre dashboard Sentry**
2. Allez dans **"Issues"**
3. **Recherchez** : `TEST SENTRY`
4. **Cliquez** sur l'erreur de validation
5. **Vérifiez** que vous voyez :
   - ✅ Message d'erreur clair
   - ✅ Métadonnées (step, travelers, etc.)
   - ✅ User agent, viewport
   - ✅ Timestamp
   - ✅ Breadcrumbs

### Exemple de métadonnées attendues

```json
{
  "step": 2,
  "totalSteps": 15,
  "travelGroup": "Famille",
  "travelers": {
    "count": 7,
    "adults": 6,
    "children": 1,
    "childrenAges": [5]
  },
  "numberOfTravelers": 7,
  "testId": "validation-test-1234567890",
  "errorType": "validation_failed",
  "stepName": "Nombre de personnes",
  "userAgent": "Mozilla/5.0...",
  "viewport": "1920x1080",
  "timestamp": "2024-12-10T15:30:00.000Z"
}
```

## 🎯 Tests de validation en situation réelle

### Test 1 : Famille sans adulte (doit échouer)

1. Aller sur `/questionnaire`
2. Sélectionner **"Famille"**
3. **N'ajouter que des enfants** (pas d'adulte)
4. Essayer de continuer

**Résultat attendu :**
- ❌ Bouton "Continuer" désactivé OU toast d'erreur
- 📊 Log Sentry avec message : "Aucun adulte dans le groupe"

### Test 2 : Enfant sans âge (doit échouer)

1. Aller sur `/questionnaire`
2. Sélectionner **"Famille"**
3. Ajouter 1 adulte + 1 enfant
4. **Ne pas renseigner l'âge de l'enfant** (laisser 0)
5. Essayer de continuer

**Résultat attendu :**
- ❌ Toast d'erreur : "Veuillez renseigner l'âge de tous les enfants"
- 📊 Log Sentry avec détails sur l'enfant invalide

### Test 3 : Famille valide (doit réussir)

1. Aller sur `/questionnaire`
2. Sélectionner **"Famille"**
3. Ajouter **2 adultes + 1 enfant de 5 ans**
4. Cliquer sur "Continuer"

**Résultat attendu :**
- ✅ Passage à l'étape suivante sans erreur
- 📊 Pas de log d'erreur Sentry (validation OK)

## 🔍 Vérification complète

### Checklist avant validation

- [ ] Page `/sentry-test` accessible
- [ ] Bouton "Erreur Validation" fonctionne
- [ ] Toast vert "✅ Erreur de validation envoyée"
- [ ] Dashboard Sentry ouvert
- [ ] Recherche "TEST SENTRY" trouve l'erreur
- [ ] Métadonnées visibles dans l'erreur Sentry
- [ ] Erreur contient : step, travelers, timestamp
- [ ] Test en situation réelle sur le questionnaire
- [ ] Erreur capturée quand famille sans adulte
- [ ] Erreur capturée quand enfant sans âge

## 📊 Dashboard Sentry recommandé

### Filtres utiles

```
# Erreurs de validation uniquement
is:unresolved error.type:validation_failed

# Erreurs du questionnaire
is:unresolved message:"questionnaire"

# Tests de développement
message:"TEST SENTRY"

# Erreurs de la page "Nombre de personnes"
metadata.stepName:"Nombre de personnes"
```

### Alertes recommandées

1. **Alerte critique** : >10 erreurs de validation en 1h
2. **Alerte warning** : >5 utilisateurs bloqués sur la même étape
3. **Alerte info** : Nouveau type d'erreur jamais vu

## 💡 Résolution des problèmes

### Sentry ne reçoit rien

**Vérifier :**
1. DSN Sentry est correct dans `main.tsx`
2. `sendDefaultPii: true` dans la config
3. Connexion internet active
4. Console browser pour erreurs réseau
5. Sentry est initialisé : `Sentry.isInitialized()`

### Logs en double

**Cause** : `logger.error()` + `questionnaireLogger.logValidationError()`  
**Solution** : Normal, fournit breadcrumbs + erreurs séparées

### Métadonnées manquantes

**Vérifier :**
1. `getStepDebugContext()` retourne bien les données
2. Pas de données `undefined` dans le contexte
3. Logger sanitize les données sensibles

## 🚀 Prochaines étapes

- [ ] Valider Sentry reçoit bien les erreurs de test
- [ ] Tester en situation réelle sur le questionnaire
- [ ] Configurer alertes Sentry en production
- [ ] Créer dashboard personnalisé pour le questionnaire
- [ ] Documenter les erreurs fréquentes et solutions

---

**Créé le** : 2024-12-10  
**Page de test** : `/sentry-test`  
**Fichiers modifiés** :
- `src/pages/Questionnaire.tsx` (validation + logging)
- `src/pages/SentryTest.tsx` (page de test)
- `src/App.tsx` (route `/sentry-test`)
