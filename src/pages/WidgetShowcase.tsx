/**
 * WidgetShowcase - Catalog page for all chat widgets
 */

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Users, Plane, MapPin, Settings, AlertCircle, Clock, TrendingUp, Navigation, Filter, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WidgetInfo {
  name: string;
  description: string;
  file: string;
  status: "stable" | "beta";
}

interface WidgetCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  widgets: WidgetInfo[];
}

const widgetCategories: WidgetCategory[] = [
  {
    id: "core",
    title: "Widgets de base",
    icon: <Calendar className="h-5 w-5" />,
    description: "Widgets fondamentaux pour la sélection de dates, voyageurs et confirmations",
    widgets: [
      { name: "DatePickerWidget", description: "Calendrier inline pour sélection de date", file: "DatePickerWidget.tsx", status: "stable" },
      { name: "DateRangePickerWidget", description: "Sélection de plage de dates aller-retour", file: "DateRangePickerWidget.tsx", status: "stable" },
      { name: "TravelersWidget", description: "Compteur adultes/enfants/bébés", file: "TravelersWidget.tsx", status: "stable" },
      { name: "TripTypeConfirmWidget", description: "Confirmation aller simple/retour", file: "TripTypeWidget.tsx", status: "stable" },
      { name: "CitySelectionWidget", description: "Sélection de ville parmi plusieurs options", file: "CitySelectionWidget.tsx", status: "stable" },
      { name: "ConfirmedWidget", description: "Affichage d'une sélection confirmée", file: "ConfirmedWidget.tsx", status: "stable" },
    ],
  },
  {
    id: "airports",
    title: "Widgets Aéroports",
    icon: <Plane className="h-5 w-5" />,
    description: "Sélection et confirmation des aéroports",
    widgets: [
      { name: "AirportButton", description: "Bouton de sélection d'aéroport unique", file: "AirportWidgets.tsx", status: "stable" },
      { name: "DualAirportSelection", description: "Sélection aéroport départ + arrivée", file: "AirportWidgets.tsx", status: "stable" },
      { name: "AirportConfirmationWidget", description: "Confirmation multi-destination", file: "AirportWidgets.tsx", status: "stable" },
    ],
  },
  {
    id: "preferences",
    title: "Widgets Préférences",
    icon: <Settings className="h-5 w-5" />,
    description: "Collecte des préférences de voyage",
    widgets: [
      { name: "PreferenceStyleWidget", description: "Curseurs style (relax/intense, ville/nature)", file: "PreferenceStyleWidget.tsx", status: "stable" },
      { name: "PreferenceInterestsWidget", description: "Sélection centres d'intérêt", file: "PreferenceInterestsWidget.tsx", status: "stable" },
      { name: "MustHavesWidget", description: "Critères indispensables", file: "MustHavesWidget.tsx", status: "stable" },
      { name: "DietaryWidget", description: "Restrictions alimentaires", file: "DietaryWidget.tsx", status: "stable" },
    ],
  },
  {
    id: "destinations",
    title: "Widgets Destinations",
    icon: <MapPin className="h-5 w-5" />,
    description: "Suggestions et cartes de destinations",
    widgets: [
      { name: "DestinationSuggestionCard", description: "Carte premium avec image, score, budget", file: "DestinationSuggestionCard.tsx", status: "stable" },
      { name: "DestinationSuggestionsGrid", description: "Grille de suggestions", file: "DestinationSuggestionsGrid.tsx", status: "stable" },
    ],
  },
  {
    id: "selection",
    title: "Widgets Sélection",
    icon: <Filter className="h-5 w-5" />,
    description: "Filtres rapides et sélecteurs",
    widgets: [
      { name: "QuickFilterChips", description: "Chips de filtres configurables", file: "selection/QuickFilterChips.tsx", status: "stable" },
      { name: "StarRatingSelector", description: "Sélecteur d'étoiles hôtel", file: "selection/StarRatingSelector.tsx", status: "stable" },
      { name: "CabinClassSelector", description: "Classe de cabine vol", file: "selection/CabinClassSelector.tsx", status: "stable" },
      { name: "DirectFlightToggle", description: "Toggle vols directs", file: "selection/DirectFlightToggle.tsx", status: "stable" },
      { name: "BudgetRangeSlider", description: "Curseur plage de budget", file: "selection/BudgetRangeSlider.tsx", status: "stable" },
      { name: "DurationChips", description: "Filtres durée activité", file: "selection/DurationChips.tsx", status: "stable" },
    ],
  },
  {
    id: "progress",
    title: "Widgets Progression",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Suivi progression et budget",
    widgets: [
      { name: "MissingFieldsCard", description: "Champs manquants pour recherche", file: "progress/MissingFieldsCard.tsx", status: "stable" },
      { name: "ChecklistWidget", description: "Checklist interactive du voyage", file: "progress/ChecklistWidget.tsx", status: "stable" },
      { name: "BudgetProgressWidget", description: "Barres budget par catégorie", file: "progress/BudgetProgressWidget.tsx", status: "stable" },
    ],
  },
  {
    id: "interactive",
    title: "Widgets Interactifs",
    icon: <Clock className="h-5 w-5" />,
    description: "Timeline, météo et cartes",
    widgets: [
      { name: "TimelineWidget", description: "Timeline jour par jour", file: "interactive/TimelineWidget.tsx", status: "stable" },
      { name: "WeatherWidget", description: "Prévisions météo", file: "interactive/WeatherWidget.tsx", status: "stable" },
      { name: "MapPreviewWidget", description: "Aperçu carte avec marqueurs", file: "interactive/MapPreviewWidget.tsx", status: "stable" },
    ],
  },
  {
    id: "alerts",
    title: "Widgets Alertes",
    icon: <Bell className="h-5 w-5" />,
    description: "Alertes prix et conflits",
    widgets: [
      { name: "PriceAlertBanner", description: "Bannière changement de prix", file: "alerts/PriceAlertBanner.tsx", status: "stable" },
      { name: "ConflictAlert", description: "Alerte conflits planning", file: "alerts/ConflictAlertWidget.tsx", status: "stable" },
    ],
  },
  {
    id: "results",
    title: "Widgets Résultats",
    icon: <Plane className="h-5 w-5" />,
    description: "Cartes de résultats compactes",
    widgets: [
      { name: "CompactFlightCard", description: "Carte vol avec aller-retour", file: "results/CompactFlightCard.tsx", status: "stable" },
    ],
  },
  {
    id: "navigation",
    title: "Widgets Navigation",
    icon: <Navigation className="h-5 w-5" />,
    description: "Boutons et actions rapides",
    widgets: [
      { name: "TabSwitcher", description: "Navigation entre onglets", file: "navigation/TabSwitcher.tsx", status: "stable" },
      { name: "BackButton / SearchAgainButton", description: "Boutons d'action", file: "navigation/NavigationButtons.tsx", status: "stable" },
      { name: "QuickEditChips", description: "Édition rapide paramètres", file: "navigation/QuickEditChips.tsx", status: "stable" },
    ],
  },
  {
    id: "comparison",
    title: "Widgets Comparaison",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Comparaison côte à côte",
    widgets: [
      { name: "ComparisonWidget", description: "Comparaison multi-options", file: "comparison/ComparisonWidget.tsx", status: "stable" },
    ],
  },
  {
    id: "booking",
    title: "Widgets Réservation",
    icon: <AlertCircle className="h-5 w-5" />,
    description: "Flux de réservation",
    widgets: [
      { name: "BookingFlowWidget", description: "Flux complet de réservation", file: "booking/BookingFlowWidget.tsx", status: "beta" },
      { name: "BookingSummaryCard", description: "Résumé de réservation", file: "booking/BookingFlowWidget.tsx", status: "beta" },
    ],
  },
];

const WidgetShowcase = () => {
  const totalWidgets = widgetCategories.reduce((acc, c) => acc + c.widgets.length, 0);

  return (
    <>
      <Helmet>
        <title>Widget Showcase | Travliaq</title>
        <meta name="description" content="Catalogue des widgets chat Travliaq" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Link to="/planner" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Widget Showcase</h1>
              <p className="text-sm text-muted-foreground">{totalWidgets} widgets dans {widgetCategories.length} catégories</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {widgetCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {category.icon}
                  {category.title}
                  <Badge variant="secondary">{category.widgets.length}</Badge>
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {category.widgets.map((widget) => (
                    <div
                      key={widget.name}
                      className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-semibold text-foreground">{widget.name}</code>
                        <Badge variant={widget.status === "stable" ? "default" : "outline"} className="text-xs">
                          {widget.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{widget.description}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1 font-mono">{widget.file}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    </>
  );
};

export default WidgetShowcase;
