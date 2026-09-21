-- =========================================================
-- Shopify-Grade Analytics OLAP Schema (ClickHouse)
-- =========================================================

CREATE DATABASE IF NOT EXISTS analytics;

USE analytics;

-- 1. Raw Telemetry Event Stream Table
CREATE TABLE IF NOT EXISTS events
(
    event_id        UUID DEFAULT generateUUIDv4(),
    store_id        LowCardinality(String) DEFAULT 'default_store',
    event_time      DateTime64(3, 'UTC') DEFAULT now64(3),
    event_type      LowCardinality(String), -- page_view, view_item, add_to_cart, checkout_step, purchase, search
    session_id      String,
    user_id         Nullable(String),
    anonymous_id    String,
    
    -- Client / Device Dimensions
    device_type     LowCardinality(String), -- mobile, desktop, tablet
    browser         LowCardinality(String),
    os              LowCardinality(String),
    geo_country     LowCardinality(String),
    geo_city        String,
    
    -- Acquisition & Marketing Attribution
    traffic_source  LowCardinality(String), -- direct, organic_search, cpc, social, referral, email
    utm_source      String DEFAULT '',
    utm_medium      String DEFAULT '',
    utm_campaign    String DEFAULT '',
    utm_content     String DEFAULT '',
    referrer        String DEFAULT '',
    page_path       String DEFAULT '',
    
    -- E-commerce Context
    product_id      Nullable(String),
    product_title   Nullable(String),
    category        Nullable(String), -- perfumes, purses, heels, watches
    variant_id      Nullable(String),
    price           Nullable(Decimal(12, 2)),
    quantity        Nullable(UInt32),
    cart_value      Nullable(Decimal(12, 2)),
    order_id        Nullable(String),
    currency_code   LowCardinality(String) DEFAULT 'USD',
    
    -- Extensible JSON metadata (scent notes, search queries, custom luxury attributes)
    properties      String DEFAULT '{}'
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_time)
ORDER BY (store_id, event_type, event_time, session_id);

-- 2. Daily E-commerce Funnel Aggregations (Pre-aggregated for sub-second Shopify dashboard charts)
CREATE TABLE IF NOT EXISTS daily_funnel_summary
(
    metric_date         Date,
    store_id            LowCardinality(String),
    traffic_source      LowCardinality(String),
    utm_source          String,
    category            LowCardinality(String),
    device_type         LowCardinality(String),
    
    total_sessions      UInt64,
    product_views       UInt64,
    add_to_carts        UInt64,
    checkouts_started   UInt64,
    orders_completed    UInt64,
    total_revenue       Decimal(14, 2)
)
ENGINE = SummingMergeTree()
ORDER BY (metric_date, store_id, traffic_source, utm_source, category, device_type);

-- 3. Live Active Visitors Table (Rolling buffer for Shopify Live View)
CREATE TABLE IF NOT EXISTS live_visitors
(
    session_id      String,
    store_id        LowCardinality(String),
    last_active     DateTime64(3, 'UTC'),
    page_path       String,
    geo_country     LowCardinality(String),
    current_cart_val Decimal(12, 2) DEFAULT 0.00
)
ENGINE = ReplacingMergeTree(last_active)
ORDER BY (store_id, session_id);
