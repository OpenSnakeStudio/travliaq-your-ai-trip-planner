# 📊 Système de Logging Professionnel - Travliaq

## ✅ Installation terminée

Un système de logging complet et professionnel a été intégré avec **Sentry**.

### Fichiers créés :

1. **`src/utils/logger.ts`** - Module de logging principal
2. **`src/utils/logger.example.ts`** - Exemples d'utilisation complets
3. **`src/main.tsx`** - Configuration Sentry optimisée

---

## 🎯 Fonctionnalités

### 1. **Niveaux de log**
- `debug()` - Développement uniquement
- `info()` - Événements normaux
- `warn()` - Situations anormales
- `error()` - Erreurs nécessitant attention
- `fatal()` - Erreurs critiques

### 2. **Catégories de log**
- `QUESTIONNAIRE` - Toutes actions du questionnaire
- `AUTH` - Authentification/connexion
- `API` - Appels API
- `NAVIGATION` - Navigation utilisateur
- `VALIDATION` - Erreurs de validation
- `SUBMISSION` - Soumission de formulaires
- `PERFORMANCE` - Métriques de performance

### 3. **Helpers spécialisés**

#### `questionnaireLogger`
- `logStepChange()` - Changement d'étape
- `logValidationError()` - Erreur de validation
- `logAnswer()` - Réponse utilisateur
- `logSubmission()` - Soumission questionnaire
- `logInconsistency()` - Incohérences détectées
- `logPerformance()` - Métriques de performance

#### Autres helpers
- `trackUserAction()` - Actions utilisateur importantes
- `setUser()` - Identifier l'utilisateur
- `captureEvent()` - Événements personnalisés
- `startPerformanceTrace()` - Mesurer les performances

### 4. **Protection des données**
✅ **Automatic redaction** des champs sensibles :
- `email` → `[REDACTED]`
- `password` → `[REDACTED]`
- `token` → `[REDACTED]`
- `creditCard` → `[REDACTED]`
- Tous les dérivés (userEmail, apiToken, etc.)

---

## 🚀 Utilisation rapide

### Exemple 1 : Log basique
```typescript
import { logger, LogCategory } from '@/utils/logger';

// Information simple
logger.info('Utilisateur a commencé le questionnaire');

// Avec contexte
logger.info('Navigation vers étape suivante', {
  category: LogCategory.NAVIGATION,
  metadata: { from: 'step-1', to: 'step-2' }
});
```

### Exemple 2 : Dans le questionnaire
```typescript
import { questionnaireLogger } from '@/utils/logger';

// Changement d'étape
questionnaireLogger.logStepChange(5, 15, 'Budget');

// Réponse utilisateur
questionnaireLogger.logAnswer(5, 'budgetPerPerson', '500-1000€');

// Erreur de validation
questionnaireLogger.logValidationError(5, 'budgetAmount', 'Montant invalide');

// Soumission
questionnaireLogger.logSubmission(true, 'resp_123abc');
```

### Exemple 3 : Gestion d'erreur
```typescript
import { logger, LogCategory } from '@/utils/logger';

try {
  await submitQuestionnaire(data);
} catch (error) {
  logger.error('Échec de soumission', {
    category: LogCategory.SUBMISSION,
    error: error as Error,
    step: 15,
    totalSteps: 15,
    metadata: { userId: user.id }
  });
}
```

### Exemple 4 : Tracking utilisateur
```typescript
import { trackUserAction, setUser, LogCategory } from '@/utils/logger';

// Action importante
trackUserAction('Clic sur Commencer', LogCategory.QUESTIONNAIRE);

// Après login
setUser(user.id, user.email, { role: 'premium' });

// Après logout
setUser();
```

### Exemple 5 : Performance
```typescript
import { startPerformanceTrace } from '@/utils/logger';

const trace = startPerformanceTrace('load-trip-data');

await fetchTripData();

trace.finish(); // Log automatique du temps écoulé
```

---

## 📦 Configuration Sentry (main.tsx)

### Fonctionnalités activées :

✅ **Breadcrumbs automatiques**
- Console logs (console.log, console.error)
- Clics DOM
- Requêtes HTTP (fetch, xhr)
- Navigation historique

✅ **Performance monitoring**
- 100% en développement
- 10% en production (sample rate)

✅ **Filtrage intelligent**
- Erreurs réseau temporaires filtrées
- Extensions navigateur ignorées
- Erreurs de chunk loading ignorées

