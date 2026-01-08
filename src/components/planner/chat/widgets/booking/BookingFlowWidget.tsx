/**
 * BookingFlowWidget - Complete booking process widget
 *
 * Guides users through the final booking steps including
 * summary review, traveler details, and payment initiation.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronRight,
  CreditCard,
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Plane,
  Hotel,
  MapPin,
  Shield,
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  Wallet,
  FileText,
  Download,
} from "lucide-react";

/**
 * Booking step
 */
export type BookingStep = "summary" | "travelers" | "contact" | "payment" | "confirmation";

/**
 * Traveler info
 */
export interface TravelerInfo {
  id: string;
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  passport?: string;
  nationality?: string;
}

/**
 * Contact info
 */
export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Booking item
 */
export interface BookingItem {
  id: string;
  type: "flight" | "hotel" | "activity" | "transfer";
  name: string;
  description?: string;
  price: number;
  currency: string;
  /** Booking reference if already booked */
  reference?: string;
  /** External booking URL */
  bookingUrl?: string;
  /** Status */
  status: "pending" | "processing" | "confirmed" | "failed";
  /** Additional details */
  details?: Record<string, string>;
}

/**
 * Booking summary
 */
export interface BookingSummary {
  items: BookingItem[];
  subtotal: number;
  fees?: number;
  discount?: number;
  total: number;
  currency: string;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  dates: {
    departure: Date;
    return?: Date;
  };
  destination: string;
}

/**
 * BookingFlowWidget props
 */
