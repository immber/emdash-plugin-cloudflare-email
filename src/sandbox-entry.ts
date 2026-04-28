import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";

interface DeliverEvent {
  message: { to: string; subject: string; text: string; html?: string };
  source: string;
}

function buildMimeMessage(from: string, to: string, subject: string, text: string, html?: string): string {
  const boundary = `----=_Part_${Date.now()}`;
  const lines: string[] = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
  ];

  if (html) {
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`, ``);
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: text/plain; charset=UTF-8`, ``, text, ``);
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: text/html; charset=UTF-8`, ``, html, ``);
    lines.push(`--${boundary}--`);
  } else {
    lines.push(`Content-Type: text/plain; charset=UTF-8`, ``, text);
  }

  return lines.join("\r\n");
}

export default definePlugin({
  hooks: {
    "email:deliver": {
      exclusive: true,
      handler: async (event: DeliverEvent, ctx: PluginContext) => {
        const from = await ctx.kv.get<string>("settings:from");
        if (!from) {
          throw new Error(
            "From address not configured. Set it in the Cloudflare Email plugin settings."
          );
        }

        const { env } = await import("cloudflare:workers");
        const binding = (env as Env).SEND_EMAIL as SendEmail | undefined;

        if (!binding) {
          throw new Error(
            "SEND_EMAIL binding not found. Ensure send_email is configured in wrangler.jsonc."
          );
        }

        const { message } = event;
        const { EmailMessage } = await import("cloudflare:email");

        const raw = buildMimeMessage(from, message.to, message.subject, message.text, message.html);
        const emailMessage = new EmailMessage(from, message.to, raw);
        await binding.send(emailMessage);
      },
    },
  },

  routes: {
    admin: {
      handler: async (routeCtx: any, ctx: PluginContext) => {
        const interaction = routeCtx.input as {
          type: string;
          action_id?: string;
          values?: Record<string, string>;
        };

        if (interaction.type === "form_submit" && interaction.action_id === "save_settings") {
          const from = interaction.values?.from ?? "";
          await ctx.kv.set("settings:from", from);
          return {
            blocks: [
              { type: "header", text: "Cloudflare Email Settings" },
              {
                type: "form",
                block_id: "settings",
                fields: [
                  {
                    type: "text_input",
                    action_id: "from",
                    label: "From address",
                    initial_value: from,
                  },
                ],
                submit: { label: "Save", action_id: "save_settings" },
              },
            ],
            toast: { message: "Settings saved", type: "success" },
          };
        }

        // page_load and any other interaction — render the form
        const from = await ctx.kv.get<string>("settings:from") ?? "";
        return {
          blocks: [
            { type: "header", text: "Cloudflare Email Settings" },
            {
              type: "context",
              text: "Must be a verified address or domain in Cloudflare Email Routing.",
            },
            {
              type: "form",
              block_id: "settings",
              fields: [
                {
                  type: "text_input",
                  action_id: "from",
                  label: "From address",
                  initial_value: from,
                },
              ],
              submit: { label: "Save", action_id: "save_settings" },
            },
          ],
        };
      },
    },
  },
});