✅ **Enrichissement automatique**
- User-agent
- Taille du viewport
- Environnement (dev/prod)
- Release tracking

❌ **Session replay désactivé** (comme demandé)

---

## 🎨 Intégration dans le questionnaire

### Points critiques à logger :

1. **Montage du composant**
```typescript
useEffect(() => {
  logger.info('QuestionnaireComponent monté');
}, []);
```

2. **Changement d'étape**
```typescript
useEffect(() => {
  questionnaireLogger.logStepChange(step, totalSteps);
}, [step]);
```

3. **Réponses utilisateur**
```typescript
const handleAnswer = (field: string, value: any) => {
  questionnaireLogger.logAnswer(step, field, value);
  setAnswers({ ...answers, [field]: value });
};
```

4. **Validation**
```typescript
const canProceedToNextStep = () => {
  if (!isValid) {
    questionnaireLogger.logValidationError(
      step,
      'missingField',
      'Champ requis manquant'
    );
    return false;
  }
  return true;
};
```

5. **Soumission**
```typescript
const handleSubmit = async () => {
  try {
    const response = await submit();
    questionnaireLogger.logSubmission(true, response.id);
  } catch (error) {
    questionnaireLogger.logSubmission(false, undefined, error);
  }
};
```

6. **Incohérences**
```typescript
if (totalSteps !== expectedSteps) {
  questionnaireLogger.logInconsistency('Compteur incorrect', {
    expected: expectedSteps,
    actual: totalSteps,
    step
  });
}
```

---

## 📊 Visualisation dans Sentry

### Dashboard Sentry :
1. **Issues** - Toutes les erreurs capturées
2. **Performance** - Métriques de vitesse
3. **Breadcrumbs** - Parcours utilisateur complet

### Filtrage par catégorie :
```
category:questionnaire
category:validation
category:submission
```

### Filtrage par étape :
```
step:5
step:>10
```

### Recherche d'incohérences :
```
"Incohérence détectée"
```

---

## 🛡️ Sécurité

### Données protégées automatiquement :
- ✅ Emails → `[REDACTED]`
- ✅ Mots de passe → `[REDACTED]`
- ✅ Tokens API → `[REDACTED]`
- ✅ Cartes bancaires → `[REDACTED]`
- ✅ Téléphones → `[REDACTED]`

### Breadcrumbs sensibles filtrés :
- ✅ Messages console contenant "password"
- ✅ Données de formulaire sensibles

---

## 📈 Métriques importantes

Le système trace automatiquement :

1. **Parcours utilisateur**
   - Chaque étape visitée
   - Réponses données
   - Actions effectuées

2. **Erreurs et warnings**
   - Validations échouées
   - Erreurs de soumission
   - Incohérences détectées

3. **Performance**
   - Temps de chargement
   - Durée des opérations
   - Temps de réponse API

4. **Contexte technique**
   - User-agent
   - Résolution écran
   - Environnement (dev/prod)

---

## 🚨 Alertes recommandées dans Sentry

Configurez des alertes pour :

1. **Erreurs critiques** (level:fatal)
2. **Taux d'erreur >5%** sur 1h
3. **Incohérences** détectées
4. **Échecs de soumission** >10/h
5. **Performance dégradée** (>2s)

---

## 💡 Bonnes pratiques

### ✅ À FAIRE :
- Logger TOUTES les actions importantes
- Fournir du contexte (step, metadata)
- Utiliser les bons niveaux (info/warn/error)
- Logger les performances critiques

### ❌ À ÉVITER :
- Logger des mots de passe en clair
- Logger dans des boucles serrées
- Omettre le contexte d'erreur
- Ignorer les warnings

---

## 📚 Documentation complète

Consultez `src/utils/logger.example.ts` pour :
- 7 exemples détaillés
- Code prêt à copier-coller
- Cas d'usage réels
- Bonnes pratiques complètes

---

## 🎯 Prochaines étapes

1. **Intégrer dans Questionnaire.tsx** :
   - Import du logger
   - Logs aux points critiques
   - Tracking des erreurs

2. **Configurer les alertes Sentry** :
   - Seuils personnalisés
   - Notifications Slack/Email
   - Escalade pour critiques

3. **Monitorer les dashboards** :
   - Issues récentes
   - Tendances d'erreurs
   - Performance dégradée

---

**Status** : ✅ Prêt à l'emploi
**DSN Sentry** : Configuré
**Protection données** : Activée
**Environnement** : Auto-détecté (dev/prod)
