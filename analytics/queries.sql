-- =========================================================
-- Shopify-Grade Analytics Queries for ClickHouse
-- =========================================================

-- 1. Full Conversion Funnel (Sessions -> PDP Views -> Add To Cart -> Checkout -> Purchase)
SELECT
    count(DISTINCT session_id) AS total_sessions,
    count(DISTINCT if(event_type = 'view_item', session_id, NULL)) AS product_viewers,
    count(DISTINCT if(event_type = 'add_to_cart', session_id, NULL)) AS cart_adders,
    count(DISTINCT if(event_type = 'checkout_step', session_id, NULL)) AS checkout_reached,
    count(DISTINCT if(event_type = 'purchase', session_id, NULL)) AS buyers,
    
    -- Step-by-step conversion drop-off rates
    round(product_viewers / total_sessions * 100, 2) AS session_to_view_rate,
    round(cart_adders / product_viewers * 100, 2) AS view_to_cart_rate,
    round(checkout_reached / cart_adders * 100, 2) AS cart_to_checkout_rate,
    round(buyers / checkout_reached * 100, 2) AS checkout_to_purchase_rate,
    round(buyers / total_sessions * 100, 2) AS overall_conversion_rate
FROM analytics.events
WHERE event_time >= now() - INTERVAL 30 DAY;

-- 2. Acquisition Attribution (First-touch vs Last-touch UTM Performance)
SELECT
    if(utm_source = '', 'Direct / None', utm_source) AS acquisition_source,
    if(utm_campaign = '', '(not set)', utm_campaign) AS campaign,
    count(DISTINCT session_id) AS sessions,
    count(DISTINCT if(event_type = 'purchase', order_id, NULL)) AS orders,
    sum(if(event_type = 'purchase', price, 0)) AS total_revenue,
    round(orders / sessions * 100, 2) AS conversion_rate,
    round(total_revenue / nullif(orders, 0), 2) AS aov -- Average Order Value
FROM analytics.events
WHERE event_time >= now() - INTERVAL 30 DAY
GROUP BY acquisition_source, campaign
ORDER BY total_revenue DESC;

-- 3. Category & Scent Family Performance Breakdown
SELECT
    category,
    JSONExtractString(properties, 'scent_family') AS scent_family,
    count(DISTINCT if(event_type = 'view_item', event_id, NULL)) AS views,
    count(DISTINCT if(event_type = 'add_to_cart', event_id, NULL)) AS cart_adds,
    count(DISTINCT if(event_type = 'purchase', event_id, NULL)) AS purchases,
    sum(if(event_type = 'purchase', price, 0)) AS revenue
FROM analytics.events
WHERE event_time >= now() - INTERVAL 30 DAY AND category IS NOT NULL
GROUP BY category, scent_family
ORDER BY revenue DESC;

-- 4. Live Stream View (Active Visitors in last 10 minutes)
SELECT
    geo_country,
    count(DISTINCT session_id) AS active_visitors,
    sum(current_cart_val) AS active_cart_value
FROM analytics.live_visitors
WHERE last_active >= now() - INTERVAL 10 MINUTE
GROUP BY geo_country
ORDER BY active_visitors DESC;
