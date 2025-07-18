/**
 * ADVANCED RATE LIMITING & DDOS PROTECTION - FASE 0 SECURITY FOUNDATION
 *
 * Token bucket algorithm con user-specific policies
 * DDoS protection avanzado y abuse pattern detection
 * Integration con circuit breakers para abuse patterns
 *
 * Arquitectura: Token Bucket + Sliding Window + Pattern Detection
 * Integración: Middleware pre-processing + Circuit Breaker integration
 */

const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

/**
 * TOKEN BUCKET IMPLEMENTATION
 */
class TokenBucket {
  constructor(capacity, refillRate, refillInterval = 1000) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.refillInterval = refillInterval;
    this.lastRefill = Date.now();
    this.id = uuidv4();
  }

  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor(
      (elapsed / this.refillInterval) * this.refillRate,
    );

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  consume(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  peek() {
    this.refill();
    return this.tokens;
  }

  getWaitTime(tokens = 1) {
    this.refill();

    if (this.tokens >= tokens) {
      return 0;
    }

    const tokensNeeded = tokens - this.tokens;
    return Math.ceil((tokensNeeded / this.refillRate) * this.refillInterval);
  }

  getInfo() {
    this.refill();
    return {
      id: this.id,
      capacity: this.capacity,
      tokens: this.tokens,
      refillRate: this.refillRate,
      utilization: ((this.capacity - this.tokens) / this.capacity) * 100,
    };
  }
}

/**
 * SLIDING WINDOW RATE LIMITER
 */
class SlidingWindowLimiter {
  constructor(windowSize = 60000, maxRequests = 100) {
    this.windowSize = windowSize; // in milliseconds
    this.maxRequests = maxRequests;
    this.requests = [];
    this.id = uuidv4();
  }

  cleanExpiredRequests() {
    const now = Date.now();
    const cutoff = now - this.windowSize;
    this.requests = this.requests.filter((timestamp) => timestamp > cutoff);
  }

  addRequest() {
    this.cleanExpiredRequests();
    this.requests.push(Date.now());
    return this.requests.length <= this.maxRequests;
  }

  getCurrentCount() {
    this.cleanExpiredRequests();
    return this.requests.length;
  }

  getResetTime() {
    if (this.requests.length === 0) {
      return 0;
    }

    const oldestRequest = Math.min(...this.requests);
    return oldestRequest + this.windowSize - Date.now();
  }

  getInfo() {
    this.cleanExpiredRequests();
    return {
      id: this.id,
      windowSize: this.windowSize,
      maxRequests: this.maxRequests,
      currentRequests: this.requests.length,
      utilization: (this.requests.length / this.maxRequests) * 100,
      resetIn: this.getResetTime(),
    };
  }
}

/**
 * ABUSE PATTERN DETECTOR
 */
class AbusePatternDetector {
  constructor() {
    this.patterns = new Map();
    this.blacklist = new Set();
    this.suspiciousActivity = new Map();
    this.metrics = {
      patternsDetected: 0,
      usersBlacklisted: 0,
      suspiciousEvents: 0,
    };
  }

  recordActivity(clientId, activityType, metadata = {}) {
    const now = Date.now();

    if (!this.patterns.has(clientId)) {
      this.patterns.set(clientId, {
        activities: [],
        firstSeen: now,
        lastSeen: now,
        totalActivities: 0,
        suspicionScore: 0,
      });
    }

    const pattern = this.patterns.get(clientId);
    pattern.activities.push({
      type: activityType,
      timestamp: now,
      metadata,
    });
    pattern.lastSeen = now;
    pattern.totalActivities++;

    // Keep only last 100 activities
    if (pattern.activities.length > 100) {
      pattern.activities = pattern.activities.slice(-100);
    }

    // Analyze pattern for abuse
    this.analyzePattern(clientId, pattern);
  }

