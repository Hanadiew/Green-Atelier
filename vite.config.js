import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],

  server: {
    /*
     * Bind every interface, not just the IPv6 loopback.
     *
     * By default this dev server ended up listening on [::1]:5173 alone, with
     * nothing on 127.0.0.1:5173. Most of the time that is invisible, because a
     * browser resolving "localhost" tries IPv6 first and succeeds.
     *
     * It stops being invisible when Stripe redirects back to
     * localhost:5173/payment-success after checkout. That navigation comes from
     * an external origin, and Chrome can resolve localhost to 127.0.0.1 for it
     * — where nothing was listening, so the buyer landed on
     * ERR_CONNECTION_REFUSED holding a completed payment.
     *
     * `host: true` listens on both stacks, so localhost answers whichever
     * address is picked.
     */
    host: true,

    /*
     * Never silently move to 5174 if 5173 is taken. STRIPE's SITE_URL secret
     * names the port explicitly, so a shifted port sends every post-checkout
     * redirect to a dead address — the same failure, with a harder cause to
     * spot. Failing to start is the louder and better outcome.
     */
    port: 5173,
    strictPort: true,
  },
})
