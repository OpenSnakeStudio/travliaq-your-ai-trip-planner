import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CGV = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="font-['Montserrat'] font-bold text-4xl mb-8 text-primary">
          Conditions Générales de Vente (CGV) – Travliaq
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              1. Objet
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Les présentes Conditions Générales de Vente (ci-après « CGV ») définissent les modalités 
                d'utilisation des services proposés par Travliaq, une plateforme en ligne d'assistance à la 
                planification de voyages optimisés grâce à l'intelligence artificielle.
              </p>
              <p>Travliaq propose à ses utilisateurs :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La génération d'itinéraires personnalisés,</li>
                <li>L'accès à des recommandations de vols, hébergements, activités, météo et expériences locales,</li>
                <li>Des liens de redirection vers des plateformes tierces (agences, compagnies aériennes, plateformes de réservation).</li>
              </ul>
              <p>
                Travliaq n'est pas une agence de voyage et n'assure pas directement la vente de vols, hôtels ou activités.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              2. Identification de l'éditeur
            </h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>Travliaq</strong></p>
              <p>SAS au capital social de 30 000 €</p>
              <p>En cours de création – domiciliation : Aubervilliers (France)</p>
              <p>Adresse email : <a href="mailto:team.travliaq@gmail.com" className="text-accent hover:underline">team.travliaq@gmail.com</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              3. Services proposés
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Accès gratuit à certaines fonctionnalités (exploration d'itinéraires, suggestions, inspirations).</li>
              <li>Services payants (ex : export d'itinéraires détaillés, options premium, abonnements).</li>
              <li>Redirections vers partenaires tiers pour la réservation (Skyscanner, Booking, GetYourGuide, etc.).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              4. Tarifs et paiement
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Les prix des services payants de Travliaq sont indiqués en euros, toutes taxes comprises (TTC).
              </p>
              <p>
                Le paiement s'effectue en ligne par carte bancaire via une solution sécurisée.
              </p>
              <p>
                Travliaq se réserve le droit de modifier ses tarifs à tout moment, tout en garantissant aux 
                utilisateurs que les services seront facturés au prix affiché lors de la commande.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              5. Responsabilités
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Travliaq agit comme intermédiaire technologique : les réservations sont effectuées auprès de prestataires tiers.
              </p>
              <p>
                La responsabilité de Travliaq ne saurait être engagée en cas de modification, d'annulation ou de 
                défaut de prestation par un fournisseur tiers.
              </p>
              <p>
                Les informations (prix, disponibilités, conditions) sont fournies en temps réel via API externes, 
                sous réserve d'erreurs ou de mises à jour par les partenaires.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              6. Rétractation et annulation
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Conformément au Code de la consommation, l'utilisateur bénéficie d'un droit de rétractation de 
                14 jours pour tout service numérique payant, sauf si l'exécution a commencé avant la fin de ce 
                délai avec son accord.
              </p>
              <p>
                Les réservations effectuées auprès de partenaires tiers (vols, hôtels, activités) sont soumises 
                aux conditions propres de chaque prestataire.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              7. Données personnelles et RGPD
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Travliaq collecte et traite certaines données personnelles (préférences de voyage, email, données 
                de navigation) conformément à sa Politique de Confidentialité.
              </p>
              <p>
                <strong>Objectif :</strong> fournir un service personnalisé, optimiser les suggestions et améliorer la plateforme.
              </p>
              <p>
                L'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              8. Propriété intellectuelle
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Tous les contenus de la plateforme (logos, textes, algorithmes, interface, marque Travliaq) sont 
                protégés par le droit d'auteur et le droit des marques.
              </p>
              <p>
                Toute reproduction ou utilisation non autorisée est interdite.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              9. Litiges et droit applicable
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>
                Les présentes CGV sont régies par le droit français.
              </p>
              <p>
                Tout litige relatif à l'interprétation ou l'exécution des présentes sera soumis à la compétence 
                exclusive des tribunaux compétents du ressort de Bobigny (Seine-Saint-Denis), juridiction dont 
                dépend Aubervilliers.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link to="/">
            <Button variant="outline" className="font-['Inter']">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CGV;