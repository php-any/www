import React, { useState } from 'react';
import { Layers, Code, ExternalLink, Tag, ArrowRight, Info } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { SHOWCASE_PROJECTS, CODE_EXAMPLES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const Showcase: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0);
  const { t, language } = useLanguage();

  const projects = SHOWCASE_PROJECTS[language];
  const examples = CODE_EXAMPLES[language];

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-[#050505]">
      {/* Hero */}
      <section className="py-20 relative overflow-hidden border-b border-gray-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center justify-center p-1.5 mb-6 rounded-full bg-gray-900 border border-gray-800">
                <span className="text-xs font-medium text-origami-cyan px-3">{t('showcase.madeWith')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('showcase.title1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-origami-cyan to-origami-magenta">{t('showcase.title2')}</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                {t('showcase.subtitle')}
            </p>
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="py-20 bg-[#08080A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Layers className="text-origami-magenta" />
                    <h2 className="text-2xl font-bold text-white">{t('showcase.sectionTitle')}</h2>
                  </div>
                  
                  {/* Fictional Disclaimer */}
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/50 border border-gray-800 text-gray-400 text-sm max-w-3xl">
                      <Info className="shrink-0 mt-0.5 text-origami-blue" size={18} />
                      <p>{t('showcase.fictionalNotice')}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projects.map((project) => (
                      <div key={project.id} className="group relative bg-[#0F0F11] border border-gray-800 rounded-xl overflow-hidden hover:border-origami-border transition-all hover:shadow-2xl">
                          <div className="h-48 w-full overflow-hidden">
                              <img 
                                src={project.image} 
                                alt={project.title} 
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                              />
                          </div>
                          <div className="p-6">
                              <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-origami-cyan transition-colors">{project.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{t('showcase.by')} {project.author}</p>
                                  </div>
                                  <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                                      <ExternalLink size={16} className="text-gray-300" />
                                  </a>
                              </div>
                              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                  {project.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                  {project.tags.map((tag) => (
                                      <span key={tag} className="px-2 py-1 text-xs rounded bg-gray-900 text-gray-400 border border-gray-800 flex items-center gap-1">
                                          <Tag size={10} /> {tag}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Code Examples / Cookbook */}
      <section className="py-20 bg-[#050505] border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-12">
                  
                  {/* Menu */}
                  <div className="w-full lg:w-1/3">
                    <div className="flex items-center gap-3 mb-8">
                        <Code className="text-origami-blue" />
                        <h2 className="text-2xl font-bold text-white">{t('showcase.examplesTitle')}</h2>
                    </div>
                    <p className="text-gray-400 mb-8">
                        {t('showcase.examplesDesc')}
                    </p>
                    
                    <div className="space-y-2">
                        {examples.map((example, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveExample(idx)}
                                className={`w-full text-left p-4 rounded-lg border transition-all flex justify-between items-center group ${
                                    activeExample === idx 
                                    ? 'bg-[#0F0F11] border-origami-blue shadow-lg' 
                                    : 'bg-transparent border-transparent hover:bg-gray-900'
                                }`}
                            >
                                <div>
                                    <h4 className={`font-bold mb-1 ${activeExample === idx ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                        {example.title}
                                    </h4>
                                    <span className="text-xs text-gray-600 uppercase tracking-wider font-bold">
                                        {example.category}
                                    </span>
                                </div>
                                {activeExample === idx && <ArrowRight size={16} className="text-origami-blue" />}
                            </button>
                        ))}
                    </div>
                  </div>

                  {/* Display */}
                  <div className="w-full lg:w-2/3">
                        <div className="bg-[#0F0F11] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-gray-800 bg-[#18181B]/50">
                                <h3 className="text-lg font-bold text-white">{examples[activeExample].title}</h3>
                                <p className="text-gray-400 text-sm mt-2">{examples[activeExample].description}</p>
                            </div>
                            <div className="p-0">
                                <CodeEditor 
                                    codeSnippet={examples[activeExample].code} 
                                    height="h-[500px]" 
                                />
                            </div>
                        </div>
                  </div>
              </div>
          </div>
      </section>

    </div>
  );
};

export default Showcase;