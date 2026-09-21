import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Medusa v2 Event Subscriber
 * Automatically triggers the Python AI microservice whenever a luxury product
 * is created or updated in the Medusa Admin Dashboard.
 */
export default async function productAiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(`[AI Sync Subscriber] Product upsert event received for ID: ${data.id}`)

  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000"

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "description", "metadata", "categories.*"],
      filters: { id: data.id },
    })

    const product = products[0]
    if (!product) {
      logger.warn(`[AI Sync Subscriber] Product ${data.id} not found in query graph.`)
      return
    }

    const payload = {
      product_id: product.id,
      title: product.title,
      category: product.categories?.[0]?.name || "general",
      description: product.description || "",
      scent_notes: product.metadata?.scent_notes || null,
      materials: product.metadata?.materials || null,
      occasion: product.metadata?.occasion || "versatile",
      metadata: product.metadata || {},
    }

    // Dispatch non-blocking call to FastAPI AI microservice
    fetch(`${aiServiceUrl}/api/v1/embed-product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          logger.warn(`[AI Sync Subscriber] AI service returned status: ${res.status}`)
        } else {
          logger.info(`[AI Sync Subscriber] Product ${data.id} successfully queued for AI vector embedding.`)
        }
      })
      .catch((err) => {
        logger.debug(`[AI Sync Subscriber] AI service not reachable: ${err.message}`)
      })
  } catch (error: any) {
    logger.error(`[AI Sync Subscriber] Error synchronizing product: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
}
