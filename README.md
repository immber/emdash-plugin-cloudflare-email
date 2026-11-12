# @coastweb/emdash-plugin-cloudflare-email

An [EmDash CMS](https://docs.emdashcms.com/introduction/) plugin that adds email sending through [Cloudflare Email Service](https://developers.cloudflare.com/email-service/) as an email provider.

## Requirements

**Cloudflare Workers only.** This plugin uses Cloudflare's `cloudflare:email` runtime API, which is only available on Cloudflare Workers. This plugin will not work on Node.js deployments.

You must have [Cloudflare Email Service](https://developers.cloudflare.com/email-service/) (available in public beta) enabled on the same Cloudflare account where you are deploying your emdash worker.  You will need to configure a sending domain in Cloudflare before you can use this plugin.

## Version compatibility

| Plugin version | EmDash version | Notes |
| --- | --- | --- |
| `0.2.x` | `1.5.0` and later | Tested on EmDash 1.5.0. The sandbox entry is a plain `{ hooks, routes }` object (`satisfies SandboxedPlugin`). EmDash 1.x rejects `definePlugin()` without an `id`, so `0.1.x` fails on 1.x with `definePlugin() requires id (got undefined)`. |
| `0.1.x` | `0.8.x` | Uses `definePlugin()`. Last release for EmDash 0.x. |

Upgrading EmDash from 0.x to 1.x? Upgrade this plugin to `0.2.0` at the same time. Versions of EmDash between `0.8` and `1.5` have not been tested with either release.

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
