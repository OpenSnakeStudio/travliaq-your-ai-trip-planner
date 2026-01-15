import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import Navigation from '@/components/Navigation';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const emailSchema = z.string().email(t("auth.validation.invalidEmail"));

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("auth.forgotPassword.error.empty"));
      return;
    }

    try {
      emailSchema.parse(email);
    } catch (error) {
      toast.error(t("auth.forgotPassword.error.invalid"));
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success(t("auth.forgotPassword.success"));
    } catch (error: any) {
      toast.error(error.message || t("auth.forgotPassword.error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-travliaq-deep-blue via-travliaq-deep-blue/95 to-travliaq-turquoise/20">
      <Navigation variant="minimal" />
      
      <div className="flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <Link
              to="/auth"
              className="inline-flex items-center text-white/80 hover:text-white text-sm transition-colors mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t("auth.forgotPassword.backToLogin")}
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">
              {t("auth.forgotPassword.title")}
            </h1>
            <p className="text-white/80">
              {t("auth.forgotPassword.subtitle")}
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  {t("auth.forgotPassword.emailLabel")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("common.email.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-travliaq-turquoise hover:bg-travliaq-turquoise/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("auth.forgotPassword.submitButton")}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-white">
                  {t("auth.forgotPassword.emailSent")} <strong>{email}</strong>
                </p>
                <p className="text-white/80 text-sm mt-2">
                  {t("auth.forgotPassword.checkEmail")}
                </p>
              </div>

              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="text-travliaq-turquoise hover:text-travliaq-turquoise/80 text-sm transition-colors"
              >
                {t("auth.forgotPassword.resend")}
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
