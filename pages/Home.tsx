
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Globe, Code, Activity, Cpu, Check, Minus, Layers, ShieldCheck } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { HOME_FEATURES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Get localized features
  const features = HOME_FEATURES[language];

  const comparisonData = [
    { feature: t('home.cmp.perf'), script: t('home.cmp.perf_script'), origami: t('home.cmp.perf_ori'), highlight: true },
    { feature: t('home.cmp.go'), script: t('home.cmp.go_script'), origami: t('home.cmp.go_ori'), highlight: true },
    { feature: t('home.cmp.thread'), script: t('home.cmp.thread_script'), origami: t('home.cmp.thread_ori'), highlight: true },
    { feature: t('home.cmp.mem'), script: t('home.cmp.mem_script'), origami: t('home.cmp.mem_ori'), highlight: true },
    { feature: t('home.cmp.gui'), script: t('home.cmp.gui_script'), origami: t('home.cmp.gui_ori'), highlight: true },
    { feature: t('home.cmp.hot'), script: t('home.cmp.hot_script'), origami: t('home.cmp.hot_ori'), highlight: true },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-[#050505]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
               <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-origami-blue/20 rounded-full blur-[100px] animate-pulse-fast"></div>
               <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-origami-magenta/10 rounded-full blur-[120px]"></div>
           </div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40"></div>
           <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center pt-10 lg:pt-0">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm animate-float">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-origami-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-origami-cyan"></span>
                </span>
                <span className="text-xs font-medium text-gray-300 tracking-wide">{t('home.release')}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              {t('home.heroTitle1')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-origami-cyan via-origami-blue to-origami-magenta animate-pulse-fast">
                {t('home.heroTitle2')}
              </span> {t('home.heroTitle3')}
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('home.heroDesc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/docs" className="px-8 py-4 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {t('home.getStarted')} <ArrowRight size={20} />
              </Link>
              <Link to="/playground" className="px-8 py-4 rounded-lg bg-[#18181B] text-white font-medium border border-gray-800 hover:border-origami-border hover:bg-[#27272A] transition-all flex items-center justify-center gap-2 group">
                <Code size={20} className="text-gray-400 group-hover:text-origami-cyan transition-colors"/> {t('home.tryOnline')}
              </Link>
            </div>
          </div>

          {/* Interactive Feature Showcase */}
          <div className="w-full max-w-2xl mx-auto lg:mx-0">
            <div className="bg-[#0F0F11]/80 backdrop-blur-xl border border-origami-border rounded-2xl p-2 shadow-2xl">
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    {features.map((feature, idx) => (
                        <button
                            key={feature.id}
                            onClick={() => setActiveFeature(idx)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                activeFeature === idx 
                                ? 'bg-[#18181B] text-white shadow-sm border border-gray-700' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                        >
                            {feature.title}
                        </button>
                    ))}
                </div>
                
                {/* Feature Description */}
                <div className="px-2 mb-4 min-h-[3rem]">
                    <p className="text-sm text-gray-400">{features[activeFeature].description}</p>
                </div>

                {/* Editor Instance */}
                <CodeEditor 
                    codeSnippet={features[activeFeature].code} 
                    height="h-[400px]"
                    showConsole={false}
                    onRunClick={() => navigate('/playground')}
                />
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
            <ArrowRight size={24} className="rotate-90" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-[#08080A] relative border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('home.featuresTitle')}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">{t('home.featuresDesc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-[#0F0F11] border border-gray-800 hover:border-origami-cyan/30 transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center text-origami-cyan mb-6 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{t('home.feat1Title')}</h3>
                    <p className="text-gray-400 leading-relaxed">{t('home.feat1Desc')}</p>
                </div>
                <div className="p-8 rounded-2xl bg-[#0F0F11] border border-gray-800 hover:border-origami-magenta/30 transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center text-origami-magenta mb-6 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{t('home.feat2Title')}</h3>
                    <p className="text-gray-400 leading-relaxed">{t('home.feat2Desc')}</p>
                </div>
                <div className="p-8 rounded-2xl bg-[#0F0F11] border border-gray-800 hover:border-origami-blue/30 transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center text-origami-blue mb-6 group-hover:scale-110 transition-transform">
                        <Globe size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{t('home.feat3Title')}</h3>
                    <p className="text-gray-400 leading-relaxed">{t('home.feat3Desc')}</p>
                </div>
            </div>
        </div>
      </section>

      {/* Performance/Features Comparison Table */}
      <section className="py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('home.statsTitle')}</h2>
                <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                    {t('home.statsDesc')}
                </p>
            </div>

            <div className="bg-[#0F0F11] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl max-w-5xl mx-auto">
                <div className="grid grid-cols-3 bg-[#18181B] border-b border-gray-800 p-4 md:p-6">
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('home.cmp.feature')}</div>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('home.cmp.scripting')}</div>
                    <div className="text-sm font-bold text-origami-cyan uppercase tracking-wider">{t('home.cmp.origami')}</div>
                </div>
                
                <div className="divide-y divide-gray-800/50">
                    {comparisonData.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 p-4 md:p-6 hover:bg-white/5 transition-colors items-center">
                            <div className="font-medium text-gray-300">{item.feature}</div>
                            <div className="text-gray-500 text-sm flex items-center gap-2">
                                <Minus size={14} className="opacity-50" />
                                {item.script}
                            </div>
                            <div className="text-white font-bold text-sm flex items-center gap-2">
                                <div className="p-1 rounded-full bg-green-500/10 text-green-500">
                                    <Check size={14} />
                                </div>
                                <span className={item.highlight ? "text-origami-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]" : ""}>
                                    {item.origami}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      <footer className="bg-black border-t border-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <span className="text-2xl font-bold text-white tracking-tight">Origami</span>
                    <p className="text-gray-500 text-sm mt-2">{t('home.footerDesc')}</p>
                </div>
                <div className="flex gap-8">
                    <a href="#" className="text-gray-500 hover:text-white transition-colors">{t('home.footerLinks.docs')}</a>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors">{t('home.footerLinks.github')}</a>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors">{t('home.footerLinks.discord')}</a>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors">{t('home.footerLinks.license')}</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
