import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { provisionCatalogLink } from "@/lib/personalized-catalog-provision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * INACTIVE UNTIL: migration and SC_LINK_* secrets exist in a reviewed
 * environment. Intended for the DataCrazy HTTP automation block only.
 * Never place SC_LINK_ISSUER_SECRET in a browser, URL or CRM lead field.
 */
export async function POST(request: NextRequest) {
  const noStore = { "Cache-Control": "no-store" };
  const secret = process.env.SC_LINK_ISSUER_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503, headers: noStore });
  }
  const presented = request.headers.get("authorization")?.replace(/^Bearer /i, "") ?? "";
  const provided = Buffer.from(presented);
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "JSON required" }, { status: 415, headers: noStore });
  }
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore });
    }
    const leadId = (body as Record<string, unknown>).crmLeadId;
    if (typeof leadId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(leadId)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400, headers: noStore });
    }
    const url = await provisionCatalogLink(leadId);
    return NextResponse.json({ url }, { status: 200, headers: noStore });
  } catch {
    // Do not expose stack traces, CRM identifiers or database details.
    return NextResponse.json({ error: "Unable to provision link" }, { status: 503, headers: noStore });
  }
}
