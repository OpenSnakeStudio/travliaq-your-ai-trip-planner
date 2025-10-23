-- Renommage des colonnes de la table questionnaire_responses en français
-- Ceci est une refactorisation majeure pour avoir des noms de colonnes compréhensibles par tous

-- Informations de base
ALTER TABLE questionnaire_responses RENAME COLUMN travel_group TO groupe_voyage;
ALTER TABLE questionnaire_responses RENAME COLUMN number_of_travelers TO nombre_voyageurs;
ALTER TABLE questionnaire_responses RENAME COLUMN children TO enfants;

-- Destination
ALTER TABLE questionnaire_responses RENAME COLUMN has_destination TO a_destination;
ALTER TABLE questionnaire_responses RENAME COLUMN help_with TO aide_avec;
-- destination reste destination (déjà en français)
ALTER TABLE questionnaire_responses RENAME COLUMN departure_location TO lieu_depart;
ALTER TABLE questionnaire_responses RENAME COLUMN climate_preference TO preference_climat;
ALTER TABLE questionnaire_responses RENAME COLUMN travel_affinities TO affinites_voyage;
ALTER TABLE questionnaire_responses RENAME COLUMN travel_ambiance TO ambiance_voyage;

-- Dates
ALTER TABLE questionnaire_responses RENAME COLUMN dates_type TO type_dates;
ALTER TABLE questionnaire_responses RENAME COLUMN departure_date TO date_depart;
ALTER TABLE questionnaire_responses RENAME COLUMN return_date TO date_retour;
ALTER TABLE questionnaire_responses RENAME COLUMN flexibility TO flexibilite;
ALTER TABLE questionnaire_responses RENAME COLUMN has_approximate_departure_date TO a_date_depart_approximative;
ALTER TABLE questionnaire_responses RENAME COLUMN approximate_departure_date TO date_depart_approximative;
ALTER TABLE questionnaire_responses RENAME COLUMN duration TO duree;
ALTER TABLE questionnaire_responses RENAME COLUMN exact_nights TO nuits_exactes;

-- Budget
ALTER TABLE questionnaire_responses RENAME COLUMN budget_per_person TO budget_par_personne;
ALTER TABLE questionnaire_responses RENAME COLUMN budget_type TO type_budget;
ALTER TABLE questionnaire_responses RENAME COLUMN budget_amount TO montant_budget;
ALTER TABLE questionnaire_responses RENAME COLUMN budget_currency TO devise_budget;

-- Préférences
-- styles reste styles (français/anglais identique)
ALTER TABLE questionnaire_responses RENAME COLUMN rhythm TO rythme;
ALTER TABLE questionnaire_responses RENAME COLUMN schedule_prefs TO preferences_horaires;
ALTER TABLE questionnaire_responses RENAME COLUMN flight_preference TO preference_vol;
ALTER TABLE questionnaire_responses RENAME COLUMN luggage TO bagages;
ALTER TABLE questionnaire_responses RENAME COLUMN mobility TO mobilite;

-- Hébergement
ALTER TABLE questionnaire_responses RENAME COLUMN accommodation_type TO type_hebergement;
ALTER TABLE questionnaire_responses RENAME COLUMN hotel_preferences TO preferences_hotel;
ALTER TABLE questionnaire_responses RENAME COLUMN comfort TO confort;
ALTER TABLE questionnaire_responses RENAME COLUMN neighborhood TO quartier;
ALTER TABLE questionnaire_responses RENAME COLUMN amenities TO equipements;

-- Contraintes
ALTER TABLE questionnaire_responses RENAME COLUMN security TO securite;
ALTER TABLE questionnaire_responses RENAME COLUMN biorhythm TO biorythme;
ALTER TABLE questionnaire_responses RENAME COLUMN constraints TO contraintes;
ALTER TABLE questionnaire_responses RENAME COLUMN additional_info TO infos_supplementaires;

-- Méta
ALTER TABLE questionnaire_responses RENAME COLUMN language TO langue;