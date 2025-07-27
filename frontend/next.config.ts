import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Optimisé pour Docker
  transpilePackages: ['cookies-next', '@iconify/react', 'react-toastify', 'framer-motion', 'lucide-react'], // Transpiler les dépendances problématiques
  experimental: {
    optimizeServerReact: false, // Désactiver l'optimisation côté serveur pour React
  },
};

export default nextConfig;
