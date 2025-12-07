import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTripData } from "@/hooks/useTripData";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Phone,
  FileText,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Plane,
  Hotel,
  MapPin,
  Calendar,
  Users,
  Info,
  Scale,
  Building2,
  Umbrella
} from "lucide-react";
import logo from "@/assets/logo-travliaq.png";

const TripDetails = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const rawCode = code || searchParams.get("code");
  const tripCode = rawCode ? decodeURIComponent(rawCode).replace(/^=+/, '').trim() : null;
  const { trip, steps, loading } = useTripData(tripCode);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Calculate trip details
  const regularSteps = steps.filter(s => !s.is_summary);
  const uniqueCities = new Set(regularSteps.map(s => s.title.split(' ')[0])).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('tripDetails.notFound')}</h1>
        <Button onClick={() => navigate('/')}>{t('common.back')}</Button>
      </div>
    );
  }

  const handleProceedToBooking = () => {
    navigate(`/booking?code=${encodeURIComponent(tripCode || '')}`);
  };

  const handleBackToTrip = () => {
    navigate(`/recommendations/${encodeURIComponent(tripCode || '')}`);
  };

  // Dynamic included/excluded based on trip data
  const includedItems = [
    trip.flight_from && trip.flight_to && { icon: Plane, text: isEnglish ? `Round-trip flights ${trip.flight_from} ↔ ${trip.flight_to}` : `Vols aller-retour ${trip.flight_from} ↔ ${trip.flight_to}` },
    trip.hotel_name && { icon: Hotel, text: isEnglish ? `Accommodation: ${trip.hotel_name}` : `Hébergement : ${trip.hotel_name}` },
    regularSteps.length > 0 && { icon: MapPin, text: isEnglish ? `${regularSteps.length} planned activities` : `${regularSteps.length} activités planifiées` },
    { icon: FileText, text: isEnglish ? 'Complete personalized itinerary' : 'Itinéraire personnalisé complet' },
    { icon: Phone, text: isEnglish ? '7/7 customer support' : 'Assistance client 7j/7' },
  ].filter(Boolean);

  const excludedItems = [
    { icon: Umbrella, text: isEnglish ? 'Travel insurance (recommended)' : 'Assurance voyage (recommandée)' },
    { icon: CreditCard, text: isEnglish ? 'Personal expenses and tips' : 'Dépenses personnelles et pourboires' },
    { icon: MapPin, text: isEnglish ? 'Optional excursions not mentioned' : 'Excursions optionnelles non mentionnées' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToTrip}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('tripDetails.backToTrip')}
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <img src={logo} alt="Travliaq" className="h-10" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {isEnglish ? (trip.destination_en || trip.destination) : trip.destination}
              </h1>
              <p className="text-muted-foreground">
                {trip.total_days} {isEnglish ? 'days' : 'jours'} • {trip.travelers || 2} {isEnglish ? 'travelers' : 'voyageurs'}
              </p>
            </div>
          </div>

          <Badge variant="outline" className="text-primary border-primary">
            {t('tripDetails.preBookingInfo')}
          </Badge>
        </div>

        {/* Trip Summary Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              {t('tripDetails.tripSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">{isEnglish ? 'Duration' : 'Durée'}</p>
                  <p className="font-medium">{trip.total_days} {isEnglish ? 'days' : 'jours'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">{isEnglish ? 'Travelers' : 'Voyageurs'}</p>
                  <p className="font-medium">{trip.travelers || 2}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">{isEnglish ? 'Activities' : 'Activités'}</p>
                  <p className="font-medium">{regularSteps.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">{isEnglish ? 'Total Price' : 'Prix total'}</p>
                  <p className="font-medium text-primary">{trip.total_price || trip.total_budget || '—'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Included / Excluded */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                {t('tripDetails.included')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {includedItems.map((item: any, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <item.icon className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-orange-500">
                <XCircle className="h-5 w-5" />
                {t('tripDetails.excluded')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {excludedItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <item.icon className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Legal Information */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5 text-primary" />
              {t('tripDetails.responsibilities')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t('tripDetails.organizer')}</p>
                <p>{t('tripDetails.organizerDesc')}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t('tripDetails.globalResponsibility')}</p>
                <p>{t('tripDetails.globalResponsibilityDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Policy */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              {t('tripDetails.cancellation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <span>{t('tripDetails.cancel30days')}</span>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  {isEnglish ? '100% refund' : 'Remboursement 100%'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                <span>{t('tripDetails.cancel15days')}</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                  {isEnglish ? '50% refund' : 'Remboursement 50%'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <span>{t('tripDetails.cancel7days')}</span>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                  {isEnglish ? 'No refund' : 'Non remboursable'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guarantees */}
        <Card className="mb-6 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              {t('tripDetails.guarantees')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t('tripDetails.insolvencyGuarantee')}</p>
                <p className="text-muted-foreground">{t('tripDetails.insolvencyGuaranteeDesc')}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t('tripDetails.rcProInsurance')}</p>
                <p className="text-muted-foreground">{t('tripDetails.rcProInsuranceDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance Checkbox */}
        <Card className="mb-8 border-2 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                {t('tripDetails.acceptTerms')}{' '}
                <a href="/cgv" target="_blank" className="text-primary underline hover:no-underline">
                  {t('tripDetails.termsLink')}
                </a>
                {' '}{t('tripDetails.acceptTerms2')}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handleBackToTrip}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('tripDetails.backToTrip')}
          </Button>
          
          <Button
            onClick={handleProceedToBooking}
            disabled={!acceptedTerms}
            className="gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            {t('tripDetails.proceedToBooking')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          {t('tripDetails.footerNote')}
        </p>
      </div>
    </div>
  );
};

export default TripDetails;
