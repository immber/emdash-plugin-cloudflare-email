# @coastweb/emdash-plugin-cloudflare-email

An [EmDash CMS](https://docs.emdashcms.com/introduction/) plugin that adds email sending through [Cloudflare Email Service](https://developers.cloudflare.com/email-service/) as an email provider.

## Requirements

**Cloudflare Workers only.** This plugin uses Cloudflare's `cloudflare:email` runtime API, which is only available on Cloudflare Workers. This plugin will not work on Node.js deployments.

You must have [Cloudflare Email Service](https://developers.cloudflare.com/email-service/) (available in public beta) enabled on the same Cloudflare account where you are deploying your emdash worker.  You will need to configure a sending domain in Cloudflare before you can use this plugin.

## Installation

```bash
npm install @coastweb/emdash-plugin-cloudflare-email
```

### 1. Add the `SEND_EMAIL` binding in `wrangler.jsonc` on your emdashcms worker

```jsonc
{
  "send_email": [
    {
      "name": "SEND_EMAIL"
    }
  ]
}
```

### 2. Register the plugin in `astro.config.mjs`

```js
import { cloudflareEmailPlugin } from "@coastweb/emdash-plugin-cloudflare-email";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [cloudflareEmailPlugin()],
      // ...
    }),
  ],
});
```

The plugin must be in `plugins: []` (trusted mode), not `sandboxed: []`, because it requires access to the `SEND_EMAIL` Cloudflare binding.

### 3. Set the from address

After deploying, go to your EmDash admin and navigate to **Plugins → Cloudflare Email → Settings**. Enter a sender from address — this must be an address for a domain you have already configured in Cloudflare Email Service.

## How it works

This plugin registers as the `email:deliver` transport for EmDash's email pipeline. When another plugin (such as a forms plugin) calls `ctx.email.send()`, this plugin handles delivery by:

1. Reading the configured `from` address from plugin settings
2. Building a MIME message (plain text, or multipart `text/plain` + `text/html` if HTML is provided)
3. Sending via the Cloudflare `SEND_EMAIL` Workers binding

## License

MIT
