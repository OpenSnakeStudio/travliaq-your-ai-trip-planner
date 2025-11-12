# 🔌 Intégration du Logging dans Questionnaire.tsx

## 📋 Guide rapide d'intégration

Voici comment intégrer le système de logging dans le questionnaire existant.

---

## 1️⃣ Imports à ajouter (en haut du fichier)

```typescript
import { logger, questionnaireLogger, trackUserAction, setUser, LogCategory } from '@/utils/logger';
```

---

## 2️⃣ Logs au montage du composant

**Où :** Dans le premier `useEffect`

```typescript
// Après la ligne ~530 (useEffect des inférences)
useEffect(() => {
  logger.info('Questionnaire component mounted', {
    category: LogCategory.QUESTIONNAIRE,
    metadata: {
      initialStep: step,
      hasUser: !!user,
      savedDraft: !!localStorage.getItem(`travliaq:qv2:${user?.id}`)
    }
  });
  
  return () => {
    logger.debug('Questionnaire component unmounted');
  };
}, []);
```

---

## 3️⃣ Log des changements d'étape

**Où :** Après le calcul de `totalSteps` (ligne ~770)

```typescript
// Après: const totalSteps = getTotalSteps();
useEffect(() => {
  if (step > 0 && step <= totalSteps) {
    questionnaireLogger.logStepChange(step, totalSteps, `Step ${step}`);
  }
}, [step, totalSteps]);
```

---

## 4️⃣ Log des incohérences de compteur

**Où :** Dans `getTotalSteps()` à la fin (ligne ~765)

```typescript
const getTotalSteps = (): number => {
  let total = 1; // Step 1: Qui voyage
  
  // ... toute la logique existante ...
  
  total++; // Step 18: Zone ouverte
  total++; // Step final: Review & confirm
  
  // 🔍 AJOUTER ICI - Détection d'incohérences
  if (total < 10 || total > 30) {
    questionnaireLogger.logInconsistency('Total steps out of range', {
      totalSteps: total,
      answers: Object.keys(answers),
      helpWith: answers.helpWith
    });
  }
  
  return total;
};
```

---

## 5️⃣ Log des erreurs de validation

**Où :** Dans `canProceedToNextStep()` après les validations (ligne ~970)

```typescript
const canProceedToNextStep = (): boolean => {
  let stepCounter = 0;

  // Step 1: Groupe de voyage
  stepCounter++;
  if (step === stepCounter) {
    const isValid = !!answers.travelGroup;
    
    // 🔍 AJOUTER ICI
    if (!isValid) {
      questionnaireLogger.logValidationError(step, 'travelGroup', 'Travel group not selected');
    }
    
    return isValid;
  }

  // ... répéter pour chaque validation critique ...
  
  // Step final: Review (pas de validation nécessaire)
  return true;
};
```

---

## 6️⃣ Log des réponses utilisateur

**Où :** Dans `handleChoice` (ligne ~1008)

```typescript
const handleChoice = (field: keyof Answer, value: any) => {
  // 🔍 AJOUTER ICI - Log AVANT la mise à jour
  questionnaireLogger.logAnswer(step, field, value);
  trackUserAction(`Selected ${field}`, LogCategory.QUESTIONNAIRE, { value });
  
  setAnswers({ ...answers, [field]: value });
  // Skip validation car on vient de définir la valeur
  setTimeout(() => nextStep(true), 300);
};
```

---

## 7️⃣ Log des soumissions

**Où :** Dans `handleQuestionnaireSubmit` (ligne ~1120)