interface BookingFlowWidgetProps {
  /** Booking summary */
  summary: BookingSummary;
  /** Initial step */
  initialStep?: BookingStep;
  /** Traveler info change handler */
  onTravelersChange?: (travelers: TravelerInfo[]) => void;
  /** Contact info change handler */
  onContactChange?: (contact: ContactInfo) => void;
  /** Book item handler */
  onBookItem?: (itemId: string) => void;
  /** Complete booking handler */
  onComplete?: () => void;
  /** Export trip handler */
  onExport?: (format: "pdf" | "email") => void;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Step indicator
 */
function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: { id: BookingStep; label: string }[];
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step circle */}
            <button
              type="button"
              onClick={() => isCompleted && onStepClick?.(step.id)}
              disabled={!isCompleted}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all",
                isCompleted &&
                  "bg-green-500 text-white cursor-pointer hover:bg-green-600",
                isCurrent && "bg-primary text-primary-foreground",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? <Check size={16} /> : index + 1}
            </button>

            {/* Step label */}
            <span
              className={cn(
                "ml-2 text-sm hidden sm:block",
                isCurrent ? "font-medium" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-3",
                  index < currentIndex ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Summary step content
 */
function SummaryStep({
  summary,
  onContinue,
  onBookItem,
}: {
  summary: BookingSummary;
  onContinue: () => void;
  onBookItem?: (itemId: string) => void;
}) {
  const typeIcons = {
    flight: Plane,
    hotel: Hotel,
    activity: MapPin,
    transfer: MapPin,
  };

  return (
    <div className="space-y-4">
      {/* Trip overview */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <h3 className="font-semibold mb-2">{summary.destination}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>
              {summary.dates.departure.toLocaleDateString("fr-FR")}
              {summary.dates.return &&
                ` - ${summary.dates.return.toLocaleDateString("fr-FR")}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>
              {summary.travelers.adults} adulte
              {summary.travelers.adults > 1 ? "s" : ""}
              {summary.travelers.children > 0 &&
                `, ${summary.travelers.children} enfant${summary.travelers.children > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {summary.items.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  item.type === "flight" &&
                    "bg-blue-100 dark:bg-blue-900/40 text-blue-600",
                  item.type === "hotel" &&
                    "bg-purple-100 dark:bg-purple-900/40 text-purple-600",
                  item.type === "activity" &&
                    "bg-green-100 dark:bg-green-900/40 text-green-600",
                  item.type === "transfer" &&
                    "bg-amber-100 dark:bg-amber-900/40 text-amber-600"
                )}
              >
                <Icon size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-muted-foreground truncate">
                    {item.description}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  {item.price}
                  {item.currency}
                </div>
                {item.status === "confirmed" ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Confirmé
                  </span>
                ) : item.bookingUrl ? (
                  <button
                    type="button"
                    onClick={() => onBookItem?.(item.id)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Réserver
                    <ExternalLink size={10} />
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    En attente
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price breakdown */}
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span>
            {summary.subtotal}
            {summary.currency}
          </span>
        </div>
        {summary.fees && summary.fees > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frais de service</span>
            <span>
              {summary.fees}
              {summary.currency}
            </span>
          </div>
        )}
        {summary.discount && summary.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Réduction</span>
            <span>
              -{summary.discount}
              {summary.currency}
            </span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">
            {summary.total}
            {summary.currency}
          </span>
        </div>
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-all",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "hover:scale-[1.01] active:scale-[0.99]"
        )}
      >
        Continuer vers les voyageurs
        <ChevronRight size={18} className="inline ml-2" />
      </button>
    </div>
  );
}

/**
 * Travelers step content
 */
function TravelersStep({
  travelers,
  requiredCount,
  onChange,
  onContinue,
  onBack,
}: {
  travelers: TravelerInfo[];
  requiredCount: { adults: number; children: number; infants: number };
  onChange: (travelers: TravelerInfo[]) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const totalRequired =
    requiredCount.adults + requiredCount.children + requiredCount.infants;

  const updateTraveler = (index: number, updates: Partial<TravelerInfo>) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  // Initialize travelers if empty
  if (travelers.length === 0) {
    const initial: TravelerInfo[] = [];
    for (let i = 0; i < requiredCount.adults; i++) {
      initial.push({
        id: `adult-${i}`,
        type: "adult",
        firstName: "",
        lastName: "",
      });
    }
    for (let i = 0; i < requiredCount.children; i++) {
      initial.push({
        id: `child-${i}`,
        type: "child",
        firstName: "",
        lastName: "",
      });
    }
    for (let i = 0; i < requiredCount.infants; i++) {
      initial.push({
        id: `infant-${i}`,
        type: "infant",
        firstName: "",
        lastName: "",
      });
    }
    onChange(initial);
    return null;
  }

  const isValid = travelers.every((t) => t.firstName && t.lastName);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Entrez les informations de chaque voyageur telles qu'elles apparaissent
        sur leurs documents d'identité.
      </div>

      {travelers.map((traveler, index) => (
        <div key={traveler.id} className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-muted-foreground" />
            <span className="font-medium">
              Voyageur {index + 1}
              {traveler.type === "adult" && " (Adulte)"}
              {traveler.type === "child" && " (Enfant)"}
              {traveler.type === "infant" && " (Bébé)"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Prénom *</label>
              <input
                type="text"
                value={traveler.firstName}
                onChange={(e) =>
                  updateTraveler(index, { firstName: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Nom *</label>
              <input
                type="text"
                value={traveler.lastName}
                onChange={(e) =>
                  updateTraveler(index, { lastName: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Dupont"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-lg font-medium border hover:bg-muted transition-colors"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!isValid}
          className={cn(
            "flex-1 py-3 rounded-lg font-medium transition-all",
            isValid
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

/**
 * Contact step content
 */
function ContactStep({
  contact,
  onChange,
  onContinue,
  onBack,
}: {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const isValid = contact.email && contact.phone;

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Ces informations seront utilisées pour vos confirmations de réservation.
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Mail size={14} />
            Email *
          </label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => onChange({ ...contact, email: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="jean.dupont@email.com"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Phone size={14} />
            Téléphone *
          </label>
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => onChange({ ...contact, phone: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+33 6 12 34 56 78"
          />
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm">
        <Shield size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          Vos données sont sécurisées et ne seront partagées qu'avec les
          prestataires de voyage.
        </span>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-lg font-medium border hover:bg-muted transition-colors"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!isValid}
          className={cn(
            "flex-1 py-3 rounded-lg font-medium transition-all",
            isValid
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Finaliser
        </button>
      </div>
    </div>
  );
}

/**
 * Confirmation step content
 */
function ConfirmationStep({
  summary,
  onExport,
  onComplete,
}: {
  summary: BookingSummary;
  onExport?: (format: "pdf" | "email") => void;
  onComplete?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const confirmedItems = summary.items.filter((i) => i.status === "confirmed");
  const pendingItems = summary.items.filter((i) => i.status !== "confirmed");

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Success message */}
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Votre voyage est prêt !
        </h3>
        <p className="text-muted-foreground">
          {confirmedItems.length > 0
            ? `${confirmedItems.length} réservation${confirmedItems.length > 1 ? "s" : ""} confirmée${confirmedItems.length > 1 ? "s" : ""}`
            : "Finalisez vos réservations ci-dessous"}
        </p>
      </div>

      {/* Confirmed items */}
      {confirmedItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Réservations confirmées
          </h4>
          {confirmedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                {item.reference && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    Réf: {item.reference}
                    <button
                      type="button"
                      onClick={() => handleCopyReference(item.reference!)}
                      className="text-primary hover:underline"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>
              <CheckCircle size={20} className="text-green-500" />
            </div>
          ))}
        </div>
      )}

      {/* Pending items */}
      {pendingItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            À réserver
          </h4>
          {pendingItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {item.price}
                  {item.currency}
                </div>
              </div>
              {item.bookingUrl && (
                <a
                  href={item.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "transition-all hover:scale-[1.02]"
                  )}
                >
                  Réserver
                  <ExternalLink size={14} className="inline ml-1.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Export options */}
      <div className="flex gap-3 pt-4 border-t">
        {onExport && (
          <>
            <button
              type="button"
              onClick={() => onExport("pdf")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border hover:bg-muted transition-colors"
            >
              <Download size={16} />
              Télécharger PDF
            </button>
            <button
              type="button"
              onClick={() => onExport("email")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border hover:bg-muted transition-colors"
            >
              <Mail size={16} />
              Envoyer par email
            </button>
          </>
        )}
      </div>

      {/* Complete button */}
      {onComplete && (
        <button
          type="button"
          onClick={onComplete}
          className={cn(
            "w-full py-3 rounded-lg font-medium transition-all",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Terminer
        </button>
      )}
    </div>
  );
}

/**
 * BookingFlowWidget Component
 */
export function BookingFlowWidget({
  summary,
  initialStep = "summary",
  onTravelersChange,
  onContactChange,
  onBookItem,
  onComplete,
  onExport,
  compact = false,
}: BookingFlowWidgetProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);
  const [travelers, setTravelers] = useState<TravelerInfo[]>([]);
  const [contact, setContact] = useState<ContactInfo>({ email: "", phone: "" });

  const steps: { id: BookingStep; label: string }[] = [
    { id: "summary", label: "Récapitulatif" },
    { id: "travelers", label: "Voyageurs" },
    { id: "contact", label: "Contact" },
    { id: "confirmation", label: "Confirmation" },
  ];

  const handleTravelersChange = (newTravelers: TravelerInfo[]) => {
    setTravelers(newTravelers);
    onTravelersChange?.(newTravelers);
  };

  const handleContactChange = (newContact: ContactInfo) => {
    setContact(newContact);
    onContactChange?.(newContact);
  };

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", compact ? "p-3" : "p-4")}>
      {/* Step indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      {/* Step content */}
      {currentStep === "summary" && (
        <SummaryStep
          summary={summary}
          onContinue={() => setCurrentStep("travelers")}
          onBookItem={onBookItem}
        />
      )}

      {currentStep === "travelers" && (
        <TravelersStep
          travelers={travelers}
          requiredCount={summary.travelers}
          onChange={handleTravelersChange}
          onContinue={() => setCurrentStep("contact")}
          onBack={() => setCurrentStep("summary")}
        />
      )}

      {currentStep === "contact" && (
        <ContactStep
          contact={contact}
          onChange={handleContactChange}
          onContinue={() => setCurrentStep("confirmation")}
          onBack={() => setCurrentStep("travelers")}
        />
      )}

      {currentStep === "confirmation" && (
        <ConfirmationStep
          summary={summary}
          onExport={onExport}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

/**
 * Compact booking summary card
 */
export function BookingSummaryCard({
  total,
  currency,
  itemCount,
  onClick,
}: {
  total: number;
  currency: string;
  itemCount: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-lg",
        "bg-primary/10 border border-primary/20",
        "hover:bg-primary/15 transition-colors"
      )}
    >
      <div className="flex items-center gap-3">
        <Wallet className="text-primary" size={20} />
        <div className="text-left">
          <div className="font-medium">
            {itemCount} élément{itemCount > 1 ? "s" : ""} sélectionné
            {itemCount > 1 ? "s" : ""}
          </div>
          <div className="text-sm text-muted-foreground">
            Prêt à réserver
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold text-primary">
          {total}
          {currency}
        </div>
        <div className="text-xs text-muted-foreground">Total</div>
      </div>
    </button>
  );
}

export default BookingFlowWidget;
