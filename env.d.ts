/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@amap/amap-jsapi-loader' {
  interface AMapLoaderOptions {
    key: string
    version: string
    plugins?: string[]
    AMapUI?: {
      version?: string
      plugins?: string[]
    }
    Loca?: {
      version?: string
    }
  }
  
  function load(options: AMapLoaderOptions): Promise<any>
  export default load
}