```typescript
const handleQuestionnaireSubmit = async () => {
  if (!canProceedToNextStep()) {
    questionnaireLogger.logValidationError(step, 'review', 'Cannot proceed - validation failed');
    return;
  }
  
  setIsSubmitting(true);
  
  // 🔍 AJOUTER ICI - Début de trace performance
  const submitTrace = startPerformanceTrace('submit-questionnaire');

  try {
    // ... logique de validation existante ...

    // Use secure edge function with rate limiting
    const { data, error } = await supabase.functions.invoke('submit-questionnaire', {
      body: validatedData
    });

    if (error) throw error;

    setSubmittedResponseId(data.data.id);
    
    // 🔍 AJOUTER ICI - Log de succès
    questionnaireLogger.logSubmission(true, data.data.id);
    submitTrace.finish();
    
    // ... reste de la logique ...
    
  } catch (error) {
    // 🔍 AJOUTER ICI - Log d'erreur
    logger.error('Questionnaire submission failed', {
      category: LogCategory.SUBMISSION,
      error: error as Error,
      step,
      totalSteps,
      metadata: {
        answersCount: Object.keys(answers).length,
        hasUser: !!user
      }
    });
    
    questionnaireLogger.logSubmission(false, undefined, error as Error);
    
    // ... logique d'erreur existante ...
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 8️⃣ Log de l'identification utilisateur

**Où :** Après le login Google (ligne ~1290)

```typescript
const handleGoogleLoginSuccess = async () => {
  // Link the submitted response to the newly authenticated user
  if (submittedResponseId) {
    try {
      // 🔍 AJOUTER ICI - Définir l'utilisateur dans Sentry
      if (user) {
        setUser(user.id, user.email, {
          provider: 'google',
          hasSubmittedQuestionnaire: true
        });
        
        logger.info('User identified after questionnaire submission', {
          category: LogCategory.AUTH,
          metadata: { userId: user.id }
        });
      }
      
      const { error } = await supabase.rpc('claim_questionnaire_response', {
        response_id: submittedResponseId
      });
      
      // ... reste de la logique ...
    } catch (error) {
      logger.error('Failed to claim questionnaire response', {
        category: LogCategory.AUTH,
        error: error as Error,
        metadata: { responseId: submittedResponseId }
      });
    }
  }
  
  setShowGoogleLogin(false);
  setTimeout(() => navigate('/'), 1000);
};
```

---

## 9️⃣ Log des erreurs de navigation

**Où :** Dans `nextStep()` lors du toast d'erreur (ligne ~983)

```typescript
const nextStep = (skipValidation: boolean = false) => {
  // Validation avant de continuer (sauf si on skip la validation)
  if (!skipValidation && !canProceedToNextStep()) {
    // 🔍 AJOUTER ICI
    logger.warn('Cannot proceed to next step - validation failed', {
      category: LogCategory.VALIDATION,
      step,
      totalSteps,
      metadata: { skipValidation }
    });
    
    toast({
      title: t('questionnaire.pleaseAnswer'),
      description: t('questionnaire.answerRequired'),
      variant: "destructive",
    });
    return;
  }
  
  // ... reste de la logique ...
};
```

---

## 🔟 Log des performances critiques

**Où :** Dans `getTotalSteps()` pour détecter les ralentissements (ligne ~658)

```typescript
const getTotalSteps = (): number => {
  // 🔍 AJOUTER ICI - Début de mesure
  const startTime = Date.now();
  
  let total = 1; // Step 1: Qui voyage
  
  // ... toute la logique existante ...
  
  total++; // Step final: Review & confirm
  
  // 🔍 AJOUTER ICI - Log si trop lent
  const duration = Date.now() - startTime;
  if (duration > 10) {
    questionnaireLogger.logPerformance('getTotalSteps', duration);
    logger.warn('getTotalSteps took too long', {
      category: LogCategory.PERFORMANCE,
      metadata: { duration, totalSteps: total }
    });
  }
  
  return total;
};
```

---

## ✅ Checklist d'intégration

Après avoir ajouté tous les logs ci-dessus, vérifiez :

- [ ] Import du logger en haut du fichier
- [ ] Log au montage du composant
- [ ] Log des changements d'étape
- [ ] Log des incohérences (getTotalSteps)
- [ ] Log des validations échouées
- [ ] Log des réponses utilisateur (handleChoice)
- [ ] Log de soumission (succès/échec)
- [ ] Identification utilisateur (après login)
- [ ] Log des erreurs de navigation
- [ ] Métriques de performance

---

## 🎯 Résultat attendu

Une fois intégré, vous verrez dans Sentry :

### Dashboard "Questionnaire"
- Nombre de sessions
- Étapes visitées (distribution)
- Taux d'abandon par étape
- Erreurs de validation fréquentes
- Temps moyen par étape

### Issues
- Incohérences de compteur
- Erreurs de soumission
- Validations échouées
- Timeouts

### Breadcrumbs (parcours utilisateur)
```
1. Questionnaire component mounted
2. Step 1/15: Qui voyage
3. Selected travelGroup: solo
4. Step 2/15: Destination
5. Selected hasDestination: yes
... etc
```

---

## 🐛 Debugging

Si vous voyez `[REDACTED]` dans Sentry pour des champs NON sensibles, ajustez la liste dans `logger.ts` :

```typescript
const sensitiveFields = ['email', 'password', 'token', 'creditCard', 'ssn', 'phone'];
```

---

## 📊 Dashboards recommandés Sentry

Créez ces dashboards personnalisés :

1. **Funnel du questionnaire**
   - Étape 1 → 100%
   - Étape 5 → 75%
   - Étape 10 → 50%
   - Soumission → 35%

2. **Top erreurs**
   - Par étape
   - Par catégorie
   - Par navigateur

3. **Performance**
   - Temps moyen getTotalSteps
   - Temps soumission
   - Temps chargement page

---

**Intégration estimée** : 15-20 minutes
**Impact performance** : Négligeable (<1ms par log)
**Bénéfices** : Détection immédiate des problèmes, parcours utilisateur complet
