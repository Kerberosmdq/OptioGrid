import { useState } from 'react';
import type { Item } from '../types';
import { Loader2, Sparkles, X, Trophy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ComparisonModalProps {
    items: Item[];
    onClose: () => void;
    isOpen: boolean;
}

interface Recommendation {
    recommendation_id: string;
    reasoning: string;
    scores: Record<string, number>;
    pros_cons: Record<string, { pros: string[]; cons: string[] }>;
}

export function ComparisonModal({ items, onClose, isOpen }: ComparisonModalProps) {
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

    const handleGetRecommendation = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, criteria: 'best value' }),
            });

            if (!response.ok) throw new Error('Failed to get recommendation');

            const data = await response.json();
            setRecommendation(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al obtener la recomendación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl relative z-10 overflow-hidden dark:bg-slate-800"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-20 dark:bg-slate-900/80 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-100 rounded-xl text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Comparación Inteligente</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Analizando {items.length} productos</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-900">
                            {/* AI Section */}
                            <div className="mb-10">
                                {!recommendation ? (
                                    <div className="bg-gradient-to-br from-violet-600 to-fuchsia-700 rounded-3xl p-8 text-white text-center shadow-xl shadow-violet-900/20 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                        <div className="relative z-10 max-w-2xl mx-auto">
                                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-violet-200" />
                                            <h3 className="text-2xl font-bold mb-3">
                                                ¿Indeciso? Deja que la IA decida por ti.
                                            </h3>
                                            <p className="text-violet-100 mb-8 text-lg">
                                                Analizaremos precios, características y reseñas para encontrar la mejor opción.
                                            </p>
                                            <button
                                                onClick={handleGetRecommendation}
                                                disabled={loading}
                                                className="px-8 py-4 bg-white text-violet-700 rounded-2xl font-bold hover:bg-violet-50 hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 shadow-lg flex items-center mx-auto gap-3"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="animate-spin h-5 w-5" />
                                                        Analizando datos...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-5 w-5" />
                                                        Generar Recomendación
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-3xl p-8 border border-violet-100 shadow-xl shadow-violet-100/50 relative overflow-hidden dark:bg-slate-800 dark:border-slate-700 dark:shadow-none"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="flex-shrink-0">
                                                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center dark:bg-yellow-900/30 dark:text-yellow-400">
                                                    <Trophy className="h-8 w-8" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">Ganador</span>
                                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                        {items.find(i => i.id === recommendation.recommendation_id)?.title}
                                                    </h3>
                                                </div>
                                                <p className="text-slate-600 text-lg leading-relaxed dark:text-slate-300">{recommendation.reasoning}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Comparison Table */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] table-fixed">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                                <th className="w-48 p-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider dark:text-slate-500">Producto</th>
                                                {items.map(item => (
                                                    <th key={item.id} className={`p-6 w-72 text-left border-l border-slate-100 dark:border-slate-700 ${recommendation?.recommendation_id === item.id ? 'bg-violet-50/50 dark:bg-violet-900/20' : ''}`}>
                                                        <div className="font-bold text-slate-900 line-clamp-2 mb-3 text-lg dark:text-white" title={item.title}>
                                                            {item.title}
                                                        </div>
                                                        <div className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">
                                                            {item.currency} {item.price?.toLocaleString()}
                                                        </div>
                                                        {recommendation && (
                                                            <div className="mt-4 flex items-center gap-2">
                                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${recommendation.scores[item.id]}%` }}
                                                                        transition={{ duration: 1, delay: 0.5 }}
                                                                        className={`h-full rounded-full ${recommendation.scores[item.id] > 85 ? 'bg-green-500' : recommendation.scores[item.id] > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{recommendation.scores[item.id]}</span>
                                                            </div>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            <tr>
                                                <td className="p-6 font-medium text-slate-500 dark:text-slate-400">Vista Previa</td>
                                                {items.map(item => (
                                                    <td key={item.id} className={`p-6 border-l border-slate-100 dark:border-slate-700 ${recommendation?.recommendation_id === item.id ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''}`}>
                                                        <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 dark:bg-slate-700 dark:border-slate-600">
                                                            {item.image_url ? (
                                                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-500">Sin Imagen</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                            {recommendation && (
                                                <>
                                                    <tr>
                                                        <td className="p-6 font-medium text-slate-500 align-top pt-8 dark:text-slate-400">Pros</td>
                                                        {items.map(item => (
                                                            <td key={item.id} className={`p-6 align-top border-l border-slate-100 dark:border-slate-700 ${recommendation?.recommendation_id === item.id ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''}`}>
                                                                <ul className="space-y-3">
                                                                    {recommendation.pros_cons[item.id]?.pros.map((pro, i) => (
                                                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                                            <ThumbsUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                            {pro}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr>
                                                        <td className="p-6 font-medium text-slate-500 align-top pt-8 dark:text-slate-400">Contras</td>
                                                        {items.map(item => (
                                                            <td key={item.id} className={`p-6 align-top border-l border-slate-100 dark:border-slate-700 ${recommendation?.recommendation_id === item.id ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''}`}>
                                                                <ul className="space-y-3">
                                                                    {recommendation.pros_cons[item.id]?.cons.map((con, i) => (
                                                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                                            <ThumbsDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                                            {con}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </>
                                            )}
                                            <tr>
                                                <td className="p-6 font-medium text-slate-500 align-top dark:text-slate-400">Descripción</td>
                                                {items.map(item => (
                                                    <td key={item.id} className={`p-6 text-sm text-slate-600 align-top border-l border-slate-100 dark:border-slate-700 dark:text-slate-300 ${recommendation?.recommendation_id === item.id ? 'bg-violet-50/30 dark:bg-violet-900/10' : ''}`}>
                                                        <div className="line-clamp-6 hover:line-clamp-none transition-all p-3 bg-slate-50 rounded-xl dark:bg-slate-700">
                                                            {item.description}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
