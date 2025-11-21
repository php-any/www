import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Github, Terminal, Sparkles, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-origami-border bg-origami-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-origami-cyan via-origami-blue to-origami-magenta rounded-lg flex items-center justify-center group-hover:animate-pulse">
               <Sparkles size={18} className="text-white" />
            </div>
            <span className="self-center text-2xl font-bold whitespace-nowrap text-white tracking-tight font-sans">
              Origami
            </span>
          </Link>
          
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse items-center gap-2">
            <button 
              onClick={toggleLanguage}
              className="text-gray-400 hover:text-white transition-colors p-2 hidden sm:flex items-center gap-1"
              title="Switch Language"
            >
              <Languages size={20} />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            <a 
                href="https://github.com/php-any/origami" 
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hidden sm:block"
            >
                <Github size={22} />
            </a>
            <Link 
                to="/playground"
                className="flex items-center gap-2 text-black bg-white hover:bg-gray-200 font-bold rounded-lg text-sm px-4 py-2 text-center transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
                <Terminal size={16} />
                <span className="hidden sm:inline">{t('nav.editor')}</span>
                <span className="sm:hidden">IDE</span>
            </Link>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-800 focus:outline-none" 
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>

          <div className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${isOpen ? 'block' : 'hidden'}`}>
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-800 rounded-lg bg-gray-900 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
              <li>
                <Link to="/" className={`block py-2 px-3 rounded hover:bg-gray-800 md:hover:bg-transparent md:p-0 transition-colors ${isActive('/') ? 'text-origami-cyan' : 'text-gray-300 hover:text-white'}`}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/showcase" className={`block py-2 px-3 rounded hover:bg-gray-800 md:hover:bg-transparent md:p-0 transition-colors ${isActive('/showcase') ? 'text-origami-cyan' : 'text-gray-300 hover:text-white'}`}>
                  {t('nav.showcase')}
                </Link>
              </li>
              <li>
                <Link to="/docs" className={`block py-2 px-3 rounded hover:bg-gray-800 md:hover:bg-transparent md:p-0 transition-colors ${isActive('/docs') ? 'text-origami-cyan' : 'text-gray-300 hover:text-white'}`}>
                  {t('nav.docs')}
                </Link>
              </li>
              <li>
                <a href="https://github.com/php-any/origami/issues" target="_blank" rel="noreferrer" className="block py-2 px-3 rounded hover:bg-gray-800 md:hover:bg-transparent md:p-0 text-gray-300 hover:text-white transition-colors">
                  {t('nav.community')}
                </a>
              </li>
               {/* Mobile Language Switcher */}
               <li className="md:hidden pt-2 mt-2 border-t border-gray-700">
                  <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 py-2 px-3 text-gray-300 hover:text-white"
                  >
                    <Languages size={16} /> Switch Language ({language === 'en' ? 'English' : '中文'})
                  </button>
               </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;