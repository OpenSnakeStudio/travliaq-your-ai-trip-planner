/**
 * EXEMPLES D'UTILISATION DU SYSTÈME DE LOGGING
 * 
 * Ce fichier contient des exemples concrets d'utilisation du logger dans différents contextes.
 */

import { logger, questionnaireLogger, trackUserAction, setUser, LogCategory, startPerformanceTrace } from './logger';

// ==========================================
// EXEMPLE 1: Logging basique dans un composant
// ==========================================

export function Example1_BasicLogging() {
  // Log d'information simple
  logger.info('Composant monté');
  
  // Log avec contexte
  logger.info('Utilisateur a cliqué sur le bouton', {
    category: LogCategory.NAVIGATION,
    metadata: { buttonId: 'submit-questionnaire' }
  });
  
  // Log d'avertissement
  logger.warn('Tentative de soumission avec champs manquants', {
    category: LogCategory.VALIDATION,
    metadata: { missingFields: ['email', 'destination'] }
  });
  
  // Log d'erreur
  try {
    throw new Error('Erreur de connexion API');
  } catch (error) {
    logger.error('Impossible de charger les données', {
      category: LogCategory.API,
      error: error as Error,
      metadata: { endpoint: '/api/questionnaire' }
    });
  }
}

// ==========================================
// EXEMPLE 2: Logging dans le questionnaire
// ==========================================

export function Example2_QuestionnaireLogging() {
  const currentStep = 5;
  const totalSteps = 15;
  
  // Log de changement d'étape
  questionnaireLogger.logStepChange(currentStep, totalSteps, 'Budget');
  
  // Log de réponse utilisateur
  questionnaireLogger.logAnswer(currentStep, 'budgetPerPerson', '500-1000€');
  
  // Log d'erreur de validation
  questionnaireLogger.logValidationError(
    currentStep,
    'budgetAmount',
    'Le montant doit être supérieur à 0'
  );
  
  // Log de soumission réussie
  questionnaireLogger.logSubmission(true, 'resp_123abc');
  
  // Log de soumission échouée
  questionnaireLogger.logSubmission(
    false,
    undefined,
    new Error('Erreur réseau')
  );
  
  // Log d'incohérence
  questionnaireLogger.logInconsistency(
    'Compteur d\'étapes incorrect',
    { expected: 15, actual: 16, step: currentStep }
  );
}

// ==========================================
// EXEMPLE 3: Traçage des actions utilisateur
// ==========================================

export function Example3_UserTracking() {
  // Tracer une action importante
  trackUserAction('Clic sur Commencer le questionnaire', LogCategory.QUESTIONNAIRE);
  
  // Tracer avec métadonnées
  trackUserAction('Sélection de destination', LogCategory.QUESTIONNAIRE, {
    destination: 'Paris, France',
    hasFlexibleDates: true
  });
  
  // Définir l'utilisateur (après login)
  setUser('user_123', 'user@example.com', {
    subscription: 'premium',
    country: 'France'
  });
  
  // Nettoyer l'utilisateur (après logout)
  setUser();
}

// ==========================================
// EXEMPLE 4: Mesure de performance
// ==========================================

export function Example4_PerformanceTracking() {
  // Mesurer le temps de chargement d'une opération
  const trace = startPerformanceTrace('load-questionnaire-data');
  
  // Simuler une opération longue
  setTimeout(() => {
    trace.finish();
    // Affichera dans les logs: "Performance trace: load-questionnaire-data completed in XXXms"
  }, 1500);
  
  // Mesure simple avec questionnaireLogger
  const start = Date.now();
  // ... opération ...
  const duration = Date.now() - start;
  questionnaireLogger.logPerformance('calculate-total-steps', duration);
}

// ==========================================
// EXEMPLE 5: Utilisation dans un composant React
// ==========================================

/*
import { useEffect } from 'react';
import { logger, questionnaireLogger, trackUserAction, LogCategory } from '@/utils/logger';

export function QuestionnaireComponent() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  
  // Log au montage du composant
  useEffect(() => {
    logger.info('QuestionnaireComponent monté', {
      category: LogCategory.QUESTIONNAIRE,
      metadata: { initialStep: step }
    });
    
    return () => {
      logger.info('QuestionnaireComponent démonté');
    };
  }, []);
  
  // Log à chaque changement d'étape
  useEffect(() => {
    questionnaireLogger.logStepChange(step, 15);
  }, [step]);
  
  const handleAnswer = (field: string, value: any) => {
    // Log la réponse
    questionnaireLogger.logAnswer(step, field, value);
    
    // Tracer l'action
    trackUserAction(`Réponse à ${field}`, LogCategory.QUESTIONNAIRE, { value });
    
    setAnswers(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    try {
      const trace = startPerformanceTrace('submit-questionnaire');
      
      const response = await submitQuestionnaire(answers);
      
      trace.finish();
      
      questionnaireLogger.logSubmission(true, response.id);
      
    } catch (error) {
      logger.error('Échec de soumission', {
        category: LogCategory.SUBMISSION,
        error: error as Error,
        step,
        totalSteps: 15
      });
      
      questionnaireLogger.logSubmission(false, undefined, error as Error);
    }
  };
  
  return (
    // ... JSX ...
  );
}
*/

