-- Insert trip: Tokyo & Kyoto (code: TOKYO2025)
INSERT INTO public.trips (
  code, destination, main_image, 
  flight_from, flight_to, flight_duration, flight_type,
  hotel_name, hotel_rating, total_price,
  total_days, total_budget, average_weather, travel_style,
  start_date
) VALUES (
  'TOKYO2025',
  'Tokyo & Kyoto',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
  'Paris', 'Tokyo', '16h30', 'Vol direct',
  'Mitsui Garden Hotel Ginza', 4.6, '2 500 € TTC',
  7, '3 200 €', '21°C', 'Culture & Gastronomie',
  '2025-04-15'
);

-- Get the trip_id for Tokyo (we'll use a variable approach)
DO $$
DECLARE
  tokyo_trip_id uuid;
  sidibel_trip_id uuid;
BEGIN
  -- Get Tokyo trip ID
  SELECT id INTO tokyo_trip_id FROM public.trips WHERE code = 'TOKYO2025';
  
  -- Insert steps for Tokyo trip
  INSERT INTO public.steps (trip_id, step_number, day_number, title, subtitle, main_image, latitude, longitude, why, tips, transfer, suggestion, weather_icon, weather_temp, weather_description, duration) VALUES
  (tokyo_trip_id, 1, 1, 'Arrivée à Tokyo', 'Aéroport Narita', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80', 35.6938, 139.7006, 'Arrivée en après-midi à l''aéroport international de Narita, récupération des bagages et transfert vers l''hôtel. Cette première étape vous permet de vous acclimater doucement au décalage horaire.', 'Prends une Suica Card à l''aéroport, c''est indispensable pour tous les transports en commun.', '75 min en Narita Express', 'Installation à l''hôtel et repos', '🌤️', '18°C', 'Nuageux', '3h environ'),
  (tokyo_trip_id, 2, 1, 'Shinjuku', 'Quartier animé', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80', 35.6938, 139.7006, 'Découverte du quartier le plus animé de Tokyo avec ses néons, restaurants et vie nocturne.', 'Visite de l''observatoire gratuit du Tokyo Metropolitan Government.', 'À pied depuis l''hôtel', 'Dîner à Omoide Yokocho', '🌤️', '18°C', 'Nuageux', NULL),
  (tokyo_trip_id, 3, 1, 'Golden Gai', 'Soirée dans les bars traditionnels', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80', 35.6945, 139.7046, 'Ambiance unique dans les petits bars de Golden Gai, quartier mythique de Tokyo.', 'Attention, certains bars refusent les touristes. Soyez respectueux.', '10 min à pied', 'Bar hopping dans Golden Gai', '🌤️', '16°C', 'Nuit claire', NULL),
  (tokyo_trip_id, 4, 2, 'Senso-ji Temple', 'Temple historique d''Asakusa', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80', 35.7148, 139.7967, 'Le plus ancien temple de Tokyo, dans le quartier traditionnel d''Asakusa.', 'Arrive tôt pour éviter la foule et profiter de l''atmosphère.', '30 min en métro', 'Déjeuner dans les environs', '☀️', '20°C', 'Ensoleillé', NULL),
  (tokyo_trip_id, 5, 2, 'TeamLab Borderless', 'Musée d''art numérique', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80', 35.6264, 139.7753, 'Expérience immersive unique au monde dans ce musée d''art numérique interactif. Les installations lumineuses réagissent à votre présence.', 'Réserve à l''avance, le créneau de 16h est recommandé. Porte des vêtements confortables.', '45 min en métro depuis Asakusa', 'Dîner à Odaiba avec vue sur Rainbow Bridge', '☀️', '20°C', 'Ensoleillé', '2h30'),
  (tokyo_trip_id, 6, 3, 'Marché aux poissons Tsukiji', 'Petit-déjeuner de sushis frais', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80', 35.6654, 139.7707, 'Meilleurs sushis du matin à Tokyo dans ce marché emblématique.', 'Arrive avant 7h pour éviter la queue aux meilleurs restaurants.', '25 min en métro', 'Visite du marché extérieur', '🌤️', '19°C', 'Partiellement nuageux', NULL),
  (tokyo_trip_id, 7, 3, 'Shibuya Crossing', 'Le carrefour le plus célèbre', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80', 35.6595, 139.7016, 'Expérience iconique de Tokyo au carrefour le plus fréquenté du monde.', 'Monte au Starbucks pour la vue d''en haut du crossing.', '15 min en métro', 'Shopping à Shibuya 109', '🌤️', '21°C', 'Partiellement nuageux', NULL),
  (tokyo_trip_id, 8, 3, 'Harajuku', 'Mode et culture pop', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80', 35.6702, 139.7024, 'Quartier de la mode alternative et des crêpes japonaises.', 'Takeshita Street le week-end est bondée. Préférez la semaine.', '10 min à pied', 'Visite du Meiji Shrine', '🌤️', '21°C', 'Partiellement nuageux', NULL),
  (tokyo_trip_id, 9, 4, 'Trajet vers Kyoto', 'Shinkansen', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80', 35.0116, 135.7681, 'Transfert vers Kyoto en train à grande vitesse. Expérience emblématique du Japon à 320 km/h.', 'Réserve côté gauche pour voir le Mont Fuji si le temps est dégagé.', '2h15 en Shinkansen depuis Tokyo Station', 'Achète un Ekiben (bento du train)', '☀️', '22°C', 'Ensoleillé', '2h15'),
  (tokyo_trip_id, 10, 4, 'Fushimi Inari', 'Les 10 000 torii', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80', 34.9671, 135.7726, 'Le sanctuaire aux mille portes rouges iconiques. Randonnée spirituelle inoubliable.', 'Monte jusqu''au sommet pour moins de monde et des vues magnifiques.', '20 min en train JR depuis Kyoto', 'Dîner dans le quartier Gion', '☀️', '22°C', 'Ensoleillé', '3h environ'),
  (tokyo_trip_id, 11, 5, 'Arashiyama', 'Forêt de bambous', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80', 35.0094, 135.6728, 'La célèbre bambouseraie de Kyoto, expérience zen et magique.', 'Arrive avant 8h pour une expérience magique sans foule.', '30 min en train', 'Visite du temple Tenryu-ji', '☀️', '23°C', 'Ensoleillé', NULL),
  (tokyo_trip_id, 12, 5, 'Kinkaku-ji', 'Pavillon d''Or', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80', 35.0394, 135.7292, 'Le temple doré emblématique de Kyoto, chef-d''œuvre architectural zen.', 'Meilleure lumière en fin d''après-midi pour les photos.', '25 min en bus depuis Arashiyama', 'Déjeuner végétarien shojin ryori', '☀️', '23°C', 'Ensoleillé', '1h30'),
  (tokyo_trip_id, 13, 6, 'Nara', 'Les cerfs sacrés', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1920&q=80', 34.6851, 135.8048, 'Excursion d''une journée pour voir les cerfs en liberté dans le parc.', 'Achète les crackers dès l''entrée pour nourrir les cerfs.', '45 min en train JR depuis Kyoto', 'Déjeuner: mochis Nakatanidou', '🌤️', '20°C', 'Partiellement nuageux', NULL),
  (tokyo_trip_id, 14, 6, 'Todai-ji', 'Le grand Bouddha', 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1920&q=80', 34.6890, 135.8398, 'Temple abritant un Bouddha géant en bronze de 15 mètres.', 'Passe par les portes en bois monumentales pour la photo.', '15 min à pied dans le parc', 'Retour à Kyoto en soirée', '🌤️', '20°C', 'Partiellement nuageux', NULL),
  (tokyo_trip_id, 15, 7, 'Osaka - Dotonbori', 'Street food capitale', 'https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=1920&q=80', 34.6937, 135.5022, 'Le meilleur de la street food japonaise. Dotonbori est le paradis des gourmands.', 'Prévois de la place dans ton estomac! Portions généreuses.', '30 min en train depuis Kyoto', 'Takoyaki chez Kukuru, okonomiyaki chez Chibo', '☀️', '23°C', 'Clair et chaud', '3h minimum'),
  (tokyo_trip_id, 16, 7, 'Osaka Castle', 'Château historique', 'https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=1920&q=80', 34.6873, 135.5258, 'Un des châteaux les plus célèbres du Japon avec vue panoramique.', 'Monte au sommet pour la vue panoramique sur Osaka.', '20 min en métro', 'Dernière soirée shopping à Umeda', '☀️', '23°C', 'Clair et chaud', NULL);

  -- Insert price and images for specific steps
  UPDATE public.steps SET price = 35, images = '["https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80", "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&q=80", "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80"]'::jsonb 
  WHERE trip_id = tokyo_trip_id AND step_number = 5;
  
  UPDATE public.steps SET images = '["https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80"]'::jsonb 
  WHERE trip_id = tokyo_trip_id AND step_number = 4;
  
  UPDATE public.steps SET price = 140 WHERE trip_id = tokyo_trip_id AND step_number = 9;
  UPDATE public.steps SET price = 0, images = '["https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80"]'::jsonb 
  WHERE trip_id = tokyo_trip_id AND step_number = 10;
  
  UPDATE public.steps SET price = 5, images = '["https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80"]'::jsonb 
  WHERE trip_id = tokyo_trip_id AND step_number = 12;
  
  UPDATE public.steps SET price = 0, images = '["https://images.unsplash.com/photo-1589452271712-64b8a66c7b71?w=800&q=80", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"]'::jsonb 
  WHERE trip_id = tokyo_trip_id AND step_number = 15;

  -- Insert trip: Sidi Bel Abbès (code: SIDIBEL2025)
  INSERT INTO public.trips (
    code, destination, main_image,
    flight_from, flight_to, flight_duration, flight_type,
    hotel_name, hotel_rating, total_price,
    total_days, total_budget, average_weather, travel_style,
    start_date
  ) VALUES (
    'SIDIBEL2025',
    'Sidi Bel Abbès & Environs',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1920&q=80',
    'Paris', 'Oran', '2h30', 'Vol direct',
    'Hotel Les Ambassadeurs', 4.0, '800 € TTC',
    5, '1 200 €', '28°C', 'Découverte & Culture',
    '2025-05-20'
  );
  
  SELECT id INTO sidibel_trip_id FROM public.trips WHERE code = 'SIDIBEL2025';
  
  -- Insert steps for Sidi Bel Abbès trip
  INSERT INTO public.steps (trip_id, step_number, day_number, title, subtitle, main_image, latitude, longitude, why, tips, transfer, suggestion, weather_icon, weather_temp, weather_description, price, duration) VALUES
  (sidibel_trip_id, 1, 1, 'Arrivée à Oran', 'Aéroport Ahmed Ben Bella', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1920&q=80', 35.6231, -0.6217, 'Arrivée à l''aéroport d''Oran et transfert vers Sidi Bel Abbès. Première découverte de la région oranaise avec ses paysages méditerranéens.', 'Prévois de la monnaie locale (dinars algériens) pour les petits achats.', '1h30 en taxi ou bus depuis Oran', 'Installation à l''hôtel et repos', '☀️', '30°C', 'Ensoleillé', NULL, '2h'),
  (sidibel_trip_id, 2, 1, 'Place Carnot', 'Centre-ville historique', 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1920&q=80', 35.1909, -0.6383, 'Découverte du cœur historique de Sidi Bel Abbès, ville de la Légion Étrangère avec son architecture coloniale préservée.', 'Visite en fin d''après-midi quand la chaleur est moins intense.', 'À pied depuis l''hôtel', 'Café au Grand Café de la Gare', '☀️', '32°C', 'Très ensoleillé', 0, '1h30'),
  (sidibel_trip_id, 3, 2, 'Musée de la Légion Étrangère', 'Histoire militaire', 'https://images.unsplash.com/photo-1565711561500-71bdd51f5c48?w=1920&q=80', 35.1898, -0.6402, 'Visite du musée emblématique retraçant l''histoire de la Légion Étrangère à Sidi Bel Abbès. Collection unique d''uniformes, armes et documents.', 'Réserve à l''avance. Fermé le lundi. Guide francophone disponible.', '10 min à pied depuis le centre', 'Déjeuner dans un restaurant traditionnel', '☀️', '31°C', 'Ensoleillé', 5, '2h'),
  (sidibel_trip_id, 4, 2, 'Mosquée Sidi Bel Abbès', 'Patrimoine religieux', 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=1920&q=80', 35.1933, -0.6350, 'Visite de la grande mosquée de la ville, exemple remarquable d''architecture islamique algérienne avec son minaret imposant.', 'Tenue vestimentaire appropriée requise. Enlève tes chaussures.', '5 min en taxi', 'Thé à la menthe dans un salon de thé traditionnel', '☀️', '29°C', 'Ensoleillé', 0, '1h'),
  (sidibel_trip_id, 5, 3, 'Tlemcen', 'Perle du Maghreb', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&q=80', 34.8914, -1.3150, 'Excursion d''une journée à Tlemcen, ville historique réputée pour ses mosquées, palais et jardins andalous. Patrimoine culturel exceptionnel.', 'Départ tôt le matin. Prends un guide local pour ne rien manquer.', '1h30 en voiture', 'Visite de la Grande Mosquée et des Cascades d''El Ourit', '☀️', '28°C', 'Partiellement nuageux', 20, '8h'),
  (sidibel_trip_id, 6, 3, 'Palais El Mechouar', 'Citadelle historique', 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=1920&q=80', 34.8833, -1.3167, 'Ancienne citadelle royale de Tlemcen, témoignage de la grandeur du royaume zianide. Architecture mauresque remarquable.', 'Billet combiné avec la mosquée. Préfère la matinée.', 'Dans le centre de Tlemcen', 'Déjeuner couscous traditionnel', '☀️', '27°C', 'Clair', 3, '1h30'),
  (sidibel_trip_id, 7, 4, 'Marché central', 'Souk traditionnel', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80', 35.1920, -0.6390, 'Immersion dans le marché central de Sidi Bel Abbès. Couleurs, odeurs et saveurs de l''Algérie authentique.', 'Marchande avec le sourire. Les prix sont négociables.', '10 min à pied', 'Achat d''épices et produits locaux', '☀️', '33°C', 'Très chaud', 0, '2h'),
  (sidibel_trip_id, 8, 4, 'Hammam traditionnel', 'Détente et bien-être', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80', 35.1905, -0.6370, 'Expérience authentique au hammam traditionnel. Rituel de purification et relaxation selon la tradition algérienne.', 'Apporte tes affaires de toilette. Préfère le matin ou après-midi.', '5 min en taxi', 'Thé et pâtisseries après le hammam', '☀️', '30°C', 'Ensoleillé', 10, '2h'),
  (sidibel_trip_id, 9, 5, 'Aïn El Berd', 'Nature et montagne', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', 35.3667, -0.5167, 'Excursion dans la région montagneuse d''Aïn El Berd. Paysages magnifiques et air pur des hauteurs.', 'Prends des chaussures de marche. Climat plus frais en altitude.', '45 min en voiture', 'Pique-nique avec vue panoramique', '🌤️', '24°C', 'Frais en altitude', 0, '4h'),
  (sidibel_trip_id, 10, 5, 'Retour et dernier souk', 'Shopping souvenirs', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80', 35.1915, -0.6385, 'Dernière flânerie dans les souks pour acheter des souvenirs: poteries, tapis, bijoux berbères et produits artisanaux.', 'Garde de la place dans tes bagages. Prévois du cash.', 'Centre-ville', 'Dîner d''adieu dans un restaurant traditionnel', '☀️', '31°C', 'Ensoleillé', 0, '3h');

END $$;