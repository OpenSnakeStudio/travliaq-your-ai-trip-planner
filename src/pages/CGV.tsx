import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CGV = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("common.backToHome")}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="font-['Montserrat'] font-bold text-4xl mb-8 text-primary">
          {t("cgv.title")}
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section1.title")}
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>{t("cgv.section1.p1")}</p>
              <p>{t("cgv.section1.p2")}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("cgv.section1.li1")}</li>
                <li>{t("cgv.section1.li2")}</li>
                <li>{t("cgv.section1.li3")}</li>
              </ul>
              <p>{t("cgv.section1.p3")}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section2.title")}
            </h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>{t("cgv.section2.company")}</strong></p>
              <p>{t("cgv.section2.capital")}</p>
              <p>{t("cgv.section2.status")}</p>
              <p>{t("cgv.section2.email")} <a href="mailto:team.travliaq@gmail.com" className="text-accent hover:underline">team.travliaq@gmail.com</a></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section3.title")}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>{t("cgv.section3.li1")}</li>
              <li>{t("cgv.section3.li2")}</li>
              <li>{t("cgv.section3.li3")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section4.title")}
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>{t("cgv.section4.p1")}</p>
              <p>{t("cgv.section4.p2")}</p>
              <p>{t("cgv.section4.p3")}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section5.title")}
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>{t("cgv.section5.p1")}</p>
              <p>{t("cgv.section5.p2")}</p>
              <p>{t("cgv.section5.p3")}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section6.title")}
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>{t("cgv.section6.p1")}</p>
              <p>{t("cgv.section6.p2")}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section7.title")}
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>{t("cgv.section7.p1")}</p>
              <p><strong>{t("cgv.section7.p2")}</strong></p>
              <p>{t("cgv.section7.p3")}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section8.title")}
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>{t("cgv.section8.p1")}</p>
              <p>{t("cgv.section8.p2")}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-['Montserrat'] font-bold text-2xl mb-4 text-primary-foreground">
              {t("cgv.section9.title")}
            </h2>
            <div className="text-muted-foreground space-y-4">
              <p>{t("cgv.section9.p1")}</p>
              <p>{t("cgv.section9.p2")}</p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link to="/">
            <Button variant="outline" className="font-['Inter']">
              {t("common.backToHome")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CGV;