
import React, { useState, useCallback } from 'react';
import { DigitalPackage } from './types';
import { generateDigitalPackage } from './services/geminiService';
import { Loader } from './components/Loader';
import { ArrowRight, BookOpen, Camera, CheckSquare, Copy, Download, Film, MessageSquare } from './components/Icons';

type Tab = 'ebook' | 'posts' | 'cover' | 'bonus' | 'script';

const App: React.FC = () => {
    const [topic, setTopic] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [digitalPackage, setDigitalPackage] = useState<DigitalPackage | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('ebook');
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const handleGeneratePackage = useCallback(async () => {
        if (!topic.trim()) {
            setError('Por favor, insira um tópico para o pacote digital.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setDigitalPackage(null);
        setCoverImageUrl(null);

        try {
            const result = await generateDigitalPackage(topic);
            setDigitalPackage(result.digitalPackage);
            setCoverImageUrl(result.coverImageUrl);
            setActiveTab('cover');
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao gerar o pacote. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    const handleCopyToClipboard = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    };

    const tabItems = [
        { id: 'cover', label: 'Capa', icon: <Camera className="w-5 h-5" /> },
        { id: 'ebook', label: 'Ebook', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'posts', label: 'Posts', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'bonus', label: 'Bônus', icon: <CheckSquare className="w-5 h-5" /> },
        { id: 'script', label: 'Script de Vendas', icon: <Film className="w-5 h-5" /> },
    ];

    const renderContent = () => {
        if (!digitalPackage || !coverImageUrl) return null;

        switch (activeTab) {
            case 'cover':
                return (
                    <div className="text-center p-4">
                        <h3 className="text-2xl font-bold text-emerald-400 mb-4">{digitalPackage.ebook.title}</h3>
                        <img src={coverImageUrl} alt="Capa do Ebook" className="mx-auto rounded-lg shadow-2xl shadow-emerald-500/20 max-w-full h-auto md:max-w-md" />
                        <a href={coverImageUrl} download={`capa-${digitalPackage.ebook.title.toLowerCase().replace(/\s+/g, '-')}.png`} className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                            Baixar Capa
                        </a>
                    </div>
                );
            case 'ebook':
                return (
                    <div className="p-4 space-y-6">
                        <h3 className="text-3xl font-bold text-emerald-400 mb-4">{digitalPackage.ebook.title}</h3>
                        {digitalPackage.ebook.chapters.map((chapter, index) => (
                            <div key={index} className="bg-gray-800/50 p-6 rounded-lg">
                                <h4 className="text-xl font-semibold text-emerald-300 mb-2">{chapter.title}</h4>
                                <p className="whitespace-pre-wrap leading-relaxed text-gray-300">{chapter.content}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'posts':
                return (
                    <div className="p-4 space-y-4">
                        <h3 className="text-2xl font-bold text-emerald-400 mb-4">Posts para Redes Sociais</h3>
                        {digitalPackage.posts.map((post, index) => (
                             <div key={index} className="bg-gray-800/50 p-4 rounded-lg relative">
                                <button onClick={() => handleCopyToClipboard(post, `post-${index}`)} className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                                  {copiedStates[`post-${index}`] ? <CheckSquare className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-300" />}
                                </button>
                                <p className="whitespace-pre-wrap text-gray-300 pr-10">{post}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'bonus':
                return (
                    <div className="p-4 bg-gray-800/50 rounded-lg relative">
                         <button onClick={() => handleCopyToClipboard(digitalPackage.bonus.content, 'bonus')} className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                            {copiedStates['bonus'] ? <CheckSquare className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-300" />}
                        </button>
                        <h3 className="text-2xl font-bold text-emerald-400 mb-2">{digitalPackage.bonus.title}</h3>
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-300 pr-10">{digitalPackage.bonus.content}</p>
                    </div>
                );
            case 'script':
                return (
                    <div className="p-4 bg-gray-800/50 rounded-lg relative">
                        <button onClick={() => handleCopyToClipboard(digitalPackage.salesScript, 'script')} className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                            {copiedStates['script'] ? <CheckSquare className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-300" />}
                        </button>
                        <h3 className="text-2xl font-bold text-emerald-400 mb-4">Script de Vendas</h3>
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-300 pr-10">{digitalPackage.salesScript}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                        Criador de Pacotes Digitais Premium
                    </h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        Insira um tópico e gere um pacote digital completo (ebook, posts, capa, bônus e script de vendas) pronto para revenda.
                    </p>
                </header>

                <main>
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePackage()}
                                placeholder="Ex: Como investir em criptomoedas para iniciantes"
                                className="flex-grow bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-lg p-4 text-lg placeholder-gray-500 transition"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleGeneratePackage}
                                disabled={isLoading || !topic.trim()}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader />
                                        <span>Gerando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Gerar Pacote</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                         {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                    </div>

                    {isLoading && !digitalPackage && (
                         <div className="text-center p-10 mt-8">
                           <div className="inline-block"><Loader /></div>
                           <p className="text-gray-400 mt-4 text-lg">A IA está criando seu pacote digital. Isso pode levar um momento...</p>
                         </div>
                    )}

                    {digitalPackage && (
                        <div className="mt-10 bg-gray-800/40 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
                            <div className="border-b border-gray-700">
                               <div className="flex flex-wrap items-center p-2 sm:p-0">
                                    {tabItems.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as Tab)}
                                            className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-semibold transition-colors duration-200 ${
                                                activeTab === tab.id
                                                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                                                    : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {tab.icon}
                                            <span>{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 sm:p-6 md:p-8 min-h-[400px]">
                                {renderContent()}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;