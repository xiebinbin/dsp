import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import UnoCSS from 'unocss/vite'
import {presetUno, presetWind, presetIcons} from "unocss"
// https://vitejs.dev/config/
import path from 'path'

export default defineConfig({
    plugins: [

        react(),
        UnoCSS({
            presets: [
                presetUno(),
                presetWind(),
                presetIcons(),
            ],
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return id.toString().split("node_modules/.pnpm/")[1].split("/")[0].toString();
                    }
                }
            }
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            web3: path.resolve(__dirname, './node_modules/web3/dist/web3.min.js')
        }
    },
    server: {
        proxy: {
            "/api": {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
            }
        },
    },
})
