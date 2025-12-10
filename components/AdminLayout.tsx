

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Upload, Rss, ArrowLeft, ClipboardList, PenTool, Palette, Image as ImageIcon, ShoppingCart, Archive, Zap, Hammer, Edit3, Bell, Coins, SearchCheck, Users, LogOut, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/auth';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const location = useLocation();
    const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
    
    return (
        <Link 
            to={to} 
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                active ? "bg-gold text-charcoal font-semibold shadow-lg shadow-gold/20" : "text-gray-400 hover:bg-charcoal-lighter hover:text-white"
            )}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </Link>
    )
}

export const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
      const check = async () => {
          const valid = await auth.checkSession();
          if (!valid) {
              navigate('/login');
          } else {
              setIsAuthenticated(true);
          }
      };
      check();
  }, [navigate]);

  const handleLogout = async () => {
      await auth.logout();
      navigate('/login');
  };

  if (!isAuthenticated) return <div className="min-h-screen bg-charcoal flex items-center justify-center text-gold">Verifying Secure Session...</div>;

  return (
    <div className="min-h-screen bg-charcoal flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal-light border-r border-charcoal-lighter flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-charcoal-lighter">
             <div className="flex items-center gap-2 text-gold font-serif text-xl">
                 <span>Aureus Admin</span>
             </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/admin/orders" icon={ShoppingCart} label="Orders" />
            <NavItem to="/admin/inventory" icon={Archive} label="Inventory" />
            <NavItem to="/admin/products" icon={Package} label="Products" />
            
            <div className="my-4 border-t border-charcoal-lighter/50 mx-4"></div>
            <div className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Content</div>
            
            <NavItem to="/admin/blogs" icon={BookOpen} label="Blogs & News" />
            <NavItem to="/admin/cms" icon={PenTool} label="CMS" />
            <NavItem to="/admin/media" icon={ImageIcon} label="Media" />
            <NavItem to="/admin/bulk-edit" icon={Edit3} label="Bulk Editor" />
            <NavItem to="/admin/theme" icon={Palette} label="Theme" />
            
            <div className="my-4 border-t border-charcoal-lighter/50 mx-4"></div>
            <div className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">System</div>
            
            <NavItem to="/admin/leads" icon={Users} label="Forms & Leads" />
            <NavItem to="/admin/currency" icon={Coins} label="Currency" />
            <NavItem to="/admin/seo" icon={SearchCheck} label="SEO & Feeds" />
            <NavItem to="/admin/notifications" icon={Bell} label="Notifications" />
            <NavItem to="/admin/automation" icon={Zap} label="Automation" />
            <NavItem to="/admin/ingest" icon={Upload} label="Ingestion" />
            <NavItem to="/admin/logs" icon={ClipboardList} label="Logs" />
            <NavItem to="/admin/devtools" icon={Hammer} label="Dev Tools" />
        </nav>

        <div className="p-4 border-t border-charcoal-lighter space-y-2">
             <button onClick={handleLogout} className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm px-4 py-2 hover:bg-charcoal-lighter rounded transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
             </button>
             <Link to="/" className="flex items-center gap-2 text-gold-dim hover:text-gold text-sm px-4 py-2">
                <ArrowLeft className="w-4 h-4" /> Back to Store
             </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};