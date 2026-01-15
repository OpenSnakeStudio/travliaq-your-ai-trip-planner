import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Create password schema inside component to use translations
  const createPasswordSchema = () => z
    .string()
    .min(8, t('auth.validation.minLength'))
    .regex(/[a-z]/, t('auth.validation.lowercase'))
    .regex(/[A-Z]/, t('auth.validation.uppercase'))
    .regex(/[0-9]/, t('auth.validation.digit'));

  useEffect(() => {
    // Check if we have a recovery token
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');

    if (!accessToken) {
      toast.error(t('auth.resetPassword.error.invalidLink'));
      navigate('/auth');
    }
  }, [navigate, t]);

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    try {
      createPasswordSchema().parse(pwd);
      setPasswordErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const msgs = error.errors.map(e => e.message);
        setPasswordErrors(msgs);
        return false;
      }
      return false;
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error(t('auth.resetPassword.error.emptyFields'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.resetPassword.error.mismatch'));
      return;
    }

    if (!validatePassword(password)) {
      toast.error(t('auth.resetPassword.error.weak'));
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success(t('auth.resetPassword.success'));
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || t('auth.resetPassword.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-travliaq-deep-blue via-travliaq-deep-blue/95 to-travliaq-turquoise/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('auth.resetPassword.title')}
            </h1>
            <p className="text-white/80">
              {t('auth.resetPassword.subtitle')}
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                {t('auth.resetPassword.passwordLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {passwordErrors.length > 0 && (
                <ul className="text-xs text-red-300 space-y-1 mt-2">
                  {passwordErrors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              )}
              
              {password && passwordErrors.length === 0 && (
                <p className="text-xs text-green-300 mt-2">✓ {t('auth.validation.passwordSecure')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                {t('auth.resetPassword.confirmLabel')}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-300 mt-2">• {t('auth.resetPassword.error.mismatch')}</p>
              )}

              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-300 mt-2">✓ {t('auth.validation.passwordsMatch')}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-travliaq-turquoise hover:bg-travliaq-turquoise/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('auth.resetPassword.submitButton')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
