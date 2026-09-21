import { NextRequest, NextResponse } from "next/server"

/**
 * Shopify-Grade Telemetry Ingestion Route (Next.js App Router)
 * Ingests client-side events (page_view, view_item, add_to_cart, checkout_step, purchase)
 * and forwards them to ClickHouse or a queue.
 */
export async function POST(req: NextRequest) {
  try {
    const event = await req.json()

    // Enrich event with server-side network headers
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || ""
    const country = req.headers.get("x-vercel-ip-country") || "US"

    const enrichedEvent = {
      ...event,
      ip: clientIp,
      browser_ua: userAgent,
      geo_country: event.geo_country || country,
      received_at: new Date().toISOString(),
    }

    const clickhouseUrl = process.env.CLICKHOUSE_URL || "http://localhost:8123"

    // If ClickHouse is reachable, stream directly to ClickHouse HTTP interface
    // In production, buffer through Redis / Kafka for high-throughput resilience
    if (process.env.CLICKHOUSE_ENABLED === "true") {
      fetch(`${clickhouseUrl}/?query=INSERT+INTO+analytics.events+FORMAT+JSONEachRow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrichedEvent),
      }).catch((err) => {
        console.debug("[Analytics Ingestion] ClickHouse batch queue fallback:", err.message)
      })
    } else {
      // In development mode, log the structured event
      console.log(`[Telemetry Ingested] ${enrichedEvent.event_type} (${enrichedEvent.session_id})`)
    }

    return NextResponse.json({ status: "success", ingested: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 400 }
    )
  }
}
