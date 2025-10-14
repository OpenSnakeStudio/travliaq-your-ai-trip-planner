import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import logo from '@/assets/logo-travliaq.png';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavigationProps {
  language: 'fr' | 'en';
}

const Navigation = ({ language }: NavigationProps) => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);

  const isFrench = language === 'fr';
  const langSwitchUrl = isFrench ? '/en' : '/';
  const langSwitchText = isFrench ? 'English' : 'Français';
  const homeText = isFrench ? 'Accueil' : 'Home';
  const loginText = isFrench ? 'Se connecter' : 'Login';
  const blogText = isFrench ? 'Blog' : 'Blog';
  const adminText = isFrench ? 'Admin' : 'Admin';
  const logoutText = isFrench ? 'Déconnexion' : 'Logout';

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
      <div className="container mx-auto flex justify-between items-center">
        <a href={isFrench ? '/' : '/en'}>
          <img src={logo} alt="Logo Travliaq" className="h-16 md:h-20 w-auto" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white hover:text-white/80 transition-colors"
          >
            <a href={isFrench ? '/' : '/en'}>{homeText}</a>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white hover:text-white/80 transition-colors"
          >
            <a href="/blog">{blogText}</a>
          </Button>
          
          {user && !roleLoading && isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:text-white/80 transition-colors"
            >
              <a href="/admin/blog">{adminText}</a>
            </Button>
          )}
          
          {!user && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:text-white/80 transition-colors"
            >
              <a href="/auth">{loginText}</a>
            </Button>
          )}
          
          {user && (
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutText}
            </Button>
          )}
          
          <a
            href={langSwitchUrl}
            className="text-white hover:text-white/80 transition-colors font-inter"
          >
            {langSwitchText}
          </a>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-travliaq-deep-blue border-l border-white/10">
            <nav className="flex flex-col gap-4 mt-8">
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="text-white hover:text-white/80 transition-colors justify-start"
                onClick={closeMenu}
              >
                <a href={isFrench ? '/' : '/en'}>{homeText}</a>
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="text-white hover:text-white/80 transition-colors justify-start"
                onClick={closeMenu}
              >
                <a href="/blog">{blogText}</a>
              </Button>
              
              {user && !roleLoading && isAdmin && (
                <Button
                  variant="ghost"
                  size="lg"
                  asChild
                  className="text-white hover:text-white/80 transition-colors justify-start"
                  onClick={closeMenu}
                >
                  <a href="/admin/blog">{adminText}</a>
                </Button>
              )}
              
              {!user && (
                <Button
                  variant="ghost"
                  size="lg"
                  asChild
                  className="text-white hover:text-white/80 transition-colors justify-start"
                  onClick={closeMenu}
                >
                  <a href="/auth">{loginText}</a>
                </Button>
              )}
              
              {user && (
                <Button
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                  variant="ghost"
                  size="lg"
                  className="text-white hover:text-white/80 transition-colors justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {logoutText}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="text-white hover:text-white/80 transition-colors justify-start"
                onClick={closeMenu}
              >
                <a href={langSwitchUrl}>{langSwitchText}</a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navigation;
