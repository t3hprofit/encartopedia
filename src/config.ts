// App-level configuration.

/** Google Analytics 4 measurement ID (G-XXXXXXXXXX).
 *  Leave empty to disable analytics entirely — every tracking call becomes a
 *  no-op. Can also be supplied at build time via VITE_GA_ID. */
export const GA_MEASUREMENT_ID: string = import.meta.env.VITE_GA_ID ?? 'G-DN1FP2LK0Z'
