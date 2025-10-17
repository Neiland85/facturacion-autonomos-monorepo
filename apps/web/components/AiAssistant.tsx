import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { View, SubscriptionTier, Message, QuarterlySummaryPayload, ExplainerPayload } from '../types';
import { ArrowLeftIcon, SparklesIcon, PaperAirplaneIcon, UserCircleIcon, DiamondIcon, ChartPieIcon, BookOpenIcon, ChartBarIcon, DocumentChartBarIcon } from './icons';
import { useSound } from '../hooks/useSound';
import { marked } from 'marked';
import { getQuarterlySummary, getAccountingExplanation } from '../services/geminiService';

interface AiAssistantProps {
  setView: (view: View) => void;
  subscriptionTier: SubscriptionTier;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const QuarterlySummaryCard: React.FC<{ payload: QuarterlySummaryPayload }> = ({ payload }) => {
  return (
    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="bg-orange-500/10 p-2 rounded-lg">
          <ChartPieIcon className="w-6 h-6 text-orange-500" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Resumen Fiscal del Trimestre</h4>
      </div>
      <p className="mt-3 text-slate-600 dark:text-slate-300">{payload.summaryText}</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tendencia Rentabilidad</p>
          <p className={`text-xl font-bold ${payload.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{payload.trend}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Próximos Pagos</p>
          <p className="text-base font-semibold text-slate-800 dark:text-white">{payload.nextPayments[0]}</p>
        </div>
      </div>
    </div>
  );
};

const ExplainerCard: React.FC<{ payload: ExplainerPayload }> = ({ payload }) => {
    return (
        <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                    <BookOpenIcon className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{payload.concept}</h4>
            </div>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{payload.explanation}</p>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enlaces de interés:</h5>
                <ul className="mt-2 space-y-1">
                    {payload.links.map(link => (
                        <li key={link.url}>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-500 hover:underline">
                                {link.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


const AiAssistant: React.FC<AiAssistantProps> = ({ setView, subscriptionTier }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playSound } = useSound();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFreeTier = subscriptionTier === 'free';
  const chatLimit = 5;

  const userMessagesCount = messages.filter(m => m.role === 'user').length;
  const limitReached = isFreeTier && userMessagesCount >= chatLimit;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBackClick = () => {
    playSound('click');
    setView('dashboard');
  };
  
  const handlePricingClick = () => {
      playSound('click');
      setView('pricing');
  }

  const sendMessage = async (messageContent: string) => {
    if (isLoading || limitReached) return;

    setIsLoading(true);
    setError(null);
    playSound('click');
    
    const userMessage: Message = { role: 'user', type: 'text', content: messageContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Intent detection for special commands
    const lowerCaseMessage = messageContent.toLowerCase();

    if (lowerCaseMessage.includes('resúmeme mi trimestre')) {
      try {
        const summaryData = await getQuarterlySummary();
        const summaryMessage: Message = {
          role: 'model', type: 'summary', content: '', payload: summaryData,
        };
        setMessages(prev => [...prev, summaryMessage]);
        playSound('notify');
      } catch (e) {
        setError('No se pudo generar el resumen trimestral.');
        playSound('error');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (lowerCaseMessage.includes('qué es') || lowerCaseMessage.includes('explícame') || lowerCaseMessage.includes('modelo 303')) {
        try {
            const explainerData = await getAccountingExplanation("Modelo 303");
            const explainerMessage: Message = {
                role: 'model', type: 'explainer', content: '', payload: explainerData
            };
            setMessages(prev => [...prev, explainerMessage]);
            playSound('notify');
        } catch (e) {
            setError('No se pudo generar la explicación.');
            playSound('error');
        } finally {
            setIsLoading(false);
        }
        return;
    }

    try {
        const model = 'gemini-2.5-flash';
        const chat = ai.chats.create({
            model: model,
            config: {
                systemInstruction: "Eres 'TRiBuBot', un asistente experto en fiscalidad, contabilidad y ayudas para autónomos y PYMEs en España. Eres amable, directo y tus respuestas son claras y concisas. Usas modelos de transformadores avanzados para tareas complejas como la preparación de declaraciones de impuestos. Para cualquier dato que implique comparación (ej. gastos por categoría) o listas detalladas, formatea SIEMPRE tu respuesta usando tablas Markdown para una visualización óptima. Si una pregunta del usuario es ambigua, haz una pregunta clarificadora. No respondas a preguntas que no estén relacionadas con el ámbito empresarial y fiscal de España."
            },
            history: newMessages.slice(0, -1).map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        });

        const resultStream = await chat.sendMessageStream({ message: messageContent });
        
        let modelResponse = '';
        setMessages(prev => [...prev, { role: 'model', type: 'text', content: '' }]);

        for await (const chunk of resultStream) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.content = modelResponse;
                    return [...prev.slice(0, -1), lastMessage];
                }
                return prev;
            });
        }
        playSound('notify');

    } catch (e) {
      console.error(e);
      setError('Hubo un error al contactar con el asistente. Por favor, inténtalo de nuevo.');
      playSound('error');
      // remove the user message if the call fails
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleSmartActionClick = (prompt: string) => {
      if(isFreeTier) {
          handlePricingClick();
          playSound('error');
      } else {
          sendMessage(prompt);
      }
  }

  const examplePrompts = [
    '¿Qué es el modelo 303?',
    'Como autónomo, ¿qué gastos puedo deducirme?',
    '¿Existen ayudas para digitalizar mi PYME en Andalucía?',
  ];
  
  const smartActions = [
      {
          prompt: 'Analiza mis gastos del último trimestre y categorízalos en una tabla.',
          label: 'Analizar Gastos',
          icon: ChartPieIcon,
          description: 'Obtén un desglose visual de tus gastos.'
      },
      {
          prompt: 'Compara mi rendimiento de ingresos y gastos de este trimestre con el anterior.',
          label: 'Comparar Rendimiento',
          icon: ChartBarIcon,
          description: 'Mide la evolución de tu negocio.'
      },
      {
          prompt: 'Quiero empezar a preparar mi declaración trimestral. Guíame en el proceso y pregúntame por los gastos deducibles más comunes para asegurar que no me olvido de nada.',
          label: 'Preparar Declaración',
          icon: DocumentChartBarIcon,
          description: 'La IA te guía para optimizar tus impuestos.'
      }
  ];

  return (
    <div className="h-full flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <button onClick={handleBackClick} className="text-orange-500 dark:text-orange-400 mb-4 hover:underline flex items-center gap-1">
                <ArrowLeftIcon className="w-4 h-4" /> Volver al Dashboard
            </button>
            <div className="flex items-center gap-3">
                <SparklesIcon className="w-8 h-8 text-orange-500" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Asistente TRiBuBot</h2>
                    <p className="text-slate-500 dark:text-slate-400">Tu experto en fiscalidad y contabilidad, potenciado por IA.</p>
                </div>
            </div>
        </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <SparklesIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />}
            <div className={`w-full max-w-2xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-lg' : 'bg-slate-200 dark:bg-slate-800 rounded-bl-lg'}`}>
              {msg.type === 'summary' && msg.payload && 'summaryText' in msg.payload && (
                <QuarterlySummaryCard payload={msg.payload} />
              )}
              {msg.type === 'explainer' && msg.payload && 'explanation' in msg.payload && (
                <ExplainerCard payload={msg.payload} />
              )}
              {msg.type === 'text' && (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-table:w-full prose-th:bg-slate-100 dark:prose-th:bg-slate-700 prose-th:p-2 prose-td:p-2 prose-tr:border-b prose-tr:border-slate-200 dark:prose-tr:border-slate-600" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
              )}
            </div>
            {msg.role === 'user' && <UserCircleIcon className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex gap-3">
                <SparklesIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div className="w-full max-w-2xl p-4 rounded-2xl bg-slate-200 dark:bg-slate-800 rounded-bl-lg">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">TRiBuBot está pensando...</span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

       {messages.length === 0 && (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                 <SparklesIcon className="w-16 h-16 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Hola, soy TRiBuBot</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">¿En qué te puedo ayudar hoy?</p>
            <div className="w-full max-w-2xl mt-8">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Acciones Inteligentes</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {smartActions.map(action => (
                         <button
                            key={action.prompt}
                            onClick={() => handleSmartActionClick(action.prompt)}
                            disabled={limitReached}
                            className="relative group flex items-start gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                        >
                            <action.icon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{action.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
                            </div>
                            {isFreeTier && (
                                <div className="absolute top-2 right-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
                                        <DiamondIcon className="w-3.5 h-3.5"/>
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mt-8 mb-3">O prueba con una pregunta</p>
                <div className="space-y-3">
                    {examplePrompts.slice(0, 2).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      disabled={isLoading || limitReached}
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-left text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
            </div>
          </div>
        )}
        
        {isFreeTier && (
          <div className="px-4 md:px-6 py-2 text-center text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10">
              <p>
                  Has usado {userMessagesCount} de {chatLimit} mensajes.
                  <button onClick={handlePricingClick} className="font-bold underline ml-2 hover:text-amber-600 dark:hover:text-amber-300">
                      <DiamondIcon className="w-4 h-4 inline-block mr-1" />
                      Actualizar a Pro
                  </button>
              </p>
          </div>
        )}

      <div className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-100/50 dark:bg-slate-900/50">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={limitReached ? "Límite de mensajes alcanzado" : "Escribe tu pregunta aquí..."}
            disabled={isLoading || limitReached}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-4 pr-12 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || limitReached}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
         {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default AiAssistant;