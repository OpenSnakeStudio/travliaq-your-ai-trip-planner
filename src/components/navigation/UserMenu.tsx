import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Plus, Map, Settings, Info, Mail, FileText, LogOut, LogIn, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ className }) => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-center px-3 py-2 transition-colors',
            'hover:bg-white/10 focus:outline-none rounded-r-xl',
            className
          )}
        >
          <User className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {!user ? (
          <>
            <DropdownMenuItem onClick={() => navigate('/auth')} className="cursor-pointer">
              <LogIn className="w-4 h-4 mr-2" />
              {t('userMenu.login')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/blog')} className="cursor-pointer">
              <BookOpen className="w-4 h-4 mr-2" />
              {t('userMenu.blog')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/cgv')} className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              {t('userMenu.terms')}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => navigate('/questionnaire')} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              {t('userMenu.newTrip')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/discover')} className="cursor-pointer">
              <Map className="w-4 h-4 mr-2" />
              {t('userMenu.myTrips')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/planner')} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              {t('userMenu.planner')}
            </DropdownMenuItem>
            
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/blog')} className="cursor-pointer">
                  <Shield className="w-4 h-4 mr-2" />
                  {t('nav.admin')}
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => navigate('/blog')} className="cursor-pointer">
              <BookOpen className="w-4 h-4 mr-2" />
              {t('userMenu.blog')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/about')} className="cursor-pointer">
              <Info className="w-4 h-4 mr-2" />
              {t('userMenu.about')}
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <a href="mailto:contact@travliaq.com">
                <Mail className="w-4 h-4 mr-2" />
                {t('userMenu.contact')}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/cgv')} className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              {t('userMenu.terms')}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              {t('userMenu.logout')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
