import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Gem, Lock } from 'lucide-react';
import { useCart } from '../lib/cartContext';
import { cn } from '../lib/utils';
import { CurrencySwitcher } from './CurrencySwitcher';

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const location = useLocation();

  useEffect(() => {
      setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-charcoal text-gray-100 font-sans selection:bg-gold selection:text-charcoal">
      {/* Top Bar */}
      <div className="bg-charcoal-light border-b border-charcoal-lighter text-xs py-2 px-4 text-center text-gold-dim">
        <span>Global Shipping Insured &bull; Secure Vault Storage Available &bull; 24/7 Support</span>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-charcoal/95 backdrop-blur border-b border-charcoal-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-gold to-gold-dark p-2 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                 <Gem className="h-6 w-6 text-charcoal" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-wide text-gold group-hover:text-white transition-colors">AUREUS</span>
                <span className="text-[0.6rem] tracking-[0.2em] text-gray-500 uppercase">Gold Corp</span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium hover:text-gold transition-colors">Collections</Link>
              <Link to="/blogs" className="text-sm font-medium hover:text-gold transition-colors">News & Insights</Link>
              <Link to="/" className="text-sm font-medium hover:text-gold transition-colors">Invest</Link>
              <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-300 flex items-center gap-1">
                 <Lock className="w-3 h-3" /> Staff
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block border-r border-charcoal-lighter pr-4">
                  <CurrencySwitcher />
              </div>
              <Link to="/cart" className="relative p-2 hover:bg-charcoal-lighter rounded-full transition-colors group">
                <ShoppingCart className="h-6 w-6 text-gray-300 group-hover:text-gold" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-gold text-charcoal text-[10px] font-bold flex items-center justify-center rounded-full">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </Link>
              <button 
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-charcoal-light border-b border-charcoal-lighter">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" className="block px-3 py-2 rounded-md hover:bg-charcoal-lighter">Collections</Link>
              <Link to="/blogs" className="block px-3 py-2 rounded-md hover:bg-charcoal-lighter">News & Insights</Link>
              <Link to="/" className="block px-3 py-2 rounded-md hover:bg-charcoal-lighter">Invest</Link>
              <div className="px-3 py-2">
                  <CurrencySwitcher />
              </div>
              <Link to="/admin" className="block px-3 py-2 rounded-md text-gray-500">Staff Access</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-charcoal-light border-t border-charcoal-lighter pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-serif text-gold text-lg mb-4">Aureus Gold Corp</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                The premier destination for discerning investors seeking physical gold, silver, and rare specimens. Fully insured, authenticated, and secure.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/" className="hover:text-gold">Gold Bars</Link></li>
                <li><Link to="/" className="hover:text-gold">Coins</Link></li>
                <li><Link to="/" className="hover:text-gold">Nuggets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gold">About Us</a></li>
                <li><Link to="/blogs" className="hover:text-gold">Market News</Link></li>
                <li><a href="#" className="hover:text-gold">Vault Storage</a></li>
                <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Trust</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>Authenticated</li>
                <li>Insured Shipping</li>
                <li>Secure Payments</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-charcoal-lighter pt-8 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Aureus Gold Corp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};