  analyzePattern(clientId, pattern) {
    let suspicionScore = 0;
    const recentActivities = pattern.activities.filter(
      (a) => Date.now() - a.timestamp < 300000, // Last 5 minutes
    );

    // High frequency detection
    if (recentActivities.length > 50) {
      suspicionScore += 30;
    }

    // Repetitive behavior detection
    const activityTypes = recentActivities.map((a) => a.type);
    const uniqueTypes = new Set(activityTypes);
    if (uniqueTypes.size === 1 && recentActivities.length > 20) {
      suspicionScore += 25;
    }

    // Time pattern analysis (requests at exact intervals)
    if (recentActivities.length >= 10) {
      const intervals = [];
      for (let i = 1; i < recentActivities.length; i++) {
        intervals.push(
          recentActivities[i].timestamp - recentActivities[i - 1].timestamp,
        );
      }

      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance =
        intervals.reduce((acc, interval) => {
          return acc + Math.pow(interval - avgInterval, 2);
        }, 0) / intervals.length;

      // Very consistent intervals suggest bot behavior
      if (variance < 100 && avgInterval < 1000) {
        suspicionScore += 35;
      }
    }

    // Update suspicion score
    pattern.suspicionScore = suspicionScore;

    // Take action based on score
    if (suspicionScore >= 70) {
      this.flagAsSuspicious(clientId, "high_suspicion_score", {
        score: suspicionScore,
      });
    } else if (suspicionScore >= 50) {
      this.flagAsSuspicious(clientId, "medium_suspicion_score", {
        score: suspicionScore,
      });
    }
  }

  flagAsSuspicious(clientId, reason, metadata = {}) {
    this.suspiciousActivity.set(clientId, {
      reason,
      metadata,
      timestamp: Date.now(),
      id: uuidv4(),
    });

    this.metrics.suspiciousEvents++;

    logger.warn("🚨 Suspicious activity detected", {
      clientId,
      reason,
      metadata,
      patternInfo: this.patterns.get(clientId),
    });

    // Auto-blacklist for very high suspicion
    if (metadata.score >= 90) {
      this.addToBlacklist(clientId, `auto_blacklist_score_${metadata.score}`);
    }
  }

  addToBlacklist(clientId, reason) {
    this.blacklist.add(clientId);
    this.metrics.usersBlacklisted++;

    logger.error("🔒 Client blacklisted", {
      clientId,
      reason,
      timestamp: Date.now(),
    });
  }

  removeFromBlacklist(clientId) {
    const removed = this.blacklist.delete(clientId);
    if (removed) {
      this.metrics.usersBlacklisted = Math.max(
        0,
        this.metrics.usersBlacklisted - 1,
      );
      logger.info("🔓 Client removed from blacklist", { clientId });
    }
    return removed;
  }

  isBlacklisted(clientId) {
    return this.blacklist.has(clientId);
  }

  isSuspicious(clientId) {
    return this.suspiciousActivity.has(clientId);
  }

  getClientInfo(clientId) {
    return {
      pattern: this.patterns.get(clientId),
      suspicious: this.suspiciousActivity.get(clientId),
      blacklisted: this.blacklist.has(clientId),
    };
  }

  cleanup() {
    const now = Date.now();
    const oldCutoff = now - 3600000; // 1 hour

    let cleanedPatterns = 0;
    let cleanedSuspicious = 0;

    // Clean old patterns
    for (const [clientId, pattern] of this.patterns) {
      if (pattern.lastSeen < oldCutoff) {
        this.patterns.delete(clientId);
        cleanedPatterns++;
      }
    }

    // Clean old suspicious activities
    for (const [clientId, activity] of this.suspiciousActivity) {
      if (activity.timestamp < oldCutoff) {
        this.suspiciousActivity.delete(clientId);
        cleanedSuspicious++;
      }
    }

    return { cleanedPatterns, cleanedSuspicious };
  }
}

/**
 * ADVANCED RATE LIMITER MANAGER
 */
