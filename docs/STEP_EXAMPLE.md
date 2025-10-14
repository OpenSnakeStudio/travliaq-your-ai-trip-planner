# Exemple de Step Complète avec Tous les Paramètres

Ce fichier présente un exemple complet d'une step avec **tous** les paramètres possibles, y compris les traductions anglaises et le nouveau champ `step_type`.

## Structure de la Step

```json
{
  "step_number": 5,
  "day_number": 2,
  "title": "TeamLab Borderless",
  "title_en": "TeamLab Borderless",
  "subtitle": "Musée d'art numérique",
  "subtitle_en": "Digital Art Museum",
  "main_image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80",
  "is_summary": false,
  "step_type": "activité",
  "latitude": 35.6264,
  "longitude": 139.7753,
  "why": "Expérience immersive unique au monde dans ce musée d'art numérique interactif. Les installations lumineuses réagissent à votre présence.",
  "why_en": "Unique immersive experience in the world in this interactive digital art museum. Light installations react to your presence.",
  "tips": "Réserve à l'avance, le créneau de 16h est recommandé. Porte des vêtements confortables.",
  "tips_en": "Book in advance, the 4pm slot is recommended. Wear comfortable clothing.",
  "transfer": "45 min en métro depuis Asakusa",
  "transfer_en": "45 min by subway from Asakusa",
  "suggestion": "Dîner à Odaiba avec vue sur Rainbow Bridge",
  "suggestion_en": "Dinner in Odaiba with view of Rainbow Bridge",
  "weather_icon": "☀️",
  "weather_temp": "20°C",
  "weather_description": "Ensoleillé",
  "weather_description_en": "Sunny",
  "price": 35,
  "duration": "2h30",
  "images": [
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80",
    "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&q=80"
  ]
}
```

## Insertion SQL d'une Step Complète

```sql
INSERT INTO steps (
  trip_id,
  step_number,
  day_number,
  title,
  title_en,
  subtitle,
  subtitle_en,
  main_image,
  is_summary,
  step_type,
  latitude,
  longitude,
  why,
  why_en,
  tips,
  tips_en,
  transfer,
  transfer_en,
  suggestion,
  suggestion_en,
  weather_icon,
  weather_temp,
  weather_description,
  weather_description_en,
  price,
  duration,
  images
) VALUES (
  (SELECT id FROM trips WHERE code = 'TOKYO2025'),
  5,
  2,
  'TeamLab Borderless',
  'TeamLab Borderless',
  'Musée d''art numérique',
  'Digital Art Museum',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
  false,
  'activité',
  35.6264,
  139.7753,
  'Expérience immersive unique au monde dans ce musée d''art numérique interactif. Les installations lumineuses réagissent à votre présence.',
  'Unique immersive experience in the world in this interactive digital art museum. Light installations react to your presence.',
  'Réserve à l''avance, le créneau de 16h est recommandé. Porte des vêtements confortables.',
  'Book in advance, the 4pm slot is recommended. Wear comfortable clothing.',
  '45 min en métro depuis Asakusa',
  '45 min by subway from Asakusa',
  'Dîner à Odaiba avec vue sur Rainbow Bridge',
  'Dinner in Odaiba with view of Rainbow Bridge',
  '☀️',
  '20°C',
  'Ensoleillé',
  'Sunny',
  35,
  '2h30',
  '["https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80", "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&q=80"]'::jsonb
);
```

## Notes sur les Champs

### Champs Obligatoires
- `trip_id` : ID du voyage parent (récupéré par une sous-requête)
- `step_number` : Numéro d'ordre de l'étape
- `day_number` : Jour du voyage
- `title` : Titre de l'étape

### Champs Optionnels

#### Identification et Description
- `subtitle`, `subtitle_en` : Sous-titre descriptif
- `step_type` : Type d'étape (**NOUVEAU**)
  - Exemples : "activité", "restaurant", "transport", "hébergement", "visite", "loisir"
  - Affiché avec un badge Tag dans l'interface
- `is_summary` : Si `true`, affiche une checkbox au lieu d'un numéro d'étape

#### Localisation
- `main_image` : Image principale (URL)
- `latitude`, `longitude` : Coordonnées GPS (format décimal)
  - Si non renseignées, l'étape n'apparaît pas sur la carte

#### Contenu Descriptif (avec traductions)
- `why`, `why_en` : Pourquoi visiter cette étape
- `tips`, `tips_en` : Conseils de l'IA
- `transfer`, `transfer_en` : Informations de transport
- `suggestion`, `suggestion_en` : Suggestions d'activités

#### Météo
- `weather_icon` : Emoji météo (☀️, 🌤️, ⛅, 🌧️, ❄️, 🌅)
- `weather_temp` : Température (ex: "20°C")
- `weather_description`, `weather_description_en` : Description textuelle

#### Tarification et Durée
- `price` : Prix en euros (nombre décimal)
  - Si `0`, affiche "Gratuit"
  - Si `null`, ne pas afficher
- `duration` : Durée estimée (texte libre, ex: "2h30", "Toute la journée")

#### Galerie
- `images` : Tableau JSON d'URLs d'images supplémentaires
  - Format : `'["url1", "url2"]'::jsonb`
  - Affichées dans un carousel si présentes

## Types d'Étapes Suggérés

Le champ `step_type` accepte n'importe quelle valeur textuelle. Voici des suggestions :

### Types Courants
- `activité` : Visites, excursions, expériences
- `restaurant` : Repas, cafés, marchés alimentaires
- `transport` : Transferts, trajets entre villes
- `hébergement` : Check-in/check-out hôtel
- `visite` : Monuments, musées, sites touristiques
- `loisir` : Détente, plage, spa
- `shopping` : Marchés, boutiques
- `spectacle` : Concerts, théâtre, événements

### Utilisation
Le type est affiché dans un badge semi-transparent avec une icône Tag à côté du badge "Étape X". Il permet de catégoriser visuellement les activités dans le planning.

## Support Multilingue

Les champs suivants supportent la traduction anglaise :
- `title_en` : Titre en anglais
- `subtitle_en` : Sous-titre en anglais
- `why_en` : Raison de la visite en anglais
- `tips_en` : Conseils en anglais
- `transfer_en` : Info de transport en anglais
- `suggestion_en` : Suggestions en anglais
- `weather_description_en` : Description météo en anglais

Pour ajouter d'autres langues à l'avenir, créez de nouvelles colonnes avec le suffixe approprié (ex: `_es`, `_de`, `_it`).

## Exemple Minimaliste

Pour contraste, voici une step avec uniquement les champs obligatoires :

```sql
INSERT INTO steps (
  trip_id,
  step_number,
  day_number,
  title
) VALUES (
  (SELECT id FROM trips WHERE code = 'TOKYO2025'),
  6,
  3,
  'Déjeuner libre'
);
```

Cette flexibilité permet d'adapter le niveau de détail selon vos besoins.