// ==========================================
// EXEMPLE 6: Logging dans les hooks
// ==========================================

/*
export function useTripData(tripId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const trace = startPerformanceTrace('fetch-trip-data');
      
      try {
        logger.debug('Récupération des données du voyage', {
          category: LogCategory.API,
          metadata: { tripId }
        });
        
        const response = await fetch(`/api/trips/${tripId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const tripData = await response.json();
        
        setData(tripData);
        
        trace.finish();
        
        logger.info('Données du voyage chargées', {
          category: LogCategory.API,
          metadata: { tripId, dataSize: JSON.stringify(tripData).length }
        });
        
      } catch (err) {
        setError(err);
        
        logger.error('Impossible de charger les données du voyage', {
          category: LogCategory.API,
          error: err as Error,
          metadata: { tripId }
        });
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tripId]);
  
  return { data, loading, error };
}
*/

// ==========================================
// EXEMPLE 7: Logging dans les contextes
// ==========================================

/*
export function AuthContext() {
  const login = async (email: string, password: string) => {
    try {
      logger.info('Tentative de connexion', {
        category: LogCategory.AUTH,
        metadata: { method: 'email' }
      });
      
      const user = await authService.login(email, password);
      
      // Définir l'utilisateur dans Sentry
      setUser(user.id, email, { 
        name: user.name,
        role: user.role 
      });
      
      logger.info('Connexion réussie', {
        category: LogCategory.AUTH,
        metadata: { userId: user.id }
      });
      
      trackUserAction('Connexion réussie', LogCategory.AUTH);
      
    } catch (error) {
      logger.error('Échec de connexion', {
        category: LogCategory.AUTH,
        error: error as Error,
        metadata: { email } // Email sera automatiquement [REDACTED]
      });
      
      throw error;
    }
  };
  
  const logout = () => {
    logger.info('Déconnexion utilisateur', {
      category: LogCategory.AUTH
    });
    
    // Nettoyer l'utilisateur dans Sentry
    setUser();
    
    trackUserAction('Déconnexion', LogCategory.AUTH);
  };
  
  return { login, logout };
}
*/

// ==========================================
// BONNES PRATIQUES
// ==========================================

/*
1. TOUJOURS utiliser le bon niveau de log:
   - debug() : Informations de débogage (dev uniquement)
   - info() : Événements normaux (navigation, actions)
   - warn() : Situations anormales non critiques
   - error() : Erreurs nécessitant attention
   - fatal() : Erreurs critiques bloquantes

2. TOUJOURS fournir un contexte:
   - category : Pour filtrer les logs par domaine
   - step/totalSteps : Pour le questionnaire
   - metadata : Informations additionnelles
   - error : L'objet Error si disponible

3. PROTECTION des données sensibles:
   - Les champs email, password, token, etc. sont automatiquement [REDACTED]
   - Ne loggez JAMAIS de mots de passe en clair
   - Utilisez sanitizeData() pour les objets complexes

4. PERFORMANCE:
   - Utilisez startPerformanceTrace() pour mesurer les opérations longues
   - questionnaireLogger.logPerformance() pour les métriques
   - Tracez les appels API lents

5. ACTIONS UTILISATEUR:
   - trackUserAction() pour les clics/interactions importants
   - Aide à reconstruire le parcours utilisateur

6. IDENTIFICATION:
   - setUser() après login pour associer les erreurs à l'utilisateur
   - setUser() sans paramètres après logout pour nettoyer

7. CONTEXTE QUESTIONNAIRE:
   - Utilisez questionnaireLogger pour toutes les actions du questionnaire
   - Logs automatiquement step/totalSteps
   - Facile à filtrer dans Sentry
*/

export default {
  Example1_BasicLogging,
  Example2_QuestionnaireLogging,
  Example3_UserTracking,
  Example4_PerformanceTracking
};