class AdvancedRateLimiter {
  constructor(config = {}) {
    this.config = {
      // Global limits
      globalRequestsPerMinute: config.globalRequestsPerMinute || 1000,
      globalBurstLimit: config.globalBurstLimit || 100,

      // Per-client limits
      defaultRequestsPerMinute: config.defaultRequestsPerMinute || 60,
      defaultBurstLimit: config.defaultBurstLimit || 10,

      // User-specific limits
      guestRequestsPerMinute: config.guestRequestsPerMinute || 30,
      userRequestsPerMinute: config.userRequestsPerMinute || 60,
      vipRequestsPerMinute: config.vipRequestsPerMinute || 120,
      adminRequestsPerMinute: config.adminRequestsPerMinute || 300,

      // Burst limits
      guestBurstLimit: config.guestBurstLimit || 5,
      userBurstLimit: config.userBurstLimit || 10,
      vipBurstLimit: config.vipBurstLimit || 20,
      adminBurstLimit: config.adminBurstLimit || 50,

      // Window settings
      windowSize: config.windowSize || 60000, // 1 minute
      cleanupInterval: config.cleanupInterval || 300000, // 5 minutes

      // Feature flags
      enableGlobalLimiting: config.enableGlobalLimiting !== false,
      enableAbuseDetection: config.enableAbuseDetection !== false,
      enableAdaptiveLimits: config.enableAdaptiveLimits !== false,
    };

    // Global rate limiters
    this.globalTokenBucket = new TokenBucket(
      this.config.globalBurstLimit,
      this.config.globalRequestsPerMinute / 60,
    );

    this.globalSlidingWindow = new SlidingWindowLimiter(
      this.config.windowSize,
      this.config.globalRequestsPerMinute,
    );

    // Per-client limiters
    this.clientBuckets = new Map(); // clientId -> TokenBucket
    this.clientWindows = new Map(); // clientId -> SlidingWindowLimiter
    this.clientMetrics = new Map(); // clientId -> metrics

    // Abuse detection
    this.abuseDetector = new AbusePatternDetector();

    // System metrics
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      globalBlocks: 0,
      clientBlocks: 0,
      abuseBlocks: 0,
      startTime: Date.now(),
      peakRequestsPerMinute: 0,
      lastCleanup: Date.now(),
    };

