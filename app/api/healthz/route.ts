import { NextResponse } from "next/server";
import { getAiRuntimeConfigWithIssues } from "lib/ai/config";

export const dynamic = "force-dynamic";

function maskValue(value: string): string {
  if (!value) {
    return "tidak diset";
  }
  if (value.length <= 8) {
    return "****";
  }
  const first4 = value.slice(0, 4);
  const last4 = value.slice(-4);
  const middle = "*".repeat(Math.max(0, value.length - 8));
  return `${first4}${middle}${last4}`;
}

function maskBaseUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return maskValue(baseUrl);
  }
}

export function GET() {
  const { config, issues } = getAiRuntimeConfigWithIssues();

  const response = {
    ok: true,
    timestamp: new Date().toISOString(),
    ai: {
      configured: !!config,
      provider: config ? config.provider : null,
      model: config ? config.model : null,
      baseUrlMasked: config ? maskBaseUrl(config.baseUrl) : null,
      hasApiKey: config ? !!config.apiKey : false,
      issues: issues,
    },
  };

  return NextResponse.json(response);
}
