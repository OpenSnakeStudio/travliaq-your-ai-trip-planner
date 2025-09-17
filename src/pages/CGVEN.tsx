import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CGVEN = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/en" className="inline-flex items-center text-white hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to home
          </Link>
          <Link to="/cgv" className="text-white hover:text-accent transition-colors">
            Français
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="font-['Montserrat'] font-bold text-4xl mb-8 text-primary">
          Terms of Service (ToS) – Travliaq
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              1. Purpose
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                These Terms of Service (hereinafter "ToS") define the terms of use of the services offered 
                by Travliaq, an online platform for travel planning assistance optimized through artificial intelligence.
              </p>
              <p>Travliaq offers its users:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generation of personalized itineraries,</li>
                <li>Access to recommendations for flights, accommodations, activities, weather and local experiences,</li>
                <li>Redirect links to third-party platforms (agencies, airlines, booking platforms).</li>
              </ul>
              <p>
                Travliaq is not a travel agency and does not directly handle the sale of flights, hotels or activities.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              2. Company identification
            </h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>Travliaq</strong></p>
              <p>SAS with share capital of €30,000</p>
              <p>Company in formation – registered address: Aubervilliers (France)</p>
              <p>Email address: <a href="mailto:team.travliaq@gmail.com" className="text-accent hover:underline">team.travliaq@gmail.com</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              3. Services offered
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Free access to certain features (itinerary exploration, suggestions, inspiration).</li>
              <li>Paid services (e.g.: detailed itinerary export, premium options, subscriptions).</li>
              <li>Redirects to third-party partners for booking (Skyscanner, Booking, GetYourGuide, etc.).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              4. Pricing and payment
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Prices for Travliaq's paid services are indicated in euros, all taxes included (TTC).
              </p>
              <p>
                Payment is made online by credit card via a secure solution.
              </p>
              <p>
                Travliaq reserves the right to modify its prices at any time, while guaranteeing users 
                that services will be charged at the price displayed when ordering.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              5. Responsibilities
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Travliaq acts as a technological intermediary: bookings are made with third-party providers.
              </p>
              <p>
                Travliaq's responsibility cannot be engaged in case of modification, cancellation or 
                default of service by a third-party supplier.
              </p>
              <p>
                Information (prices, availability, conditions) is provided in real-time via external APIs, 
                subject to errors or updates by partners.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              6. Withdrawal and cancellation
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                In accordance with the Consumer Code, the user benefits from a withdrawal period of 
                14 days for any paid digital service, except if execution has started before the end of this 
                period with their agreement.
              </p>
              <p>
                Bookings made with third-party partners (flights, hotels, activities) are subject 
                to the specific conditions of each provider.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              7. Personal data and GDPR
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Travliaq collects and processes certain personal data (travel preferences, email, browsing data) 
                in accordance with its Privacy Policy.
              </p>
              <p>
                <strong>Purpose:</strong> provide a personalized service, optimize suggestions and improve the platform.
              </p>
              <p>
                The user has a right of access, rectification and deletion of their data.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              8. Intellectual property
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                All platform content (logos, texts, algorithms, interface, Travliaq brand) is 
                protected by copyright and trademark law.
              </p>
              <p>
                Any unauthorized reproduction or use is prohibited.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              9. Disputes and applicable law
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                These ToS are governed by French law.
              </p>
              <p>
                Any dispute relating to the interpretation or execution of these terms shall be submitted to the 
                exclusive competence of competent courts in the jurisdiction of Bobigny (Seine-Saint-Denis), 
                the jurisdiction on which Aubervilliers depends.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link to="/en">
            <Button variant="outline" className="font-['Inter']">
              Back to home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CGVEN;