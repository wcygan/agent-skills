window.systemCases = {
  shortener: {
    title: "URL shortener",
    question: "Make the common read cheap.",
    intro:
      "A read-heavy mapping service: create a durable short code, then redirect through a cache.",
    scope:
      "Immutable destinations; optional expiration. Custom aliases, abuse review, and analytics are separate extensions.",
    nodes: [
      ["Browser", "GET /a7K", "service", "processing"],
      ["Redirect API", "validate expiry", "service", "processing"],
      ["Mapping cache", "code \u2192 URL", "cache", "storage"],
      ["Create API", "POST /links", "service", "processing"],
      ["Mapping store", "unique(code), expires_at", "database", "storage"],
      ["302 response", "Location: target URL", "document", "flow"],
    ],
    edges: [
      ["read", 0, 1, "resolve code"],
      ["cache", 1, 2, "lookup"],
      ["miss", 1, 4, "on miss: read"],
      ["create", 3, 4, "insert unique code"],
      ["redirect", 1, 5, "return 302 response"],
      ["fill", 4, 2, "API fills cache"],
    ],
    tradeoff: [
      "Fast reads vs. freshness",
      "Immutable mappings simplify caching. Editable destinations need invalidation or versioning; a TTL alone permits stale redirects.",
    ],
    scale: [
      "Illustrative load",
      "100M redirects/day \u2248 1,157/s average. At 10\u00d7 peak and 95% hits, about 579/s reach storage, excluding writes and retries.",
    ],
    interview: [
      "How do you allocate codes?",
      "Random base62 plus a unique constraint; shard by code when one store is insufficient. Guess-resistant codes need enough entropy.",
    ],
    sources: [],
    caption: "Create durable mappings; serve redirects through a cache.",
    architecture: [
      "The create API allocates a random code and inserts it under a unique constraint. On collision it retries. The redirect API checks the cache, falls back to the mapping store, and returns a 302 response for valid, unexpired links. The browser then requests the destination.",
      "The store is authoritative. Cache TTL must not exceed link expiry; cache misses are coalesced for hot codes. Creation requests can use an idempotency key so client retries return the same mapping.",
    ],
    bottlenecks: [
      [
        "Hot redirect keys",
        "One popular link can overload a cache shard.",
        "Replicate hot entries across cache nodes and add bounded local caches. Invalidate or version entries if destinations become editable.",
      ],
      [
        "Database miss storms",
        "Cache loss shifts read traffic onto the durable store.",
        "Limit fallback concurrency, coalesce misses, and shed excess load. Add read replicas only if their lag is acceptable; new links may need primary reads.",
      ],
      [
        "Mapping growth",
        "One database eventually hits storage or write limits.",
        "Partition by code hash; enforce uniqueness within the owning partition. Scale stateless API replicas independently.",
      ],
    ],
    brief: {
      stories: [
        "As a creator, I can submit a destination URL and receive a stable short link, optionally with an expiry.",
        "As a visitor, I can open a short link and reach its destination quickly.",
        "As a creator, I can inspect my link metadata; retries must not create unintended extra links.",
      ],
      api: [
        [
          "POST /links",
          "{url, expires_at?}; Idempotency-Key",
          "201 \u2192 {code, short_url, expires_at}",
        ],
        [
          "GET /{code}",
          "Short code",
          "302 + Location; 404 absent, 410 expired",
        ],
        [
          "GET /links/{code}",
          "Authenticated owner",
          "200 \u2192 link metadata; deny access to other owners",
        ],
      ],
      entities: [
        [
          "Link",
          "code (PK), owner_id, target_url, created_at, expires_at",
          "Immutable target; code uniqueness enforced by the owning shard.",
        ],
        [
          "CreateRequest",
          "(owner_id, idempotency_key), code, request_hash",
          "Same key and payload returns the original link; changed payload conflicts.",
        ],
        [
          "CachedMapping",
          "code, target_url, expires_at",
          "Derived entry; cache TTL never outlives link expiry.",
        ],
      ],
      numbers: [
        [
          "100M / day",
          "Redirects",
          "\u2248 1,157/s average; 10\u00d7 peak \u2248 11,574/s.",
        ],
        [
          "1M / day",
          "New links",
          "\u2248 12 writes/s average; reads dominate.",
        ],
        [
          "95%",
          "Assumed cache hit rate",
          "\u2248 579 database reads/s at peak, before retries.",
        ],
        [
          "365M links",
          "One year of retained creations",
          "At 500 bytes/link: \u2248 182.5 GB raw, before indexes and replicas.",
        ],
        [
          "<100 ms",
          "Target p99 redirect latency",
          "Measured at the redirect service; excludes loading the destination.",
        ],
      ],
      contract:
        "Public redirect reads; authenticated creation and metadata access. Rate limits and URL validation are required. Idempotency records need a documented retention window.",
    },
  },
  feed: {
    title: "News feed",
    question: "Move work away from the read path.",
    intro:
      "Build a chronological feed by materializing post IDs for ordinary authors, then merge high-fanout authors on read.",
    scope:
      "Follow graph, post visibility, and pagination are required. Ranking and media delivery are outside this diagram.",
    nodes: [
      ["Publish API", "POST /posts", "service", "processing"],
      ["Post store", "post + outbox transaction", "database", "storage"],
      ["Fanout queue", "post_id events", "queue", "flow"],
      ["Feed API", "merge, filter, paginate", "service", "processing"],
      ["Timeline store", "unique(user, post)", "database", "storage"],
      ["Fanout workers", "page through followers", "worker", "processing"],
    ],
    edges: [
      ["publish", 0, 1, "commit"],
      ["relay", 1, 2, "outbox relay"],
      ["consume", 2, 5, "deliver"],
      ["fanout", 5, 4, "append post IDs"],
      ["read", 3, 4, "read timeline"],
      ["pull", 3, 1, "pull large authors"],
    ],
    tradeoff: [
      "Write amplification vs. read cost",
      "Push makes reads cheap but multiplies writes. Pull avoids huge fanout but adds merging and fetching to every affected read.",
    ],
    scale: [
      "Illustrative amplification",
      "1,000 ordinary posts/s \u00d7 200 followers = 200,000 timeline inserts/s before batching, retries, or skew.",
    ],
    interview: [
      "What about deletes and unfollows?",
      "Treat timelines as candidate IDs. Enforce current permissions and tombstones when hydrating; asynchronous cleanup is an optimization.",
    ],
    sources: [
      [
        "Transactional outbox",
        "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html",
      ],
    ],
    caption:
      "Persist posts once; precompute ordinary feeds and merge large authors on read.",
    architecture: [
      "The publish API commits a post and an outbox event together. A relay sends committed events to the fanout queue. Workers page through the follow graph and write post IDs into follower timelines; a unique (user, post) key makes repeated deliveries harmless.",
      "The feed API merges materialized IDs with recent posts from high-fanout authors, orders them by (created_at, post_id), and uses a stable cursor. It hydrates content and rechecks current visibility. The follow graph, content hydration, and media delivery are omitted from the drawing.",
    ],
    bottlenecks: [
      [
        "Celebrity fanout",
        "A single post can cause millions of timeline writes.",
        "Use pull-on-read for high-fanout authors. Choose the threshold from write cost, reader activity, and latency; there is no universal follower cutoff.",
      ],
      [
        "Queue backlog",
        "Fanout falls behind during bursts, making feeds stale.",
        "Partition work, process resumable follower chunks, and autoscale workers using oldest-event age. Cap concurrency to protect the timeline store.",
      ],
      [
        "Timeline and read pressure",
        "Popular readers or large histories overload storage and merging.",
        "Shard timelines by user ID, bound retained IDs, batch hydration, and cache recent pages. Expire or invalidate cached visibility-sensitive results.",
      ],
    ],
    brief: {
      stories: [
        "As an author, I can publish a post and have followers discover it.",
        "As a reader, I can follow or unfollow authors and page through a chronological feed.",
        "As an author, I can delete a post; readers must not see content they no longer have permission to view.",
      ],
      api: [
        [
          "POST /posts",
          "{body, visibility}; Idempotency-Key",
          "201 \u2192 {post_id, created_at}",
        ],
        [
          "PUT /me/following/{author_id}",
          "Authenticated reader",
          "204; repeated follows are harmless",
        ],
        [
          "DELETE /me/following/{author_id}",
          "Authenticated reader",
          "204; current visibility applies on subsequent reads",
        ],
        [
          "GET /me/feed?cursor=\u2026&limit=\u2026",
          "Opaque cursor; capped page size",
          "200 \u2192 {items, next_cursor}",
        ],
        [
          "DELETE /posts/{post_id}",
          "Authenticated author",
          "204; tombstone filters reads before async cleanup",
        ],
      ],
      entities: [
        [
          "Post",
          "post_id (PK), author_id, body, visibility, created_at, deleted_at",
          "Authoritative content and access state.",
        ],
        [
          "Follow",
          "(follower_id, author_id) (PK)",
          "Index both reader subscriptions and author followers.",
        ],
        [
          "TimelineEntry",
          "(user_id, post_id) unique, created_at",
          "Derived candidate ID; ordered by (created_at, post_id).",
        ],
        [
          "OutboxEvent",
          "event_id (PK), post_id, type, published_at",
          "Committed with the post; relay and fanout tolerate duplicates.",
        ],
      ],
      numbers: [
        [
          "10M",
          "Daily active readers",
          "Illustrative audience; activity is uneven.",
        ],
        [
          "100K / s",
          "Peak feed reads",
          "At 20 IDs/page: up to 2M candidate IDs/s before caching.",
        ],
        [
          "1K / s",
          "Peak ordinary-author posts",
          "Assume 200 followers per post for fanout sizing.",
        ],
        [
          "200K / s",
          "Peak timeline inserts",
          "1,000 posts/s \u00d7 200 followers; excludes retries and large authors.",
        ],
        [
          "1,000 IDs",
          "Retained per active timeline",
          "10M timelines \u00d7 1,000 \u00d7 32 bytes \u2248 320 GB raw; excludes posts, indexes, and replicas.",
        ],
        [
          "<300 ms / <5 s",
          "Interview latency and freshness targets",
          "p99 feed response / normal-load fanout lag; outages can exceed the lag target.",
        ],
      ],
      contract:
        "Endpoints act as the authenticated user. Feed contents are eventually fresh, but permission and deletion checks run on hydration. Cursors encode chronological position, not a fixed snapshot.",
    },
  },
  analytics: {
    title: "Real-time analytics",
    question: "Separate event time from arrival time.",
    intro:
      "Count events per tenant in one-minute tumbling windows, while handling late arrivals and recoverable failures.",
    scope:
      "Events carry event_id, tenant_id, and event_time. Counts are provisional until the chosen lateness policy closes the window.",
    nodes: [
      ["Ingest API", "validate + acknowledge", "service", "processing"],
      ["Partitioned log", "key = tenant_id", "log", "flow"],
      ["Window operators", "[12:00, 12:01)", "worker", "processing"],
      ["Dashboard API", "read versioned counts", "service", "processing"],
      ["Aggregate store", "key = tenant + window", "database", "storage"],
      ["Checkpoint store", "offsets + operator state", "database", "storage"],
    ],
    edges: [
      ["append", 0, 1, "durable append"],
      ["process", 1, 2, "consume by key"],
      ["result", 2, 4, "upsert result version"],
      ["snapshot", 2, 5, "checkpoint"],
      ["query", 3, 4, "query"],
      ["restore", 5, 1, "restore + replay"],
    ],
    tradeoff: [
      "Freshness vs. completeness",
      "Short watermark delay produces faster provisional counts but more late corrections. Retaining windows longer consumes more state.",
    ],
    scale: [
      "Illustrative input rate",
      "100,000 events/s \u00d7 500 bytes = 50 MB/s raw input, or 4.32 TB/day before replication and compression. Hot tenants can dominate a partition.",
    ],
    interview: [
      "How do you split a hot key?",
      "For associative counts, salt the key, aggregate partial counts, and merge. Keep window boundaries and update versions consistent.",
    ],
    sources: [
      [
        "Flink windows",
        "https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/",
      ],
      [
        "Flink fault tolerance",
        "https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/",
      ],
    ],
    caption:
      "Retain events, aggregate by event time, and publish revisable counts.",
    architecture: [
      "The ingest API acknowledges a durable log append. Keyed operators count events in one-minute tumbling windows. Watermarks estimate event-time progress; this example permits corrections for 30 seconds after a window ends, then sends later events to reconciliation.",
      "Completed checkpoints retain source offsets and operator state for restore and replay. The sink must support checkpoint-coordinated transactions or repeat-safe, ordered result versions. Logical event deduplication by event_id is separate from replay-safe state. Dashboards distinguish provisional from final results.",
    ],
    bottlenecks: [
      [
        "Hot tenant keys",
        "A large tenant monopolizes one partition or operator.",
        "For associative counts, salt the key into partial aggregates and merge them. Align window boundaries and update versions; adding workers alone cannot split one hot key.",
      ],
      [
        "Window state growth",
        "Many keys and late events retain large state.",
        "Bound lateness and retention, expire closed windows, and repartition keyed state as parallelism grows. Shorter retention trades completeness for lower cost.",
      ],
      [
        "Slow sinks and recovery",
        "Output stalls propagate backpressure; long replay delays recovery.",
        "Batch writes and scale sink partitions first. Monitor consumer lag and checkpoint duration; retain enough log history for the recovery window.",
      ],
    ],
    brief: {
      stories: [
        "As a producer, I can submit timestamped events and retry a failed request without silently double-counting a logical event.",
        "As an analyst, I can query one-minute counts by tenant and distinguish provisional from final windows.",
        "As an operator, I can recover processing after a crash and inspect events that arrive too late.",
      ],
      api: [
        [
          "POST /v1/events:batch",
          "[{event_id, event_time, payload}]; tenant from auth",
          "202 after durable append \u2192 accepted IDs and per-event validation errors",
        ],
        [
          "GET /v1/counts?from=\u2026&to=\u2026",
          "Tenant-scoped range; one-minute granularity",
          "200 \u2192 [{window_start, count, version, final}]",
        ],
        [
          "GET /v1/late-events?cursor=\u2026",
          "Authorized operator; capped page size",
          "200 \u2192 late-event records for reconciliation",
        ],
      ],
      entities: [
        [
          "Event",
          "(tenant_id, event_id), event_time, payload",
          "Logical identity for deduplication; log offset is separate.",
        ],
        [
          "WindowCount",
          "(tenant_id, window_start) (PK), count, version, final",
          "A one-minute half-open window; corrections update its version.",
        ],
        [
          "Checkpoint",
          "checkpoint_id, source_offsets, state_reference",
          "Consistent recovery point, not a client-visible result.",
        ],
        [
          "LateEvent",
          "tenant_id, event_id, event_time, reason",
          "Outside online lateness policy; retained for offline reconciliation.",
        ],
      ],
      numbers: [
        [
          "100K / s",
          "Sustained event ingestion",
          "At 500 bytes/event: 50 MB/s raw input.",
        ],
        [
          "4.32 TB / day",
          "Raw event volume",
          "100,000 \u00d7 500 \u00d7 86,400 bytes; decimal units.",
        ],
        [
          "7 days",
          "Illustrative log retention",
          "\u2248 30.24 TB raw before replication and compression.",
        ],
        [
          "1 minute",
          "Tumbling window size",
          "Each accepted event belongs to one event-time interval.",
        ],
        [
          "30 seconds",
          "Allowed lateness after window end",
          "Older arrivals go to reconciliation; watermark delay is a separate setting.",
        ],
        [
          "<5 seconds",
          "Target provisional update delay",
          "After processing, under normal load; finality depends on watermark progress.",
        ],
      ],
      contract:
        "Authentication fixes tenant scope; clients cannot select another tenant in a payload. Bound batch sizes and query ranges. Deduplication retention must cover the supported retry/replay horizon; reject or reconcile older repeats.",
    },
  },
  scheduler: {
    title: "Distributed job scheduler",
    question: "Retry work without repeating its effect.",
    intro:
      "Persist schedules, dispatch due runs, and recover worker failures. Run identity stays stable across delivery attempts.",
    scope:
      "One-time and recurring jobs, bounded retries, status, and cancellation. Start time is best effort within a stated lateness SLO.",
    nodes: [
      ["Schedule API", "job + schedule", "service", "processing"],
      ["Job / run store", "runs + leases + outbox", "database", "storage"],
      ["Dispatcher", "claim due runs + relay", "service", "control"],
      ["Effect sink", "dedupe by run_id", "service", "storage"],
      ["Worker pool", "renew lease; execute", "worker", "processing"],
      ["Ready queue", "at-least-once delivery", "queue", "flow"],
    ],
    edges: [
      ["schedule", 0, 1, "persist"],
      ["claim", 2, 1, "claim + outbox txn"],
      ["enqueue", 2, 5, "publish run_id"],
      ["lease", 4, 1, "lease / fenced status"],
      ["deliver", 5, 4, "deliver attempt"],
      ["effect", 4, 3, "apply(run_id)"],
      ["retry", 4, 5, "retry after backoff"],
    ],
    tradeoff: [
      "Availability vs. duplicate effects",
      "At-least-once execution favors recovery. Stable run IDs, fenced state updates, and sink idempotency constrain repeated effects; they do not make arbitrary code execute once.",
    ],
    scale: [
      "Illustrative worker capacity",
      "10,000 jobs/s \u00d7 2 seconds = 20,000 concurrent executions. At 100 slots/worker, 200 workers is the steady-state floor before headroom.",
    ],
    interview: [
      "What do you monitor?",
      "Schedule-to-start lag, oldest ready item, lease expiry rate, retry budget, and failed runs. Partition scheduling by due-time bucket plus job hash.",
    ],
    sources: [
      [
        "Interview problem supplied by you",
        "https://www.geeksforgeeks.org/system-design/design-distributed-job-scheduler-system-design/",
      ],
      [
        "Transactional outbox",
        "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html",
      ],
    ],
    caption:
      "Persist run identity before dispatch; recover attempts with leases and safe effects.",
    architecture: [
      "The schedule API stores job definitions. Dispatchers claim indexed due jobs in bounded transactions, creating a unique (job_id, scheduled_at) run and an outbox intent. The relay publishes run_id to the ready queue; repeated delivery is expected.",
      "Workers claim runs with expiring leases and increasing attempt tokens. They renew leases, apply effects using the stable run_id, conditionally record success, then acknowledge delivery. Stale tokens cannot update run status. The effect sink must also deduplicate or fence requests; a lease cannot prevent a paused worker from resuming.",
      "Retry time and attempt count are durable. The retry arrow summarizes persisted backoff and redispatch; exhausted runs become terminal failures. Cancellation blocks new claims, while active work requires cooperative stopping and effect guards. Recurring schedules need explicit timezone, DST, missed-run, and overlap policies.",
    ],
    bottlenecks: [
      [
        "Due-job scans",
        "A single dispatcher or full-table scan falls behind.",
        "Index by due time and shard scheduling by time bucket plus job hash. Use bounded transactional claims and a unique run key across concurrent dispatchers.",
      ],
      [
        "Worker saturation",
        "Long jobs consume slots and delay short jobs.",
        "Separate queues by workload or priority, autoscale from schedule-to-start lag, and enforce tenant concurrency budgets. Downstream capacity still bounds safe execution.",
      ],
      [
        "Retry storms and lease writes",
        "Failures multiply queue traffic and metadata updates.",
        "Persist exponential backoff with jitter and a retry budget. Partition run state, tune lease renewals to failure-detection needs, and isolate repeatedly failing jobs.",
      ],
    ],
    brief: {
      stories: [
        "As a user, I can create a one-time or recurring job with a schedule and bounded retry policy.",
        "As a user, I can inspect each scheduled run, its attempts, and its final outcome.",
        "As a user, I can request cancellation; as an operator, I can recover failed workers without losing durable runs.",
      ],
      api: [
        [
          "POST /jobs",
          "{task, payload_ref, schedule, timezone, retry_policy}; Idempotency-Key",
          "201 \u2192 {job_id, next_run_at}",
        ],
        [
          "GET /jobs/{job_id}",
          "Authenticated owner",
          "200 \u2192 definition, schedule, cancellation state",
        ],
        [
          "GET /jobs/{job_id}/runs?cursor=\u2026",
          "Owner; bounded history page",
          "200 \u2192 {runs, next_cursor}",
        ],
        [
          "GET /runs/{run_id}",
          "Owner",
          "200 \u2192 status, attempts, result_ref, error",
        ],
        [
          "POST /jobs/{job_id}/cancel",
          "Owner; repeated requests safe",
          "202 \u2192 cancellation requested; active effects may already have occurred",
        ],
      ],
      entities: [
        [
          "Job",
          "job_id (PK), owner_id, task, payload_ref, schedule, timezone",
          "Definition includes overlap, missed-run, retry, and cancellation policies.",
        ],
        [
          "Run",
          "run_id (PK), unique(job_id, scheduled_at), status, retry_at",
          "Stable identity across all attempts; effect idempotency key.",
        ],
        [
          "Attempt",
          "(run_id, attempt_no), worker_id, lease_until, fencing_token",
          "Expired attempts cannot commit status with a stale token.",
        ],
        [
          "DispatchIntent",
          "intent_id (PK), run_id, due_at, published_at",
          "Transactional outbox row; publishing may repeat.",
        ],
        [
          "Result",
          "run_id (PK), result_ref, error, completed_at",
          "Metadata in the run store; large outputs live in external object storage.",
        ],
      ],
      numbers: [
        [
          "20M",
          "Registered schedules",
          "At 1 KB each: \u2248 20 GB raw definitions, before indexes and replicas.",
        ],
        [
          "10K / s",
          "Sustained run arrivals",
          "864M runs/day; history retention becomes a separate storage concern.",
        ],
        [
          "2 seconds",
          "Mean execution time",
          "10,000/s \u00d7 2 s = 20,000 concurrent executions.",
        ],
        [
          "200 workers",
          "Steady-state capacity floor",
          "100 concurrent slots each; add headroom for bursts, retries, and failures.",
        ],
        [
          "864 GB / day",
          "Illustrative run-history growth",
          "864M runs \u00d7 1 KB metadata; excludes attempt history, logs, and outputs.",
        ],
        [
          "<5 seconds",
          "Target p99 schedule-to-start lag",
          "Under normal load; priority, quotas, and downstream limits can delay starts.",
        ],
      ],
      contract:
        "All job and run reads are owner-scoped. Cancellation is a request, not rollback of completed effects. Worker leases and fencing are internal APIs; sink idempotency is required to constrain duplicate external effects.",
    },
  },
};
