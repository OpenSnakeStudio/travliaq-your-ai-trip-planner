# Système de Recommandations de Voyages Dynamique

## 🎯 Vue d'ensemble

Ce système permet de créer, gérer et afficher des recommandations de voyages entièrement dynamiques stockées dans Supabase. Chaque voyage est composé d'informations générales et d'étapes individuelles, toutes hautement paramétrables.

## 📊 Architecture

### Base de données (Supabase)

Le système repose sur deux tables principales :

1. **`trips`** : Informations générales du voyage
2. **`steps`** : Étapes individuelles de chaque voyage

### Frontend (React)

- **Hook personnalisé** : `useTripData` pour charger les données
- **Composants flexibles** : Affichage conditionnel de tous les champs optionnels
- **Routing flexible** : Support de `/recommendations?code=XXX` et `/recommendations/XXX`

## 🚀 Démarrage rapide

### 1. Créer un voyage

```sql
INSERT INTO trips (code, destination, total_days, main_image)
VALUES ('MONCODE2025', 'Ma Destination', 7, 'https://...');
```

### 2. Ajouter des étapes

```sql
-- Étape complète
INSERT INTO steps (trip_id, step_number, day_number, title, subtitle, why, tips, ...)
VALUES ((SELECT id FROM trips WHERE code = 'MONCODE2025'), 1, 1, 'Titre', ...);

-- Étape minimaliste
INSERT INTO steps (trip_id, step_number, day_number, title)
VALUES ((SELECT id FROM trips WHERE code = 'MONCODE2025'), 2, 1, 'Simple Titre');
```

### 3. Accéder au voyage

Visitez : `/recommendations?code=MONCODE2025` ou `/recommendations/MONCODE2025`

## 📋 Documentation détaillée

### Guides disponibles

1. **[DYNAMIC_TRIPS_GUIDE.md](./DYNAMIC_TRIPS_GUIDE.md)** : Guide complet d'utilisation
   - Structure détaillée des tables
   - Champs obligatoires vs optionnels
   - Bonnes pratiques
   - Exemples d'utilisation

2. **[TRIP_INSERT_EXAMPLE.sql](./TRIP_INSERT_EXAMPLE.sql)** : Exemple SQL complet
   - Template prêt à copier
   - Exemples d'étapes complètes, minimalistes et hybrides
   - Scripts de vérification

3. **[TRIP_JSON_SCHEMA.md](./TRIP_JSON_SCHEMA.md)** : Schéma JSON détaillé
   - Format de données
   - Types et contraintes
   - Exemples de payload

## ✨ Fonctionnalités

### Flexibilité maximale

- ✅ Champs optionnels : La plupart des champs peuvent être omis
- ✅ Affichage conditionnel : Seuls les champs remplis sont affichés
- ✅ Coordonnées GPS optionnelles : Les étapes sans coordonnées ne bloquent pas l'affichage
- ✅ Images multiples : Galerie d'images par étape (optionnelle)
- ✅ Prix et durée : Optionnels pour chaque étape
- ✅ Météo customisable : Emojis et températures personnalisables

### Interface utilisateur

- 📱 **Responsive** : Desktop et mobile optimisés
- 🗺️ **Carte interactive** : Mapbox avec marqueurs cliquables
- 📅 **Planning visuel** : Calendrier des étapes
- 🎨 **Design moderne** : Animations et transitions fluides
- ⚡ **Navigation rapide** : Scroll synchronisé entre sections, carte et timeline

## 🛠️ Cas d'usage

### Voyage tout compris
```sql
-- Toutes les informations : vol, hôtel, prix, étapes détaillées
-- Idéal pour : Forfaits organisés, voyages de luxe
```

### Road trip minimaliste
```sql
-- Juste la destination et les étapes principales sans détails
-- Idéal pour : Voyages DIY, backpacking
```

### Voyage hybride
```sql
-- Certaines étapes détaillées (monuments), d'autres basiques (temps libre)
-- Idéal pour : Voyages semi-organisés, itinéraires flexibles
```

## 🔧 Personnalisation

### Ajouter des champs personnalisés

Pour ajouter de nouveaux champs :

1. Modifier les tables dans Supabase :
```sql
ALTER TABLE steps ADD COLUMN mon_nouveau_champ TEXT;
```

2. Mettre à jour l'interface TypeScript dans `useTripData.tsx`

3. Ajouter l'affichage conditionnel dans `DaySection.tsx`

### Modifier les styles

Les composants utilisent le système de design défini dans :
- `src/index.css` : Variables CSS
- `tailwind.config.ts` : Configuration Tailwind

## 📝 Bonnes pratiques

### Codes de voyage
- ✅ `DESTINATION2025` : Clair et mémorable
- ✅ `TOKYO-SUMMER-2025` : Descriptif
- ❌ `trip123` : Peu mémorable
- ❌ `TR-2025-001` : Trop générique

### Images
- Résolution minimale : 1920x1080
- Format : JPG ou WebP
- Optimisation : Compression recommandée
- Sources : Unsplash, Pexels, ou images personnelles

### Descriptions
- **Why** : 50-150 mots, focus sur l'intérêt
- **Tips** : Conseils pratiques et concrets
- **Transfer** : Durée et moyen de transport
- **Suggestion** : Activités complémentaires

### Coordonnées GPS
- Précision : 4-6 décimales
- Format : Latitude (Y), Longitude (X)
- Validation : Vérifier sur Google Maps
- Optionnel mais recommandé pour la carte

## 🔍 Dépannage

### Le voyage ne s'affiche pas

1. Vérifier que le code existe : `SELECT * FROM trips WHERE code = 'MONCODE';`
2. Vérifier les étapes : `SELECT * FROM steps WHERE trip_id = 'uuid-du-trip';`
3. Vérifier les logs du navigateur (F12)

### La carte ne montre pas d'étapes

- Vérifier que les coordonnées GPS sont renseignées
- Format : `latitude` et `longitude` (nombres décimaux)
- Les étapes sans coordonnées sont normales et n'empêchent pas l'affichage

### Images ne s'affichent pas

- Vérifier les URLs (doivent être publiques)
- Format recommandé : HTTPS
- Tester l'URL dans le navigateur

## 📊 Statistiques et métriques

Le système calcule automatiquement :
- Nombre total de jours
- Nombre d'étapes
- Budget total (si renseigné)
- Météo moyenne (si renseignée)
- Style de voyage (si renseigné)

## 🔐 Sécurité

### Row Level Security (RLS)

Les tables utilisent RLS pour :
- ✅ Lecture publique des voyages publiés
- ✅ Modification réservée aux administrateurs
- ✅ Protection des données sensibles

### Validation des données

- Codes uniques (contrainte DB)
- Champs obligatoires validés
- Types de données enforced par Postgres

## 🚀 Évolutions futures possibles

- [ ] Interface d'administration pour créer des voyages
- [ ] Export PDF des itinéraires
- [ ] Système de réservation intégré
- [ ] Commentaires et avis utilisateurs
- [ ] Traduction multilingue
- [ ] Suggestions IA basées sur les préférences

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation complète dans `/docs`
2. Vérifiez les exemples SQL fournis
3. Testez avec le voyage de démonstration (TOKYO2025)

## 🎉 Exemples de démonstration

Le système inclut des voyages de démonstration :
- **TOKYO2025** : Exemple complet avec toutes les fonctionnalités
- **SIDIBEL2025** : Voyage personnalisé

Utilisez-les comme référence pour créer vos propres voyages !
