import type { PluginDescriptor } from "emdash";

export function cloudflareEmailPlugin(): PluginDescriptor {
  return {
    id: "cloudflare-email",
    version: "0.1.0",
    format: "standard",
    entrypoint: "emdash-plugin-cloudflare-email/sandbox",
    options: {},
    capabilities: ["email:provide"],
    adminPages: [{ path: "/settings", label: "Cloudflare Email Settings", icon: "settings" }],
  };
}
