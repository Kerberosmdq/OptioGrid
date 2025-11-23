import { useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface VoteButtonProps {
    itemId: string;
    userId: string;
    initialCount: number;
    initialHasVoted: boolean;
}

export function VoteButton({ itemId, userId, initialCount, initialHasVoted }: VoteButtonProps) {
    const [count, setCount] = useState(initialCount);
    const [hasVoted, setHasVoted] = useState(initialHasVoted);
    const [loading, setLoading] = useState(false);

    const toggleVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            toast.error('Debes iniciar sesión para votar');
            return;
        }

        if (loading) return;
        setLoading(true);

        // Optimistic update
        const newHasVoted = !hasVoted;
        setHasVoted(newHasVoted);
        setCount(prev => newHasVoted ? prev + 1 : prev - 1);

        try {
            if (newHasVoted) {
                const { error } = await supabase.from('votes').insert({ item_id: itemId, user_id: userId });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('votes').delete().match({ item_id: itemId, user_id: userId });
                if (error) throw error;
            }
        } catch (error) {
            console.error('Vote error:', error);
            // Revert
            setHasVoted(!newHasVoted);
            setCount(prev => !newHasVoted ? prev + 1 : prev - 1);
            toast.error('Error al votar. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleVote}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${hasVoted
                ? 'bg-pink-50 text-pink-600 border border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800'
                : 'bg-white/80 backdrop-blur-sm text-slate-500 hover:bg-white border border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-600'
                }`}
        >
            <Heart className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
            <span>{count}</span>
        </button>
    );
}