    // Start cleanup interval
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    logger.info("🚦 AdvancedRateLimiter initialized", {
      config: this.config,
      features: {
        globalLimiting: this.config.enableGlobalLimiting,
        abuseDetection: this.config.enableAbuseDetection,
        adaptiveLimits: this.config.enableAdaptiveLimits,
      },
    });
  }

  getUserLimits(userRole = "guest") {
    const roleKey = userRole.toLowerCase();
    return {
      requestsPerMinute:
        this.config[`${roleKey}RequestsPerMinute`] ||
        this.config.defaultRequestsPerMinute,
      burstLimit:
        this.config[`${roleKey}BurstLimit`] || this.config.defaultBurstLimit,
    };
  }

  getOrCreateClientBucket(clientId, userRole = "guest") {
    if (!this.clientBuckets.has(clientId)) {
      const limits = this.getUserLimits(userRole);

      const bucket = new TokenBucket(
        limits.burstLimit,
        limits.requestsPerMinute / 60,
      );

      const window = new SlidingWindowLimiter(
        this.config.windowSize,
        limits.requestsPerMinute,
      );

      this.clientBuckets.set(clientId, bucket);
      this.clientWindows.set(clientId, window);
      this.clientMetrics.set(clientId, {
        totalRequests: 0,
        blockedRequests: 0,
        firstRequest: Date.now(),
        lastRequest: Date.now(),
        userRole,
      });

      logger.debug("🆕 Created rate limiter for client", {
        clientId,
        userRole,
        limits,
      });
    }

    return {
      bucket: this.clientBuckets.get(clientId),
      window: this.clientWindows.get(clientId),
      metrics: this.clientMetrics.get(clientId),
    };
  }

  async checkRateLimit(clientId, userRole = "guest", requestInfo = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Check if client is blacklisted
      if (
        this.config.enableAbuseDetection &&
        this.abuseDetector.isBlacklisted(clientId)
      ) {
        this.metrics.blockedRequests++;
        this.metrics.abuseBlocks++;

        logger.warn("🚫 Request blocked - client blacklisted", {
          clientId,
          requestInfo,
        });

        return {
          allowed: false,
          reason: "client_blacklisted",
          message: "Client is blacklisted due to abuse",
          retryAfter: null,
          processingTime: Date.now() - startTime,
        };
      }

      // Record activity for abuse detection
      if (this.config.enableAbuseDetection) {
        this.abuseDetector.recordActivity(clientId, "request", requestInfo);
      }

      // Check global limits first
      if (this.config.enableGlobalLimiting) {
        const globalBucketCheck = this.globalTokenBucket.consume(1);
        const globalWindowCheck = this.globalSlidingWindow.addRequest();

        if (!globalBucketCheck || !globalWindowCheck) {
          this.metrics.blockedRequests++;
          this.metrics.globalBlocks++;

          const waitTime = Math.max(
            this.globalTokenBucket.getWaitTime(1),
            this.globalSlidingWindow.getResetTime(),
          );

          logger.warn("🌍 Request blocked - global rate limit", {
            clientId,
            bucketTokens: this.globalTokenBucket.peek(),
            windowRequests: this.globalSlidingWindow.getCurrentCount(),
            waitTime,
          });

          return {
            allowed: false,
            reason: "global_rate_limit",
            message: "Global rate limit exceeded",
            retryAfter: waitTime,
            globalInfo: {
              bucket: this.globalTokenBucket.getInfo(),
              window: this.globalSlidingWindow.getInfo(),
            },
            processingTime: Date.now() - startTime,
          };
        }
      }

      // Check client-specific limits
      const { bucket, window, metrics } = this.getOrCreateClientBucket(
        clientId,
        userRole,
      );

      const bucketCheck = bucket.consume(1);
      const windowCheck = window.addRequest();

      // Update client metrics
      metrics.totalRequests++;
      metrics.lastRequest = Date.now();

      if (!bucketCheck || !windowCheck) {
        this.metrics.blockedRequests++;
        this.metrics.clientBlocks++;
        metrics.blockedRequests++;

        const waitTime = Math.max(bucket.getWaitTime(1), window.getResetTime());

        logger.warn("👤 Request blocked - client rate limit", {
          clientId,
          userRole,
          bucketTokens: bucket.peek(),
          windowRequests: window.getCurrentCount(),
          waitTime,
        });

        // Check if this client is becoming abusive
        if (this.config.enableAbuseDetection) {
          const blockRatio = metrics.blockedRequests / metrics.totalRequests;
          if (blockRatio > 0.5 && metrics.totalRequests > 10) {
            this.abuseDetector.flagAsSuspicious(clientId, "high_block_ratio", {
              blockRatio,
              totalRequests: metrics.totalRequests,
            });
          }
        }

        return {
          allowed: false,
          reason: "client_rate_limit",
          message: `Rate limit exceeded for ${userRole} user`,
          retryAfter: waitTime,
          clientInfo: {
            bucket: bucket.getInfo(),
            window: window.getInfo(),
            metrics,
          },
          processingTime: Date.now() - startTime,
        };
      }

      // Request allowed
      logger.debug("✅ Request allowed", {
        clientId,
        userRole,
        processingTime: Date.now() - startTime,
      });

      return {
        allowed: true,
        reason: "within_limits",
        message: "Request allowed",
        clientInfo: {
          bucket: bucket.getInfo(),
          window: window.getInfo(),
          metrics,
        },
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error("❌ Rate limiter error", {
        clientId,
        error: error.message,
        stack: error.stack,
      });

      // Fail open - allow request on error
      return {
        allowed: true,
        reason: "limiter_error",
        message: "Rate limiter error - request allowed",
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  updateClientLimits(clientId, newRole) {
    const { bucket, window, metrics } = this.getOrCreateClientBucket(
      clientId,
      newRole,
    );
    const newLimits = this.getUserLimits(newRole);

    // Update bucket capacity and refill rate
    bucket.capacity = newLimits.burstLimit;
    bucket.refillRate = newLimits.requestsPerMinute / 60;

    // Update window max requests
    window.maxRequests = newLimits.requestsPerMinute;

    // Update metrics
    metrics.userRole = newRole;

    logger.info("📝 Updated client rate limits", {
      clientId,
      newRole,
      newLimits,
    });
  }

  getClientStats(clientId) {
    const bucket = this.clientBuckets.get(clientId);
    const window = this.clientWindows.get(clientId);
    const metrics = this.clientMetrics.get(clientId);
    const abuseInfo = this.abuseDetector.getClientInfo(clientId);

    if (!bucket || !window || !metrics) {
      return null;
    }

    return {
      clientId,
      bucket: bucket.getInfo(),
      window: window.getInfo(),
      metrics,
      abuse: abuseInfo,
      blockRatio: metrics.blockedRequests / Math.max(1, metrics.totalRequests),
      requestsPerMinute:
        metrics.totalRequests / ((Date.now() - metrics.firstRequest) / 60000),
    };
  }

  getSystemMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const requestsPerMinute = this.metrics.totalRequests / (uptime / 60000);

    // Update peak requests
    if (requestsPerMinute > this.metrics.peakRequestsPerMinute) {
      this.metrics.peakRequestsPerMinute = requestsPerMinute;
    }

    return {
      ...this.metrics,
      uptime,
      requestsPerMinute,
      blockRatio:
        this.metrics.blockedRequests / Math.max(1, this.metrics.totalRequests),
      activeClients: this.clientBuckets.size,
      blacklistedClients: this.abuseDetector.blacklist.size,
      suspiciousClients: this.abuseDetector.suspiciousActivity.size,
      globalLimiter: {
        bucket: this.globalTokenBucket.getInfo(),
        window: this.globalSlidingWindow.getInfo(),
      },
    };
  }

  cleanup() {
    const now = Date.now();
    let cleanedClients = 0;

    // Clean inactive clients (no requests in last hour)
    const inactivityThreshold = now - 3600000; // 1 hour

    for (const [clientId, metrics] of this.clientMetrics) {
      if (metrics.lastRequest < inactivityThreshold) {
        this.clientBuckets.delete(clientId);
        this.clientWindows.delete(clientId);
        this.clientMetrics.delete(clientId);
        cleanedClients++;
      }
    }

    // Clean abuse detector
    const abuseCleanup = this.abuseDetector.cleanup();

    this.metrics.lastCleanup = now;

    logger.info("🧹 Rate limiter cleanup completed", {
      cleanedClients,
      remainingClients: this.clientBuckets.size,
      abuseCleanup,
    });

    return {
      cleanedClients,
      remainingClients: this.clientBuckets.size,
      ...abuseCleanup,
    };
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.clientBuckets.clear();
    this.clientWindows.clear();
    this.clientMetrics.clear();

    logger.info("🗑️ AdvancedRateLimiter destroyed");
  }
}

/**
 * MIDDLEWARE INTEGRATION
 */
class RateLimitMiddleware {
  constructor(rateLimiter = null, config = {}) {
    this.rateLimiter = rateLimiter || new AdvancedRateLimiter();
    this.bypassEnabled = false;
    this.config = {
      clientIdHeader: config.clientIdHeader || "x-client-id",
      userRoleHeader: config.userRoleHeader || "x-user-role",
      skipPaths: config.skipPaths || ["/health", "/metrics"],
      ...config,
    };
  }

  enableBypass(enabled = true) {
    this.bypassEnabled = enabled;
    logger.warn(`🚨 Rate limiting bypass ${enabled ? "ENABLED" : "DISABLED"}`);
  }

  middleware() {
    return async (req, res, next) => {
      // Skip rate limiting for certain paths
      if (this.config.skipPaths.includes(req.path)) {
        return next();
      }

      if (this.bypassEnabled) {
        logger.warn("⚠️ Rate limiting bypassed for request");
        return next();
      }

      try {
        // Extract client identification
        const clientId =
          req.headers[this.config.clientIdHeader] ||
          req.ip ||
          req.connection.remoteAddress ||
          "unknown";

        const userRole = req.headers[this.config.userRoleHeader] || "guest";

        const requestInfo = {
          path: req.path,
          method: req.method,
          userAgent: req.headers["user-agent"],
          ip: req.ip,
          timestamp: Date.now(),
        };

        // Check rate limits
        const result = await this.rateLimiter.checkRateLimit(
          clientId,
          userRole,
          requestInfo,
        );

        // Add rate limit headers
        res.set({
          "X-RateLimit-ClientId": clientId,
          "X-RateLimit-UserRole": userRole,
          "X-RateLimit-Allowed": result.allowed.toString(),
        });

        if (result.clientInfo) {
          res.set({
            "X-RateLimit-Remaining": result.clientInfo.bucket.tokens.toString(),
            "X-RateLimit-Reset": (
              Date.now() + (result.clientInfo.window.resetIn || 0)
            ).toString(),
          });
        }

        if (!result.allowed) {
          // Add retry after header
          if (result.retryAfter) {
            res.set(
              "Retry-After",
              Math.ceil(result.retryAfter / 1000).toString(),
            );
          }

          return res.status(429).json({
            error: "Rate limit exceeded",
            reason: result.reason,
            message: result.message,
            retryAfter: result.retryAfter,
            clientId: clientId,
          });
        }

        // Attach rate limit info to request
        req.rateLimit = result;
        next();
      } catch (error) {
        logger.error("❌ Rate limit middleware error", {
          error: error.message,
        });
        // Fail open - allow request on error
        next();
      }
    };
  }
}

module.exports = {
  TokenBucket,
  SlidingWindowLimiter,
  AbusePatternDetector,
  AdvancedRateLimiter,
  RateLimitMiddleware,
};
