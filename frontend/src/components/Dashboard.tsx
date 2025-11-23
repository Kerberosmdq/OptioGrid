import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Template } from '../types';
import { Plus, Search, LayoutGrid, LogOut, Trash2, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { ConfirmModal } from './ConfirmModal';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';

export function Dashboard() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [sharedTemplates, setSharedTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [creating, setCreating] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Delete Modal State
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        checkUser();
        fetchTemplates();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/auth');
        } else {
            setUserEmail(user.email || null);
        }
    };

    const fetchTemplates = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all templates visible to user (owned + shared)
        const { data: allData, error: allError } = await supabase
            .from('templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (allError) {
            console.error('Error fetching templates:', allError);
            toast.error('Error al cargar las plantillas');
        } else if (allData) {
            const owned = allData.filter(t => t.owner_id === user.id);
            // For shared, we want templates where owner_id is NOT user.id
            // The RLS policy ensures we only see shared ones if we are collaborators
            const shared = allData.filter(t => t.owner_id !== user.id);

            setTemplates(owned);
            setSharedTemplates(shared);
        }

        setLoading(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTemplateName.trim()) return;

        setCreating(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('templates')
                .insert([{
                    name: newTemplateName,
                    owner_id: user.id,
                    fields: []
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating template:', error);
                toast.error('Error al crear la plantilla');
            } else if (data) {
                setTemplates([data, ...templates]);
                setShowCreateModal(false);
                setNewTemplateName('');
                toast.success('Plantilla creada exitosamente');
                navigate(`/template/${data.id}`);
            }
        }
        setCreating(false);
    };

    const confirmDeleteTemplate = (e: React.MouseEvent, templateId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setTemplateToDelete(templateId);
        setShowDeleteModal(true);
    };

    const handleDeleteTemplate = async () => {
        if (!templateToDelete) return;

        const { error } = await supabase
            .from('templates')
            .delete()
            .eq('id', templateToDelete);

        if (error) {
            console.error('Error deleting template:', error);
            toast.error('Error al eliminar la plantilla');
        } else {
            setTemplates(templates.filter(t => t.id !== templateToDelete));
            toast.success('Plantilla eliminada');
        }
        setTemplateToDelete(null);
        setShowDeleteModal(false);
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSharedTemplates = sharedTemplates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-blue/20 selection:text-brand-blue dark:bg-slate-900 dark:text-slate-100">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50 dark:bg-slate-900/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo size="sm" lightMode={true} />
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <span className="text-sm font-medium text-slate-500 hidden sm:block dark:text-slate-400">
                            {userEmail}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-brand-dark mb-2 tracking-tight dark:text-white">Mis Plantillas</h1>
                        <p className="text-slate-500 text-lg dark:text-slate-400">Gestiona y organiza tus comparativas.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Nueva Plantilla
                        </button>
                    </div>
                </div>

                {/* Templates Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse dark:bg-slate-800" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* My Templates */}
                        {filteredTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTemplates.map((template) => (
                                    <Link
                                        key={template.id}
                                        to={`/template/${template.id}`}
                                        className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden card-hover dark:bg-slate-800 dark:border-slate-700"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={(e) => confirmDeleteTemplate(e, template.id)}
                                                className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm border border-slate-100 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-blue-50 text-brand-blue rounded-2xl group-hover:scale-110 transition-transform duration-300 dark:bg-blue-900/30 dark:text-blue-400">
                                                <LayoutGrid className="w-6 h-6" />
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-blue transition-colors dark:text-white dark:group-hover:text-blue-400">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Creada el {new Date(template.created_at).toLocaleDateString()}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 dark:bg-slate-800 dark:border-slate-700">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-slate-700">
                                    <LayoutGrid className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">No tienes plantillas</h3>
                                <p className="text-slate-500 mb-6 dark:text-slate-400">Crea tu primera plantilla para comenzar a comparar.</p>
                            </div>
                        )}

                        {/* Shared Templates */}
                        {filteredSharedTemplates.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl dark:bg-purple-900/30 dark:text-purple-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-brand-dark dark:text-white">Compartidas conmigo</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSharedTemplates.map((template) => (
                                        <Link
                                            key={template.id}
                                            to={`/template/${template.id}`}
                                            className="group bg-white rounded-3xl p-6 border border-purple-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden dark:bg-slate-800 dark:border-slate-700"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 dark:bg-purple-900/30 dark:text-purple-400">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-wider dark:bg-slate-700 dark:text-slate-400">
                                                    Compartido
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors dark:text-white dark:group-hover:text-purple-400">
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Propiedad de otro usuario
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative dark:bg-slate-800"
                        >
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors dark:hover:bg-slate-700"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>

                            <h2 className="text-2xl font-bold text-brand-dark mb-6 dark:text-white">Nueva Plantilla</h2>
                            <form onSubmit={handleCreateTemplate}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300">
                                        Nombre de la plantilla
                                    </label>
                                    <input
                                        type="text"
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value)}
                                        placeholder="Ej: Laptops Gaming, Zapatillas..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newTemplateName.trim() || creating}
                                        className="flex-1 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        {creating ? 'Creando...' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteTemplate}
                title="¿Eliminar plantilla?"
                message="Esta acción no se puede deshacer. Se eliminarán todos los artículos guardados en esta plantilla."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </div>
    );
}
