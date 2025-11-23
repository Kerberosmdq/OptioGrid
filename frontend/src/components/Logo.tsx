import { motion } from 'framer-motion';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    lightMode?: boolean;
}

export function Logo({ size = 'md', showText = true, lightMode = false }: LogoProps) {
    // Size configurations
    const sizes = {
        sm: {
            container: 'gap-0.5',
            square: 'w-1.5 h-1.5 rounded-[1px]',
            text: 'text-xl',
            gap: 'gap-2'
        },
        md: {
            container: 'gap-1',
            square: 'w-2.5 h-2.5 rounded-sm',
            text: 'text-2xl',
            gap: 'gap-3'
        },
        lg: {
            container: 'gap-1.5',
            square: 'w-4 h-4 rounded-md',
            text: 'text-4xl',
            gap: 'gap-4'
        }
    };

    const config = sizes[size];

    // Grid configuration: 1 = dark, 2 = blue (top right)
    const grid = [
        1, 1, 2,
        1, 1, 1,
        1, 1, 1
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1 }
    };

    return (
        <div className={`flex items-center ${config.gap}`}>
            <motion.div
                className={`grid grid-cols-3 ${config.container}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {grid.map((type, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className={`${config.square} ${type === 2
                            ? 'bg-[#0066FF]' // Bright blue
                            : lightMode ? 'bg-slate-200 dark:bg-slate-700' : 'bg-[#1A1F2C]' // Dark slate or light gray
                            }`}
                        animate={type === 2 ? {
                            scale: [1, 1.1, 1],
                            opacity: [1, 0.8, 1]
                        } : {}}
                        transition={type === 2 ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        } : {}}
                    />
                ))}
            </motion.div>

            {showText && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`font-bold tracking-tight ${config.text} ${lightMode ? 'text-slate-900 dark:text-white' : 'text-white'
                        }`}
                >
                    OptioGrid
                </motion.span>
            )}
        </div>
    );
}
