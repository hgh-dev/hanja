import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import tailwindcss from '@tailwindcss/vite';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({base:'/hanja/',plugins:[react(),legacy({targets:["Chrome >= 64", "Safari >= 12"],modernPolyfills:true}),tailwindcss(),VitePWA({injectRegister:null,registerType:'prompt',manifest:{name:'설아의 한자 공부',short_name:'설아의 한자',lang:'ko',theme_color:'#437c60',background_color:'#faf8f2',display:'standalone',icons:[{src:'/hanja/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},{src:'/hanja/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/hanja/icon-512.png',sizes:'512x512',type:'image/png'}]},workbox:{globPatterns:['**/*.{js,css,html,json,svg,png,txt}']}})]});
