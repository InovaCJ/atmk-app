// kubb.config.ts
import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'
import * as dotenv from 'dotenv'

// Load .env variables
dotenv.config()

export default defineConfig(() => {
    const API_URL = process.env.VITE_API_URL
    const OPENAPI_JSON = process.env.VITE_OPENAPI_JSON || `${API_URL}/docs/json`

    return {
        root: '.',
        input: {
            path: OPENAPI_JSON,
        },
        output: {
            clean: true,
            path: './src/http/generated',
        },
        plugins: [
            pluginTs(),
            pluginOas(),
            pluginClient({
                baseURL: API_URL,
            }),
            pluginReactQuery({
                client: {
                    baseURL: API_URL,
                },
            }),
        ],
    }
})
