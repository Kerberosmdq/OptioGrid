import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutGrid, Zap, Share2 } from 'lucide-react';
import { Logo } from './Logo';

export function Landing() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-blue/20 selection:text-brand-blue overflow-hidden dark:bg-slate-900 dark:text-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50 dark:bg-slate-900/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Logo size="md" lightMode={true} />
                    <div className="flex items-center gap-4">
                        <Link
                            to="/auth"
                            className="text-sm font-bold text-slate-600 hover:text-brand-blue transition-colors dark:text-slate-300 dark:hover:text-brand-blue"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/auth"
                            className="px-5 py-2.5 bg-brand-dark text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:scale-105 dark:bg-brand-blue dark:hover:bg-blue-600"
                        >
                            Comenzar Gratis
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent dark:from-blue-900/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-100/50 via-transparent to-transparent dark:from-purple-900/20" />

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-brand-blue font-bold text-sm mb-6 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                            🚀 La forma inteligente de comparar
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-brand-dark tracking-tight mb-8 leading-tight dark:text-white">
                            Toma mejores decisiones <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-600">
                                sin el caos de pestañas.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed dark:text-slate-400">
                            Organiza tus opciones de compra, compara características lado a lado y comparte tus hallazgos con amigos y familia. Todo en un solo lugar.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/auth"
                                className="w-full sm:w-auto px-8 py-4 bg-brand-blue text-white font-bold text-lg rounded-2xl hover:bg-blue-600 shadow-xl shadow-blue-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                Empezar Ahora
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="#features"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-center dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                            >
                                Saber más
                            </a>
                        </div>
                    </motion.div>

                    {/* Hero Image / Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-20 relative mx-auto max-w-5xl"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-brand-blue to-purple-600 rounded-[2.5rem] opacity-20 blur-2xl" />
                        <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                            <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2 dark:bg-slate-900 dark:border-slate-800">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="aspect-video bg-slate-50 p-8 grid grid-cols-3 gap-6 dark:bg-slate-900/50">
                                {/* Mock UI Cards */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 dark:bg-slate-800 dark:border-slate-700">
                                        <div className="aspect-square bg-slate-100 rounded-xl dark:bg-slate-700" />
                                        <div className="h-4 bg-slate-100 rounded w-3/4 dark:bg-slate-700" />
                                        <div className="h-4 bg-slate-100 rounded w-1/2 dark:bg-slate-700" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4 dark:text-white">
                            Todo lo que necesitas para decidir
                        </h2>
                        <p className="text-slate-500 text-lg dark:text-slate-400">Potente, simple y colaborativo.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<LayoutGrid className="w-6 h-6 text-brand-blue" />}
                            title="Organización Visual"
                            description="Olvídate de las hojas de cálculo aburridas. Visualiza tus opciones como tarjetas interactivas."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-yellow-500" />}
                            title="Extracción Mágica"
                            description="Pega un enlace y nosotros extraemos la información clave (precio, imagen, nombre) automáticamente."
                        />
                        <FeatureCard
                            icon={<Share2 className="w-6 h-6 text-purple-500" />}
                            title="Colaboración Real"
                            description="Invita a amigos o familiares a ver y editar tus comparativas. Decidan juntos."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto bg-brand-dark rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden dark:bg-slate-800">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/20 via-transparent to-transparent" />

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            ¿Listo para organizar tus ideas?
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                            Únete a OptioGrid hoy y transforma la manera en que tomas decisiones de compra. Es gratis.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white font-bold text-lg rounded-2xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                        >
                            Crear mi cuenta gratis
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12 dark:bg-slate-900 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex justify-center mb-6">
                        <Logo size="sm" lightMode={true} />
                    </div>
                    <p className="text-slate-400 text-sm">
                        © 2024 OptioGrid. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:bg-slate-800 dark:border-slate-700">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 dark:bg-slate-700">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-3 dark:text-white">{title}</h3>
            <p className="text-slate-500 leading-relaxed dark:text-slate-400">{description}</p>
        </div>
    );
}
