import type { Item } from '../types';
import { Trash2, ExternalLink, Check, Pencil, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { VoteButton } from './VoteButton';

interface ItemCardProps {
    item: Item;
    isSelected: boolean;
    onToggleSelect: () => void;
    onDelete: () => void;
    onEdit: (item: Item) => void;
    voteCount: number;
    hasVoted: boolean;
    onOpenComments: () => void;
    currentUserId: string;
    commentCount: number;
}

export function ItemCard({
    item,
    isSelected,
    onToggleSelect,
    onDelete,
    onEdit,
    voteCount,
    hasVoted,
    onOpenComments,
    currentUserId,
    commentCount
}: ItemCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 dark:bg-slate-800 ${isSelected
                ? 'border-brand-blue ring-4 ring-brand-blue/20 shadow-xl'
                : 'border-slate-200 shadow-sm hover:shadow-xl dark:border-slate-700'
                }`}
        >
            {/* Image & Overlay */}
            <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.title || 'Producto'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium dark:text-slate-500">
                        Sin Imagen
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex justify-between items-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-brand-dark transition-colors"
                            title="Ver original"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-brand-blue transition-colors"
                                title="Editar"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-red-500 transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selection Checkbox */}
                <button
                    onClick={onToggleSelect}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isSelected
                        ? 'bg-brand-blue text-white scale-110'
                        : 'bg-white/80 backdrop-blur-sm text-slate-300 hover:bg-white hover:scale-105'
                        }`}
                >
                    <Check className={`w-5 h-5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                    {!isSelected && <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 h-12 leading-tight dark:text-white" title={item.title || 'Sin título'}>
                    {item.title || 'Sin título'}
                </h3>

                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-brand-blue">
                        {item.price?.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase dark:text-slate-500">
                        {item.currency}
                    </span>
                </div>

                {/* Metadata Preview (First 2 fields) */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="space-y-1 mb-4">
                        {Object.entries(item.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                                <span className="text-slate-500 font-medium capitalize dark:text-slate-400">{key}:</span>
                                <span className="text-slate-700 font-bold truncate max-w-[60%] dark:text-slate-300">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Social Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between dark:border-slate-700">
                    <VoteButton
                        itemId={item.id}
                        userId={currentUserId}
                        initialCount={voteCount}
                        initialHasVoted={hasVoted}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenComments(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors dark:text-slate-400 dark:hover:bg-slate-700"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">
                            {commentCount > 0 ? `${commentCount} ` : ''}Comentar
                        </span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
