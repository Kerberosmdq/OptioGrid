import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
}

interface CommentSectionProps {
    itemId: string;
    currentUserId: string;
}

export function CommentSection({ itemId, currentUserId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [itemId]);

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('item_id', itemId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);

        const { data, error } = await supabase
            .from('comments')
            .insert({ item_id: itemId, user_id: currentUserId, content: newComment })
            .select()
            .single();

        if (error) {
            toast.error('Error al publicar comentario');
        } else if (data) {
            setComments([...comments, data]);
            setNewComment('');
            toast.success('Comentario publicado');
        }
        setSubmitting(false);
    };

    const handleDelete = async (commentId: string) => {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);
        if (error) {
            toast.error('Error al eliminar');
        } else {
            setComments(comments.filter(c => c.id !== commentId));
            toast.success('Comentario eliminado');
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <p className="text-center text-slate-400">Cargando comentarios...</p>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500">No hay comentarios aún.</p>
                        <p className="text-xs text-slate-400">¡Sé el primero en opinar!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className={`flex gap-3 ${comment.user_id === currentUserId ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${comment.user_id === currentUserId
                                ? 'bg-brand-blue text-white rounded-tr-none'
                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                }`}>
                                <p>{comment.content}</p>
                                <div className={`text-[10px] mt-1 opacity-70 flex items-center gap-2 ${comment.user_id === currentUserId ? 'justify-end' : ''
                                    }`}>
                                    <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}</span>
                                    {comment.user_id === currentUserId && (
                                        <button onClick={() => handleDelete(comment.id)} className="hover:text-red-200 hover:underline">
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="p-2 bg-brand-blue text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
