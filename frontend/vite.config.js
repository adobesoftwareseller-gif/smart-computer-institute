import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // NEXT_PUBLIC_ is allowed too, so an existing NEXT_PUBLIC_API_URL on Vercel keeps working.
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    server: { port: 5173 },
});
