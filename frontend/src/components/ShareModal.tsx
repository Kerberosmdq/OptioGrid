import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Mail, Trash2, Shield, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';


interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
    templateName: string;
}

interface Collaborator {
    id: string;
    user_email: string;
    role: 'editor' | 'viewer';
}

export function ShareModal({ isOpen, onClose, templateId, templateName }: ShareModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'editor' | 'viewer'>('viewer');
    const [loading, setLoading] = useState(false);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchCollaborators();
        }
    }, [isOpen, templateId]);

    const fetchCollaborators = async () => {
        const { data } = await supabase
            .from('collaborators')
            .select('*')
            .eq('template_id', templateId);

        if (data) setCollaborators(data);
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Check if already invited
            if (collaborators.some(c => c.user_email === email)) {
                throw new Error('Este usuario ya es colaborador.');
            }

            const { error } = await supabase
                .from('collaborators')
                .insert([{
                    template_id: templateId,
                    user_email: email,
                    role: role
                }]);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Invitación enviada correctamente.' });
            setEmail('');
            fetchCollaborators();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al invitar usuario.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        const { error } = await supabase
            .from('collaborators')
            .delete()
            .eq('id', id);

        if (!error) {
            setCollaborators(collaborators.filter(c => c.id !== id));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-brand-dark">Compartir Plantilla</h3>
                        <p className="text-sm text-slate-500 truncate max-w-[200px]">{templateName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Invite Form */}
                    <form onSubmit={handleInvite} className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Invitar por correo</label>
                        <div className="flex gap-2 mb-3">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm"
                                    required
                                />
                            </div>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                            >
                                <option value="viewer">Lector</option>
                                <option value="editor">Editor</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-2.5 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            {loading ? 'Enviando...' : 'Enviar Invitación'}
                        </button>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-3 p-3 rounded-xl text-xs font-medium text-center ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </form>

                    {/* Collaborators List */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            Personas con acceso
                        </h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                            {collaborators.length === 0 ? (
                                <p className="text-sm text-slate-400 italic text-center py-4">
                                    Aún no has compartido esta plantilla.
                                </p>
                            ) : (
                                collaborators.map((collaborator) => (
                                    <div key={collaborator.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400 font-bold text-xs">
                                                {collaborator.user_email[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">
                                                    {collaborator.user_email}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    {collaborator.role === 'editor' ? (
                                                        <ShieldAlert className="w-3 h-3" />
                                                    ) : (
                                                        <Shield className="w-3 h-3" />
                                                    )}
                                                    {collaborator.role === 'editor' ? 'Puede editar' : 'Solo lectura'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(collaborator.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Quitar acceso"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
