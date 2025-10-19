# **📋 GUIDE COMPLET DU QUESTIONNAIRE TRAVLIAQ**

**Documentation complète pour comprendre la logique du questionnaire dynamique**

---

## **📋 TABLE DES MATIÈRES**

1. [Vue d'ensemble du système](#-vue-densemble-du-système)
2. [Logique conditionnelle et branches](#-logique-conditionnelle-et-branches)
3. [Arbre de décision complet](#-arbre-de-décision-complet)
4. [Description détaillée des champs](#-description-détaillée-des-champs)
5. [Exemples de parcours complets](#-exemples-de-parcours-complets)
6. [Structure JSON de sortie](#-structure-json-de-sortie)
7. [Utilisation des données](#-utilisation-des-données)
8. [Conseils et bonnes pratiques](#-conseils-et-bonnes-pratiques)

---

## **🌍 VUE D'ENSEMBLE DU SYSTÈME**

Le questionnaire Travliaq est un **formulaire dynamique intelligent** qui s'adapte aux réponses de l'utilisateur pour collecter uniquement les informations pertinentes. Le nombre d'étapes varie entre **10 et 25+** selon les choix effectués.

### **Principe de fonctionnement**

```
┌─────────────────────────────────────────────┐
│  Utilisateur répond à une question          │
│           ↓                                  │
│  Système évalue la réponse                  │
│           ↓                                  │
│  Décide quelle(s) question(s) suivante(s)   │
│           ↓                                  │
│  Affiche la ou les questions pertinentes    │
└─────────────────────────────────────────────┘
```

### **Caractéristiques principales**

✅ **Questionnaire adaptatif** : Les questions changent selon les réponses précédentes

✅ **Multilingue** : Support FR/EN avec détection automatique de la langue

✅ **Authentification requise** : L'utilisateur doit être connecté pour soumettre

✅ **Quota intelligent** : Maximum 2 soumissions par utilisateur/email par 24h

✅ **Géolocalisation** : Détection automatique du lieu de départ

✅ **Validation double** : Frontend (Zod) + Backend (Edge Function)

### **Données collectées en sortie**

Le questionnaire produit un **objet JSON** contenant :
- **Informations de base** : email, langue, user_id
- **Profil voyageur** : type de groupe, nombre de voyageurs, enfants
- **Destination** : destination souhaitée OU critères de recherche
- **Services souhaités** : vols, hébergement, activités
- **Dates et durée** : dates précises, flexibles ou approximatives
- **Budget** : estimation ou montant précis
- **Préférences** : style, rythme, transport, confort
- **Contraintes** : sécurité, santé, alimentaires

---

## **🔀 LOGIQUE CONDITIONNELLE ET BRANCHES**

Le questionnaire suit une **logique en arbre** où certaines questions ne s'affichent que si des conditions sont remplies.

### **Questions toujours affichées (tronc commun)**

Ces questions apparaissent **systématiquement** pour tous les utilisateurs :

1. **Qui voyage ?** (Solo, Duo, Famille, Groupe)
2. **Destination en tête ?** (Oui, Non, Peu importe)
3. **Comment Travliaq peut aider ?** (Vols, Hébergement, Activités)
4. **Type de dates** (Précises, Flexibles, Pas de dates)
5. **Budget** (Économique, Modéré, Confortable, Luxe)
6. **Mobilité sur place** (Transports en commun, Voiture, Vélo...)
7. **Contraintes diverses** (Allergies, Végétarien, Santé...)
8. **Zone ouverte** (Informations additionnelles en texte libre)
9. **Email** (Pour recevoir les recommandations)

### **Branches conditionnelles principales**

Le questionnaire se divise en **5 grandes branches conditionnelles** :

#### **🌳 BRANCHE 1 : Détails du groupe**

**Condition d'affichage** : Si `travel_group` = "En famille" OU "Groupe (3-5 personnes)"

**Questions supplémentaires** :
- **Détails des voyageurs** : Interface pour ajouter adultes et enfants un par un
  - Possibilité d'ajouter des adultes
  - Possibilité d'ajouter des enfants avec leur âge (0-17 ans)
  - Affichage du décompte total (ex: "2 adultes, 1 enfant")

**Impact sur la suite** : Détermine le nombre de bagages à gérer et les besoins spécifiques familiaux

---

#### **🌳 BRANCHE 2 : Définition de la destination**

**Condition d'affichage** : Si `has_destination` = "Non"

**Questions supplémentaires** (3 questions) :
1. **Climat préféré** (Chaud, Tropical, Tempéré, Frais, Montagne)
2. **Affinités de voyage** (max 5 sélections parmi 15 options)
3. **Ambiance recherchée** (Animée et urbaine, Calme et nature, Mix des deux)
4. **Ville de départ** (avec géolocalisation possible)

**Si `has_destination` = "Oui"** :
- Question unique : **Quelle destination ?** (champ texte avec autocomplétion de 500+ villes)

**Pourquoi cette branche existe** : Si l'utilisateur sait où il veut aller, on ne pose pas de questions sur les préférences climatiques. Si il ne sait pas, on l'aide à définir sa destination idéale.

---

#### **🌳 BRANCHE 3 : Dates et durée**

**Condition d'affichage** : Selon `dates_type`

**Si dates_type = "Dates précises"** :
- **Sélecteur de dates** (date de départ + date de retour)

**Si dates_type = "Dates flexibles"** :
1. **Flexibilité** (±1 jour, ±2-3 jours, ±1 semaine, Totalement flexible)
2. **Date de départ approximative** (Oui/Non)
3. **Si Oui** : Sélecteur de date approximative
4. **Durée du séjour** (Week-end, 1 semaine, 10 jours, 2 semaines, Plus de 2 semaines)
5. **Si "Plus de 2 semaines"** : Champ numérique pour le nombre exact de nuits

**Pourquoi cette branche existe** : Les dates précises nécessitent juste un calendrier. Les dates flexibles nécessitent de comprendre le degré de flexibilité et la durée souhaitée.

---

#### **🌳 BRANCHE 4 : Services sélectionnés**

**Condition d'affichage** : Selon les choix dans "Comment Travliaq peut aider ?"

Cette branche est la **plus complexe** car elle impacte plusieurs sections du questionnaire.

##### **4A. Si "Vols" est sélectionné** ✈️

**Questions supplémentaires** (2 questions) :
1. **Préférence de vol** (Direct uniquement, 1 escale max, Peu importe)
2. **Bagages par voyageur** (Cabine uniquement, 1 bagage soute, 2 bagages, 3+)

##### **4B. Si "Hébergement" est sélectionné** 🏨

**Questions supplémentaires** (5 questions) :
1. **Type d'hébergement** (Hôtel, Appartement, Auberge, Chambre d'hôtes, Resort, Éco-lodge, Camping)
2. **Si "Hôtel" sélectionné** : Préférences hôtel (Full-inclusif, Demi-pension, Petit-déjeuner, Rien)
3. **Confort minimum** (Basique, Standard, Supérieur, Luxe)
4. **Type de quartier** (Centre-ville, Authentique/Local, Calme/Résidentiel, Peu importe)
5. **Équipements souhaités** (WiFi, Clim, Piscine, Cuisine, Spa, Parking...)

##### **4C. Si "Activités" est sélectionné** 🎯

**Questions supplémentaires** (3 questions) :
1. **Si destination précise** : Style de voyage (Culture, Gastronomie, Nature, Plages, Aventure...)
2. **Rythme du voyage** (Tranquille, Équilibré, Intense)
3. **Horloge biologique** (Lève-tôt, Couche-tard, Besoin de siestes, Préfère hors-saison...)

##### **4D. Si "Hébergement" OU "Activités"** 🔐

**Question supplémentaire** (1 question) :
- **Sécurité & Phobies** (Éviter foules, Éviter hauteurs, Peur avion, Mobilité réduite...)

**Pourquoi cette branche existe** : On ne pose des questions sur les vols que si l'utilisateur veut qu'on l'aide avec ça. Idem pour l'hébergement et les activités. Ça évite de poser 15 questions inutiles à quelqu'un qui gère ses vols/hôtels lui-même.

---

#### **🌳 BRANCHE 5 : Budget détaillé**

**Condition d'affichage** : Si `budget_type` = "Budget total précis"

**Questions supplémentaires** (2 questions) :
1. **Montant exact** (champ numérique)
2. **Devise** (EUR, USD, GBP, CHF, CAD, AUD)

**Si budget_type = "Estimation par jour"** : Aucune question supplémentaire

**Pourquoi cette branche existe** : Certains voyageurs ont un budget précis en tête (ex: "J'ai 3000€ pour ce voyage"), d'autres préfèrent une estimation journalière (ex: "100€/jour").

---

## **🌲 ARBRE DE DÉCISION COMPLET**

Voici l'arbre de décision complet du questionnaire :

```
START
  │
  ├─ 1. Qui voyage ? ────────────────────┐
  │    • Solo                             │
  │    • En duo                           │
  │    • Groupe (3-5 personnes) ──┐       │
  │    • En famille ─────────┐    │       │
  │                          │    │       │
  │    ┌─────────────────────┘    │       │
  │    │ 1b. Détails voyageurs    │       │
  │    │     (nombre exact et âges)│      │
  │    └──────────────────────────┘       │
  │                                       │
  ├─ 2. Destination en tête ? ────────────┤
  │    • Oui ──────────────┐              │
  │    • Non ──────────┐   │              │
  │    • Peu importe   │   │              │
  │                    │   │              │
  │    ┌───────────────┘   │              │
  │    │ 2c. Quelle        │              │
  │    │     destination ? │              │
  │    └───────────────┐   │              │
  │                    │   │              │
  │    ┌───────────────┘   │              │
  │    │ 2d. Climat        │              │
  │    │ 2e. Affinités     │              │
  │    │ 2f. Ambiance      │              │
  │    │ 2g. Ville départ  │              │
  │    └───────────────────┘              │
  │                                       │
  ├─ 2b. Comment Travliaq peut aider ? ───┤
  │    □ Vols ─────────────┐              │
  │    □ Hébergement ───┐  │              │
  │    □ Activités ──┐  │  │              │
  │                  │  │  │              │
  │    ┌─────────────┘  │  │              │
  │    │ Activités = ✓  │  │              │
  │    │ ↓              │  │              │
  │    │ 6. Style       │  │              │
  │    │    (si dest    │  │              │
  │    │     précise)   │  │              │
  │    │ 7. Rythme      │  │              │
  │    │ 16. Horloge    │  │              │
  │    │     biologique │  │              │
  │    └────────────────┘  │              │
  │                        │              │
  │    ┌───────────────────┘              │
  │    │ Vols = ✓                         │
  │    │ ↓                                │
  │    │ 8. Préférence vol                │
  │    │ 9. Bagages                       │
  │    └──────────────────────────────────┤
  │                                       │
  │    ┌───────────────────────────────┐  │
  │    │ Hébergement = ✓               │  │
  │    │ ↓                             │  │
  │    │ 11. Type hébergement          │  │
  │    │ 11b. Préférences hôtel        │  │
  │    │      (si "Hôtel" sélectionné) │  │
  │    │ 12. Confort                   │  │
  │    │ 13. Quartier                  │  │
  │    │ 14. Équipements               │  │
  │    └───────────────────────────────┘  │
  │                                       │
  │    ┌───────────────────────────────┐  │
  │    │ Hébergement OU Activités = ✓  │  │
  │    │ ↓                             │  │
  │    │ 15. Sécurité & Phobies        │  │
  │    └───────────────────────────────┘  │
  │                                       │
  ├─ 10. Mobilité sur place ──────────────┤
  │                                       │
  ├─ 3. Type de dates ─────────────────┐  │
  │    • Dates précises ───────────┐   │  │
  │    • Dates flexibles ──────┐   │   │  │
  │    • Pas de dates          │   │   │  │
  │                            │   │   │  │
  │    ┌───────────────────────┘   │   │  │
  │    │ 3b. Sélecteur dates       │   │  │
  │    └───────────────────────────┘   │  │
  │                                    │  │
  │    ┌────────────────────────────────┘  │
  │    │ 3c. Flexibilité                   │
  │    │ 3d. Date approx ? (Oui/Non) ──┐   │
  │    │                                │   │
  │    │ ┌──────────────────────────────┘   │
  │    │ │ 3e. Sélecteur date approx        │
  │    │ └──────────────────────────────┐   │
  │    │                                │   │
  │    │ 4. Durée ──────────────────┐   │   │
  │    │                            │   │   │
  │    │ ┌──────────────────────────┘   │   │
  │    │ │ Si "Plus de 2 semaines"      │   │
  │    │ │ ↓                            │   │
  │    │ │ 4b. Nombre exact de nuits    │   │
  │    │ └──────────────────────────────┘   │
  │    └────────────────────────────────────┤
  │                                         │
  ├─ 5. Budget ─────────────────────────┐   │
  │    • Économique                     │   │
  │    • Modéré                         │   │
  │    • Confortable                    │   │
  │    • Haut de gamme                  │   │
  │    • Luxe                           │   │
  │                                     │   │
  │    Type ? ───────────────────────┐  │   │
  │    • Estimation par jour         │  │   │
  │    • Budget total précis ────┐   │  │   │
  │                              │   │  │   │
  │    ┌──────────────────────────┘   │  │   │
  │    │ 5b. Montant exact            │  │   │
  │    │ 5c. Devise                   │  │   │
  │    └──────────────────────────────┘  │   │
  │                                     │   │
  ├─ 17. Contraintes ───────────────────┤   │
  │                                     │   │
  ├─ 18. Zone ouverte ──────────────────┤   │
  │                                     │   │
  └─ 19. Email ─────────────────────────┘   │
                                            │
                                           END
```

---

## **📊 DESCRIPTION DÉTAILLÉE DES CHAMPS**

### **Section 1 : INFORMATIONS DE BASE** (automatiques)

#### **user_id** 🆔
- **Type** : UUID
- **Obligatoire** : Oui
- **Généré automatiquement** : Via JWT d'authentification
- **À quoi ça sert** : Associer la réponse à l'utilisateur connecté
- **Stockage** : Base de données Supabase

#### **email** ✉️
- **Type** : String (max 255 caractères)
- **Obligatoire** : Oui
- **Question** : "Votre email pour recevoir vos recommandations"
- **À quoi ça sert** : Envoyer les recommandations de voyage personnalisées
- **Validation** : Format email valide

#### **language** 🌍
- **Type** : Enum ('fr' | 'en')
- **Obligatoire** : Oui
- **Généré automatiquement** : Détecté via i18n.language
- **À quoi ça sert** : Savoir dans quelle langue l'utilisateur a répondu (pour personnaliser l'email)
- **Valeurs** :
  - `'fr'` : Questionnaire rempli en français
  - `'en'` : Questionnaire rempli en anglais

---

### **Section 2 : PROFIL VOYAGEUR**

#### **travel_group** 👥
- **Type** : String
- **Question** : "Qui voyage ?"
- **À quoi ça sert** : Déterminer le profil du groupe et adapter les questions suivantes
- **Impact** : Déclenche des questions sur le nombre exact de voyageurs et les enfants
- **Valeurs possibles** :
  - `"Solo"` : Voyage en solo (1 personne) → Passe directement à l'étape suivante
  - `"En duo"` (ou "Duo") : Voyage à deux (couple ou amis) → Passe directement à l'étape suivante
  - `"Groupe (3-5 personnes)"` : Groupe de 3 à 5 personnes → **Déclenche Step 1b** (détails voyageurs)
  - `"En famille"` : Voyage en famille → **Déclenche Step 1b** (détails voyageurs avec enfants)

#### **travelers** 👥
- **Type** : Array d'objets `[{ type: 'adult' | 'child', age?: number }]`
- **Question** : Interface interactive avec deux boutons "Ajouter un adulte" / "Ajouter un enfant"
- **Affiché si** : `travel_group` = "En famille" OU "Groupe (3-5 personnes)"
- **À quoi ça sert** : Système moderne de gestion des voyageurs avec distinction adultes/enfants
- **Exemple** : `[{ "type": "adult" }, { "type": "adult" }, { "type": "child", "age": 8 }]`
- **Impact** : Calcule automatiquement `number_of_travelers` et extrait `children` pour compatibilité

#### **number_of_travelers** 🔢
- **Type** : Integer (1-50)
- **Généré automatiquement** : `travelers.length` si le système `travelers` est utilisé
- **Affiché si** : `travel_group` = "En famille" OU "Groupe (3-5 personnes)"
- **À quoi ça sert** : Nombre total de voyageurs pour calculer les prix et les besoins en bagages
- **Impact** : Détermine le nombre de voyageurs pour la question des bagages

#### **children** 👶
- **Type** : Array d'objets `[{ age: number }]`
- **Généré automatiquement** : Extrait des `travelers` où `type === 'child'`
- **Affiché si** : `travel_group` = "En famille"
- **À quoi ça sert** : Compatibilité avec l'ancien système + Adapter les recommandations aux familles
- **Contraintes** : Âge entre 0 et 17 ans, maximum 20 enfants
- **Exemple** : `[{ age: 5 }, { age: 10 }]`

---

### **Section 3 : DESTINATION**

#### **has_destination** 🌍
- **Type** : String
- **Question** : "Avez-vous déjà une destination en tête ?"
- **À quoi ça sert** : Point de bifurcation principal - détermine si on demande une destination précise OU des critères de recherche
- **Impact** : Déclenche 1 question (Oui) ou 4 questions (Non)
- **Valeurs possibles** :
  - `"Oui"` → Question : "Quelle destination ?"
  - `"Non"` → Questions : Climat, Affinités, Ambiance, Ville de départ
  - `"Peu importe"` → Questions : Climat, Affinités, Ambiance, Ville de départ

#### **destination** 📍
- **Type** : String (max 200 caractères)
- **Question** : "Quelle destination ?"
- **Affiché si** : `has_destination` = "Oui"
- **À quoi ça sert** : Destination précise souhaitée par l'utilisateur
- **Format** : "Ville, Pays 🇫🇷" (avec emoji drapeau)
- **Autocomplétion** : 500+ villes majeures du monde entier
- **Exemple** : `"Tokyo, Japon 🇯🇵"`, `"Bali, Indonésie 🇮🇩"`

#### **departure_location** 🛫
- **Type** : String (max 200 caractères)
- **Question** : "D'où partez-vous ?"
- **Affiché si** : `has_destination` = "Non" OU "Peu importe"
- **À quoi ça sert** : Calculer les temps de vol et proposer des destinations accessibles
- **Fonctionnalité** : Géolocalisation automatique possible (bouton GPS)
- **Exemple** : `"Paris, France"`, `"Bruxelles, Belgique"`

#### **climate_preference** 🌤️
- **Type** : Array de strings
- **Question** : "Quel climat préférez-vous ?"
- **Affiché si** : `has_destination` = "Non" OU "Peu importe"
- **À quoi ça sert** : Filtrer les destinations selon les préférences météo
- **Sélection multiple** : Oui
- **Valeurs possibles** :
  - `"Chaud et ensoleillé ☀️"` (> 25°C)
  - `"Tropical 🌴"` (chaud + humide)
  - `"Tempéré 🌤️"` (15-25°C)
  - `"Frais et sec ❄️"` (< 15°C)
  - `"Montagne ⛰️"` (altitude)
  - `"Peu importe 🌍"` (aucune préférence)

#### **travel_affinities** ❤️
- **Type** : Array de strings (max 5 sélections)
- **Question** : "Qu'est-ce qui vous attire dans un voyage ?"
- **Affiché si** : `has_destination` = "Non" OU "Peu importe"
- **À quoi ça sert** : Comprendre les centres d'intérêt pour proposer des destinations adaptées
- **Maximum** : 5 sélections
- **Valeurs possibles** (15 options) :
  - `"Culture & Histoire 🏛️"`
  - `"Gastronomie 🍽️"`
  - `"Nature & Paysages 🏞️"`
  - `"Plages & Détente 🏖️"`
  - `"Aventure & Sports 🏔️"`
  - `"Shopping 🛍️"`
  - `"Vie nocturne 🎉"`
  - `"Spiritualité 🕉️"`
  - `"Art & Design 🎨"`
  - `"Famille & Enfants 👨‍👩‍👧‍👦"`
  - `"Photographie 📸"`
  - `"Rencontres & Échanges 🤝"`
  - `"Yoga & Bien-être 🧘"`
  - `"Écotourisme 🌱"`
  - `"Luxe & Confort 💎"`

#### **travel_ambiance** 🎭
- **Type** : String
- **Question** : "Quelle ambiance recherchez-vous ?"
- **Affiché si** : `has_destination` = "Non" OU "Peu importe"
- **À quoi ça sert** : Affiner le type de destination (ville vs nature)
- **Valeurs possibles** :
  - `"Animée et urbaine 🏙️"` (grandes villes, vie nocturne)
  - `"Calme et nature 🌿"` (campagne, montagne, bord de mer)
  - `"Mix des deux 🎭"` (alternance ville et nature)

---

### **Section 4 : SERVICES SOUHAITÉS**

#### **helpWith** (non stocké en base) 🆘
- **Type** : Array de strings
- **Question** : "Comment Travliaq peut vous aider ?"
- **À quoi ça sert** : **POINT CENTRAL** qui détermine quelles sections afficher
- **Valeurs possibles** :
  - `"Vols"` → Affiche questions 8-9 (vol + bagages)
  - `"Hébergement"` → Affiche questions 11-14 (type, confort, quartier, équipements)
  - `"Activités"` → Affiche questions 6-7 et 16 (style, rythme, horloge biologique)
- **Impact majeur** : Fait varier le nombre d'étapes de 10 à 25+
- **Sélection multiple** : Oui, toutes les combinaisons possibles

---

### **Section 5 : DATES ET DURÉE**

#### **dates_type** 📅
- **Type** : String
- **Question** : "Comment sont vos dates ?"
- **À quoi ça sert** : Déterminer le niveau de flexibilité sur les dates
- **Impact** : Déclenche des questions différentes selon le choix
- **Valeurs possibles** :
  - `"Dates précises"` → Affiche sélecteur de dates (départ + retour)
  - `"Dates flexibles"` → Affiche 4-5 questions sur la flexibilité et la durée
  - `"Pas de dates précises"` → Affiche questions sur la durée uniquement

#### **departure_date** 🛫
- **Type** : Date (format ISO: YYYY-MM-DD)
- **Question** : "Date de départ"
- **Affiché si** : `dates_type` = "Dates précises"
- **À quoi ça sert** : Date de départ exacte pour recherche de vols/hôtels
- **Format** : Sélecteur de calendrier visuel
- **Exemple** : `"2025-07-15"`

#### **return_date** 🛬
- **Type** : Date (format ISO: YYYY-MM-DD)
- **Question** : "Date de retour"
- **Affiché si** : `dates_type` = "Dates précises"
- **À quoi ça sert** : Date de retour exacte
- **Validation** : Doit être >= departure_date
- **Exemple** : `"2025-07-29"`

#### **flexibility** 🔄
- **Type** : String
- **Question** : "Quelle flexibilité sur les dates ?"
- **Affiché si** : `dates_type` = "Dates flexibles"
- **À quoi ça sert** : Comprendre la marge de manœuvre sur les dates
- **Valeurs possibles** :
  - `"±1 jour"` (très peu flexible)
  - `"±2-3 jours"` (flexible)
  - `"±1 semaine"` (très flexible)
  - `"Totalement flexible"` (aucune contrainte)

#### **has_approximate_departure_date** 📆
- **Type** : String ("Oui" | "Non")
- **Question** : "Avez-vous une période approximative de départ ?"
- **Affiché si** : `dates_type` = "Dates flexibles"
- **À quoi ça sert** : Savoir si on doit afficher un date picker pour date approximative
- **Impact** : Si "Oui" → Affiche question suivante

#### **approximate_departure_date** 📅
- **Type** : Date (format ISO: YYYY-MM-DD)
- **Question** : "Quelle période approximativement ?"
- **Affiché si** : `has_approximate_departure_date` = "Oui"
- **À quoi ça sert** : Date approximative pour orienter la recherche
- **Exemple** : `"2025-09-01"` (début septembre, mais flexible)

#### **duration** ⏱️
- **Type** : String
- **Question** : "Durée souhaitée du séjour"
- **Affiché si** : `dates_type` = "Dates flexibles" OU "Pas de dates précises"
- **À quoi ça sert** : Nombre de jours/semaines souhaités
- **Impact** : Si "Plus de 2 semaines" → Affiche question suivante
- **Valeurs possibles** :
  - `"Week-end (2-3 jours)"`
  - `"1 semaine (4-7 jours)"`
  - `"10 jours"`
  - `"2 semaines"`
  - `"Plus de 2 semaines"` → Déclenche question nombre exact

#### **exact_nights** 🌙
- **Type** : Integer (1-365)
- **Question** : "Combien de nuits exactement ?"
- **Affiché si** : `duration` = "Plus de 2 semaines"
- **À quoi ça sert** : Nombre précis de nuits pour longs séjours
- **Exemple** : `21` (3 semaines), `30` (1 mois)

---

### **Section 6 : BUDGET**

#### **budget** 💰
- **Type** : String
- **Question** : "Quel est votre budget ?"
- **À quoi ça sert** : Catégorie de budget pour filtrer les recommandations
- **Valeurs possibles** :
  - `"Économique (< 50€/jour)"` (backpacker, auberges)
  - `"Modéré (50-100€/jour)"` (hôtels 2-3 étoiles)
  - `"Confortable (100-200€/jour)"` (hôtels 3-4 étoiles)
  - `"Haut de gamme (> 200€/jour)"` (hôtels 4-5 étoiles)
  - `"Luxe (> 500€/jour)"` (expériences premium)

#### **budget_type** 💵
- **Type** : String
- **Question** : "Comment définissez-vous votre budget ?"
- **À quoi ça sert** : Savoir si le budget est une estimation ou un montant précis
- **Impact** : Si "Budget total précis" → Affiche 2 questions suivantes
- **Valeurs possibles** :
  - `"Estimation par jour"` (budget/jour flexible)
  - `"Budget total précis"` → Déclenche questions montant + devise

#### **budget_amount** 💶
- **Type** : Number (0-10,000,000)
- **Question** : "Quel est le montant de votre budget ?"
- **Affiché si** : `budget_type` = "Budget total précis"
- **À quoi ça sert** : Montant total disponible pour le voyage
- **Exemple** : `3000`, `8000`, `15000`

#### **budget_currency** 💱
- **Type** : String
- **Question** : "Devise"
- **Affiché si** : `budget_type` = "Budget total précis"
- **À quoi ça sert** : Convertir le budget dans la devise appropriée
- **Valeurs possibles** :
  - `"EUR"` (Euro)
  - `"USD"` (Dollar américain)
  - `"GBP"` (Livre sterling)
  - `"CHF"` (Franc suisse)
  - `"CAD"` (Dollar canadien)
  - `"AUD"` (Dollar australien)

---

### **Section 7 : STYLE ET RYTHME** (si Activités sélectionnées)

#### **styles** 🎨
- **Type** : Array de strings
- **Question** : "Quel style de voyage vous attire ?"
- **Affiché si** : `has_destination` = "Oui" ET "Activités" sélectionnées
- **À quoi ça sert** : Affiner les activités recommandées
- **Sélection multiple** : Oui
- **Valeurs possibles** :
  - `"Culturel"` (musées, patrimoine)
  - `"Gastronomique"` (restaurants, marchés)
  - `"Nature"` (randonnées, parcs)
  - `"Plages"` (mer, détente)
  - `"Aventure"` (sports, sensations)
  - `"Shopping"` (boutiques, centres commerciaux)
  - `"Vie nocturne"` (bars, clubs)

#### **rhythm** 🏃
- **Type** : String
- **Question** : "Quel rythme pour votre voyage ?"
- **Affiché si** : "Activités" sélectionnées
- **À quoi ça sert** : Déterminer la densité des activités proposées
- **Valeurs possibles** :
  - `"Tranquille (beaucoup de temps libre)"` (1-2 activités/jour)
  - `"Équilibré (mix activités et repos)"` (2-3 activités/jour)
  - `"Intense (programme chargé)"` (4+ activités/jour)

---

### **Section 8 : TRANSPORT** (si Vols sélectionnés)

#### **flight_preference** ✈️
- **Type** : String
- **Question** : "Préférence pour les vols"
- **Affiché si** : "Vols" sélectionnés dans "Comment Travliaq peut aider ?"
- **À quoi ça sert** : Critères de recherche de vols
- **Valeurs possibles** :
  - `"Vol direct uniquement"` (aucune escale)
  - `"1 escale maximum"` (accepte 1 escale)
  - `"Peu importe (le moins cher)"` (prix prioritaire)

#### **luggage** 🧳
- **Type** : Object `{ "0": "type", "1": "type", ... }`
- **Question** : "Bagages pour chaque voyageur"
- **Affiché si** : "Vols" sélectionnés
- **À quoi ça sert** : Calculer les frais de bagages et filtrer les compagnies
- **Format** : Clé = index du voyageur, Valeur = type de bagage
- **Valeurs possibles** :
  - `"Bagage cabine uniquement"`
  - `"1 bagage en soute"`
  - `"2 bagages en soute"`
  - `"3+ bagages en soute"`
- **Exemple** : 
  ```json
  {
    "0": "1 bagage en soute",
    "1": "Bagage cabine uniquement"
  }
  ```

#### **mobility** 🚗
- **Type** : Array de strings
- **Question** : "Comment vous déplacerez-vous sur place ?"
- **À quoi ça sert** : Recommandations sur les transports locaux
- **Sélection multiple** : Oui
- **Valeurs possibles** :
  - `"Transports en commun 🚇"` (métro, bus)
  - `"Marche à pied 🚶"` (à pied)
  - `"Vélo 🚴"` (vélo, trottinette)
  - `"Voiture de location 🚗"` (location voiture)
  - `"Taxi/VTC 🚕"` (Uber, taxis)
  - `"Train 🚄"` (trains régionaux)
  - `"Moto/Scooter 🏍️"` (deux-roues)

---

### **Section 9 : HÉBERGEMENT** (si Hébergement sélectionné)

#### **accommodation_type** 🏨
- **Type** : Array de strings
- **Question** : "Type d'hébergement préféré"
- **Affiché si** : "Hébergement" sélectionné dans "Comment Travliaq peut aider ?"
- **À quoi ça sert** : Filtrer les hébergements disponibles
- **Impact** : Si "Hôtel" sélectionné → Affiche question suivante sur préférences hôtel
- **Sélection multiple** : Oui
- **Valeurs possibles** :
  - `"Hôtel 🏨"` → Déclenche question préférences hôtel
  - `"Appartement/Airbnb 🏠"`
  - `"Auberge de jeunesse 🎒"`
  - `"Chambre d'hôtes 🏡"`
  - `"Resort/Club 🌴"`
  - `"Éco-lodge 🌿"`
  - `"Camping ⛺"`

#### **hotelPreferences** (non stocké) 🏨
- **Type** : Array de strings
- **Question** : "Préférences pour l'hôtel"
- **Affiché si** : "Hôtel" sélectionné dans `accommodation_type`
- **À quoi ça sert** : Options de pension (all-inclusive, demi-pension...)
- **Sélection multiple** : Oui
- **Valeurs possibles** :
  - `"Full-inclusif (all-inclusive)"`
  - `"Demi-pension (petit-déjeuner + dîner)"`
  - `"Petit-déjeuner uniquement"`
  - `"Rien (je gère mes repas)"`

#### **comfort** 🛏️
- **Type** : String
- **Question** : "Niveau de confort minimum"
- **Affiché si** : "Hébergement" sélectionné
- **À quoi ça sert** : Filtrer par standing (équivalent étoiles)
- **Valeurs possibles** :
  - `"Basique (propre et fonctionnel)"` (1-2 étoiles)
  - `"Standard (confortable)"` (2-3 étoiles)
  - `"Supérieur (très confortable)"` (3-4 étoiles)
  - `"Luxe (haut de gamme)"` (4-5 étoiles)

#### **neighborhood** 🏘️
- **Type** : String
- **Question** : "Type de quartier recherché"
- **Affiché si** : "Hébergement" sélectionné
- **À quoi ça sert** : Emplacement géographique souhaité
- **Valeurs possibles** :
  - `"Centre-ville/Touristique"` (près attractions)
  - `"Quartier authentique/Local"` (quartiers résidentiels)
  - `"Calme/Résidentiel"` (loin du bruit)
  - `"Peu importe"` (pas de préférence)

#### **amenities** 🎯
- **Type** : Array de strings
- **Question** : "Équipements souhaités"
- **Affiché si** : "Hébergement" sélectionné
- **À quoi ça sert** : Filtrer par équipements disponibles
- **Sélection multiple** : Oui (max 50)
- **Valeurs possibles** :
  - `"WiFi 📶"`
  - `"Climatisation ❄️"`
  - `"Piscine 🏊"`
  - `"Cuisine équipée 🍳"`
  - `"Lave-linge 🧺"`
  - `"Parking 🅿️"`
  - `"Petit-déjeuner inclus 🥐"`
  - `"Spa/Wellness 💆"`
  - `"Salle de sport 🏋️"`
  - `"Balcon/Terrasse 🌅"`
  - `"Vue mer/montagne 🏞️"`
  - `"Espace yoga/méditation 🧘"`

---

### **Section 10 : CONTRAINTES ET SÉCURITÉ**

#### **security** 🔐
- **Type** : Array de strings
- **Question** : "Contraintes de sécurité ou phobies"
- **Affiché si** : "Hébergement" OU "Activités" sélectionnés
- **À quoi ça sert** : Éviter certaines situations/lieux selon les phobies
- **Sélection multiple** : Oui (max 20)
- **Valeurs possibles** :
  - `"Éviter foule/espaces bondés 👥"` (agoraphobie)
  - `"Éviter hauteurs 🏔️"` (vertige)
  - `"Peur de l'avion ✈️"` (aérophobie)
  - `"Peur de l'eau/mer 🌊"` (aquaphobie)
  - `"Problèmes de mobilité réduite ♿"` (accessibilité)
  - `"Éviter zones dangereuses 🚨"` (sécurité)
  - `"Peur des insectes/animaux 🦟"` (entomophobie)

#### **biorhythm** ⏰
- **Type** : Array de strings
- **Question** : "Votre horloge biologique"
- **Affiché si** : "Activités" sélectionnées
- **À quoi ça sert** : Adapter les horaires des activités
- **Sélection multiple** : Oui (max 20)
- **Valeurs possibles** :
  - `"Lève-tôt 🌅"` (5h-7h)
  - `"Couche-tard 🌙"` (23h-2h)
  - `"Besoin de siestes régulières 😴"`
  - `"Besoin de pauses régulières ☕"`
  - `"Aime voyager hors-saison 🍂"`
  - `"Préfère haute-saison 🌞"`

#### **constraints** 🚫
- **Type** : Array de strings
- **Question** : "Contraintes diverses"
- **À quoi ça sert** : Contraintes alimentaires, religieuses, médicales
- **Sélection multiple** : Oui (max 50)
- **Valeurs possibles** :
  - `"Allergies alimentaires 🥜"`
  - `"Végétarien/Vegan 🌱"`
  - `"Sans gluten 🌾"`
  - `"Halal/Casher 🕌"`
  - `"Problèmes de santé spécifiques 💊"`
  - `"Besoin de médicaments particuliers 💉"`
  - `"Contraintes religieuses 🕌"`

---

### **Section 11 : INFORMATIONS COMPLÉMENTAIRES**

#### **additional_info** 📝
- **Type** : String (max 2000 caractères)
- **Question** : "Informations complémentaires"
- **À quoi ça sert** : Zone de texte libre pour toute information non couverte
- **Exemple** : 
  - "Premier voyage au Japon, besoin d'accompagnement pour la langue"
  - "Nous aimerions célébrer notre anniversaire pendant ce voyage"
  - "Un enfant est végétarien, merci de prévoir des options adaptées"

---

## **🛤️ EXEMPLES DE PARCOURS COMPLETS**

### **Parcours 1 : Famille avec enfants, destination précise, tout géré** 👨‍👩‍👧‍👦

**Profil** : Famille de 4 personnes (2 adultes + 2 enfants) souhaitant aller au Japon avec aide complète (vols + hébergement + activités)

**Questions posées** : ~22 étapes

```
1. Qui voyage ? → "En famille"
  1b. Détails voyageurs (Interface interactive) :
      - Ajouter 2 adultes
      - Ajouter 1 enfant (âge: 8 ans)
      - Ajouter 1 enfant (âge: 12 ans)
      → Badge affiché : "2 adultes, 2 enfants"

2. Destination en tête ? → "Oui"
  2c. Quelle destination ? → "Tokyo, Japon 🇯🇵"

2b. Comment Travliaq peut aider ? → ✓ Vols + ✓ Hébergement + ✓ Activités

6. Style de voyage → "Culture & Histoire", "Gastronomie", "Nature"
7. Rythme → "Équilibré (mix activités et repos)"

3. Type de dates → "Dates précises"
  3b. Dates → Départ: 15/07/2025, Retour: 29/07/2025

5. Budget → "Confortable (100-200€/jour)"
  Budget type → "Budget total précis"
  5b. Montant → 8000
  5c. Devise → "EUR"

8. Préférence vol → "1 escale maximum"
9. Bagages → Voyageur 1: "1 bagage soute", Voyageur 2: "1 bagage soute", 
            Voyageur 3: "Cabine uniquement", Voyageur 4: "Cabine uniquement"

10. Mobilité → "Transports en commun", "Marche à pied", "Train"

11. Type hébergement → "Hôtel", "Appartement/Airbnb"
  11b. Préférences hôtel → "Petit-déjeuner uniquement"
12. Confort → "Standard (confortable)"
13. Quartier → "Quartier authentique/Local"
14. Équipements → "WiFi", "Climatisation", "Cuisine équipée", "Lave-linge"

15. Sécurité → "Éviter foule/espaces bondés"
16. Horloge biologique → "Lève-tôt", "Besoin de pauses régulières"

17. Contraintes → "Allergies alimentaires", "Végétarien/Vegan"
18. Zone ouverte → "Premier voyage au Japon en famille. Un enfant est végétarien."
19. Email → jean.dupont@example.com
```

**JSON de sortie** : Voir "Exemple 1" dans la section Structure JSON

---

### **Parcours 2 : Solo, destination flexible, juste activités** 🎒

**Profil** : Voyageur solo flexible sur la destination, gère ses vols/hôtels, veut juste des recommandations d'activités

**Questions posées** : ~15 étapes

```
1. Qui voyage ? → "Solo"

2. Destination en tête ? → "Non"
  2d. Climat → "Chaud et ensoleillé", "Tropical"
  2e. Affinités → "Plages & Détente", "Yoga & Bien-être", "Nature", "Rencontres"
  2f. Ambiance → "Mix des deux"
  2g. Ville de départ → "Bruxelles, Belgique" (géolocalisé)

2b. Comment Travliaq peut aider ? → ✓ Activités uniquement

7. Rythme → "Tranquille (beaucoup de temps libre)"

3. Type de dates → "Dates flexibles"
  3c. Flexibilité → "Totalement flexible"
  3d. Date approx ? → "Oui"
  3e. Date approx → 01/09/2025
  4. Durée → "10 jours"

5. Budget → "Modéré (50-100€/jour)"
  Budget type → "Estimation par jour"

10. Mobilité → "Transports en commun", "Marche à pied", "Vélo"

16. Horloge biologique → "Lève-tôt", "Aime voyager hors-saison"

17. Contraintes → "Végétarien/Vegan"
18. Zone ouverte → "Je cherche une destination calme pour me ressourcer, idéalement avec des cours de yoga."
19. Email → marie.martin@example.com
```

**JSON de sortie** : Voir "Exemple 2" dans la section Structure JSON

---

### **Parcours 3 : Couple, destination précise, juste vols** ✈️

**Profil** : Couple ayant déjà réservé l'hôtel et les activités, cherche uniquement des vols

**Questions posées** : ~12 étapes

```
1. Qui voyage ? → "En duo"

2. Destination en tête ? → "Oui"
  2c. Quelle destination ? → "Lisbonne, Portugal 🇵🇹"

2b. Comment Travliaq peut aider ? → ✓ Vols uniquement

3. Type de dates → "Dates précises"
  3b. Dates → Départ: 12/05/2025, Retour: 19/05/2025

5. Budget → "Haut de gamme (> 200€/jour)"
  Budget type → "Estimation par jour"

8. Préférence vol → "Vol direct uniquement"
9. Bagages → Voyageur 1: "1 bagage soute", Voyageur 2: "1 bagage soute"

10. Mobilité → "Transports en commun", "Marche à pied"

17. Contraintes → (aucune)
18. Zone ouverte → (vide)
19. Email → couple@example.com
```

**Nombre d'étapes** : ~12 (questionnaire court car aucune question sur hébergement ni activités)

---

## **📦 STRUCTURE JSON DE SORTIE**

Voici la structure JSON complète générée par le questionnaire :

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "jean.dupont@example.com",
  "language": "fr",
  
  "travel_group": "En famille",
  "travelers": [
    { "type": "adult" },
    { "type": "adult" },
    { "type": "child", "age": 8 },
    { "type": "child", "age": 12 }
  ],
  "number_of_travelers": 4,
  "children": [
    { "age": 8 },
    { "age": 12 }
  ],
  
  "has_destination": "Oui",
  "destination": "Tokyo, Japon 🇯🇵",
  "departure_location": null,
  "climate_preference": null,
  "travel_affinities": null,
  "travel_ambiance": null,
  
  "dates_type": "Dates précises",
  "departure_date": "2025-07-15",
  "return_date": "2025-07-29",
  "flexibility": null,
  "has_approximate_departure_date": null,
  "approximate_departure_date": null,
  "duration": "2 semaines",
  "exact_nights": 14,
  
  "budget": "Confortable (100-200€/jour)",
  "budget_type": "Budget total précis",
  "budget_amount": 8000,
  "budget_currency": "EUR",
  
  "styles": [
    "Culture & Histoire 🏛️",
    "Gastronomie 🍽️",
    "Nature & Paysages 🏞️"
  ],
  "rhythm": "Équilibré (mix activités et repos)",
  
  "flight_preference": "1 escale maximum",
  "luggage": {
    "0": "1 bagage en soute",
    "1": "1 bagage en soute",
    "2": "Bagage cabine uniquement",
    "3": "Bagage cabine uniquement"
  },
  "mobility": [
    "Transports en commun 🚇",
    "Marche à pied 🚶",
    "Train 🚄"
  ],
  
  "accommodation_type": [
    "Hôtel 🏨",
    "Appartement/Airbnb 🏠"
  ],
  "comfort": "Standard (confortable)",
  "neighborhood": "Quartier authentique/Local",
  "amenities": [
    "WiFi 📶",
    "Climatisation ❄️",
    "Cuisine équipée 🍳",
    "Lave-linge 🧺"
  ],
  
  "security": [
    "Éviter foule/espaces bondés 👥"
  ],
  "biorhythm": [
    "Lève-tôt 🌅",
    "Besoin de pauses régulières ☕"
  ],
  "constraints": [
    "Allergies alimentaires 🥜",
    "Végétarien/Vegan 🌱"
  ],
  
  "additional_info": "C'est notre premier voyage au Japon en famille. Nous aimerions découvrir la culture traditionnelle tout en gardant des activités adaptées aux enfants. Un de nos enfants est végétarien."
}
```

### **Champs toujours présents**

- `user_id` (UUID)
- `email` (string)
- `language` ('fr' | 'en')
- `created_at` (timestamp - généré automatiquement)
- `updated_at` (timestamp - généré automatiquement)

### **Champs conditionnels (peuvent être null)**

Tous les autres champs peuvent être `null` selon les réponses de l'utilisateur.

---

## **📊 UTILISATION DES DONNÉES**

### **Côté backend - Edge Function**

L'Edge Function `submit-questionnaire` :

✅ **Valide** toutes les données (email, ranges numériques, formats de dates)

✅ **Vérifie l'authentification** (JWT valide requis)

✅ **Rate limiting** : 3 requêtes/minute par IP

✅ **Quota** : 2 soumissions/utilisateur/email par 24h

✅ **Insère** les données dans `questionnaire_responses`

✅ **Retourne** l'ID de la réponse créée

### **Côté frontend - Traitement**

Une fois le questionnaire soumis :

1. **Enregistrement en base** via Edge Function
2. **Email automatique** à l'utilisateur avec son ID de réponse
3. **Traitement par l'équipe Travliaq** :
   - Lecture des préférences
   - Création d'un trip personnalisé
   - Envoi du trip par email

### **Utilisation future**

Les données peuvent servir à :

- **Recommandations automatiques** (algorithme IA)
- **Statistiques** (destinations populaires, budgets moyens)
- **Amélioration du questionnaire** (questions les plus abandonnées)
- **Segmentation marketing** (profils voyageurs)

---

## **💡 CONSEILS ET BONNES PRATIQUES**

### **Pour les développeurs**

✅ **Toujours vérifier les conditions d'affichage** avant d'ajouter une nouvelle question

✅ **Utiliser getTotalSteps()** pour calculer dynamiquement le nombre d'étapes

✅ **Valider côté frontend ET backend** (double sécurité)

✅ **Ne jamais faire confiance aux données client** (re-validation serveur)

✅ **Logger les erreurs** pour debugging (Edge Function)

### **Pour les product managers**

✅ **Tester tous les parcours possibles** (au moins 5-6 parcours types)

✅ **Surveiller le taux d'abandon** par étape (analytics)

✅ **Optimiser les questions les plus abandonnées**

✅ **A/B tester** l'ordre des questions

✅ **Proposer des valeurs par défaut** pour accélérer le remplissage

### **Pour les utilisateurs**

✅ **Être précis** dans les réponses (meilleure recommandation)

✅ **Ne pas hésiter à utiliser la zone ouverte** pour informations importantes

✅ **Activer la géolocalisation** pour détection automatique du lieu de départ

✅ **Sélectionner plusieurs affinités** (max 5) pour meilleure personnalisation

---

## **🔧 DEBUGGING ET MAINTENANCE**

### **Vérifier une réponse en base**

```sql
SELECT * FROM questionnaire_responses 
WHERE email = 'jean.dupont@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

### **Vérifier le quota d'un utilisateur**

```sql
SELECT COUNT(*) 
FROM questionnaire_responses
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND email = 'jean.dupont@example.com'
  AND created_at >= NOW() - INTERVAL '24 hours';
```

### **Logs de l'Edge Function**

Accessible via Supabase Dashboard → Functions → `submit-questionnaire` → Logs

Messages clés à surveiller :
- `"Checking daily quota for user:..."`
- `"Daily quota exceeded for user:..."`
- `"Inserting questionnaire response for user:..."`
- `"Database error:"` (erreurs)

### **Statistiques utiles**

```sql
-- Destinations les plus demandées
SELECT destination, COUNT(*) as count
FROM questionnaire_responses
WHERE destination IS NOT NULL
GROUP BY destination
ORDER BY count DESC
LIMIT 10;

-- Budget moyen par voyage
SELECT 
  budget,
  AVG(budget_amount) as avg_amount,
  COUNT(*) as count
FROM questionnaire_responses
WHERE budget_amount IS NOT NULL
GROUP BY budget;

-- Répartition des types de groupes
SELECT travel_group, COUNT(*) as count
FROM questionnaire_responses
GROUP BY travel_group
ORDER BY count DESC;
```

---

## **📚 RESSOURCES**

- **Code source** : `src/pages/Questionnaire.tsx`
- **Edge Function** : `supabase/functions/submit-questionnaire/index.ts`
- **Schema BDD** : Voir `questionnaire_responses` dans Supabase
- **Validation** : Zod schema dans `Questionnaire.tsx` ligne 633-672
- **Documentation technique** : `docs/QUESTIONNAIRE_JSON_SCHEMA.md`

---

## **📝 CHANGELOG**

### **Version 1.1.0** (19 octobre 2025)

✅ Ajout du champ `language` (détection automatique FR/EN)

✅ Support multilingue complet

### **Version 1.0.0** (12 octobre 2025)

✅ Lancement initial du questionnaire dynamique

✅ 19 sections principales

✅ Logique conditionnelle complète

✅ Authentification obligatoire

✅ Quota journalier (2/jour)

---

**✨ Dernière mise à jour : 19 octobre 2025**

---

Voilà ! Cette documentation explique **toute la logique métier du questionnaire**, les branches conditionnelles, à quoi sert chaque champ, et comment les données sont utilisées. C'est un guide **orienté compréhension** plutôt que technique, parfait pour Notion ! 🎉
