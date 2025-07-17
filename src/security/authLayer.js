/**
 * AUTHENTICATION & AUTHORIZATION LAYER - FASE 0 SECURITY FOUNDATION
 * 
 * RBAC (Role-Based Access Control) para WhatsApp Bot
 * Session management y token validation
 * WhatsApp user identity mapping seguro
 * 
 * Arquitectura: RBAC + Session Management + Audit Trail
 * Integración: Middleware pre-processing para toda interacción
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const config = require('../utils/config');

/**
 * USER ROLES AND PERMISSIONS SYSTEM
 */
class Permission {
    constructor(name, description, resource = '*', action = '*') {
        this.name = name;
        this.description = description;
        this.resource = resource;
        this.action = action;
        this.id = uuidv4();
    }

    matches(resource, action) {
        return (this.resource === '*' || this.resource === resource) &&
               (this.action === '*' || this.action === action);
    }
}

class Role {
    constructor(name, description, level = 0) {
        this.name = name;
        this.description = description;
        this.level = level; // Hierarchy level
        this.permissions = new Set();
        this.id = uuidv4();
        this.createdAt = Date.now();
    }

    addPermission(permission) {
        if (!(permission instanceof Permission)) {
            throw new Error('Permission must be instance of Permission class');
        }
        this.permissions.add(permission);
        return this;
    }

    removePermission(permissionName) {
        for (const permission of this.permissions) {
            if (permission.name === permissionName) {
                this.permissions.delete(permission);
                return true;
            }
        }
        return false;
    }

    hasPermission(resource, action) {
        for (const permission of this.permissions) {
            if (permission.matches(resource, action)) {
                return true;
            }
        }
        return false;
    }

    getPermissionsList() {
        return Array.from(this.permissions).map(p => ({
            name: p.name,
            description: p.description,
            resource: p.resource,
            action: p.action
        }));
    }
}

/**
 * WHATSAPP USER IDENTITY MAPPING
 */
class WhatsAppUser {
    constructor(phoneNumber, name = null, pushName = null) {
        this.phoneNumber = this.sanitizePhoneNumber(phoneNumber);
        this.name = name;
        this.pushName = pushName;
        this.id = uuidv4();
        this.roles = new Set();
        this.sessions = new Map();
        this.metadata = {
            firstSeen: Date.now(),
            lastSeen: Date.now(),
            messageCount: 0,
            blockedUntil: null,
            trustLevel: 'new', // new, trusted, verified, suspicious, blocked
            verificationMethod: null
        };
        this.audit = [];
    }

    sanitizePhoneNumber(phone) {
        // Remove all non-numeric characters except +
        const cleaned = String(phone).replace(/[^\d+]/g, '');
        
        // Ensure it starts with country code
        if (!cleaned.startsWith('+')) {
            // Assume Mexican number if no country code
            return '+52' + cleaned;
        }
        
        return cleaned;
    }

    addRole(role) {
        if (!(role instanceof Role)) {
            throw new Error('Role must be instance of Role class');
        }
        this.roles.add(role);
        this.logAction('role_added', { roleName: role.name });
        return this;
    }

    removeRole(roleName) {
        for (const role of this.roles) {
            if (role.name === roleName) {
                this.roles.delete(role);
                this.logAction('role_removed', { roleName });
                return true;
            }
        }
        return false;
    }

    hasPermission(resource, action) {
        for (const role of this.roles) {
            if (role.hasPermission(resource, action)) {
                return true;
            }
        }
        return false;
    }

    hasRole(roleName) {
        for (const role of this.roles) {
            if (role.name === roleName) {
                return true;
            }
        }
        return false;
    }

    updateActivity() {
        this.metadata.lastSeen = Date.now();
        this.metadata.messageCount++;
    }

    setTrustLevel(level, reason = '') {
        const oldLevel = this.metadata.trustLevel;
        this.metadata.trustLevel = level;
        this.logAction('trust_level_changed', { 
            from: oldLevel, 
            to: level, 
            reason 
        });
    }

    blockUntil(timestamp, reason = '') {
        this.metadata.blockedUntil = timestamp;
        this.logAction('user_blocked', { until: timestamp, reason });
    }

    isBlocked() {
        return this.metadata.blockedUntil && Date.now() < this.metadata.blockedUntil;
    }

    logAction(action, details = {}) {
        this.audit.push({
            id: uuidv4(),
            action,
            details,
            timestamp: Date.now(),
            userAgent: details.userAgent || 'whatsapp-bot'
        });

        // Keep only last 100 audit entries
        if (this.audit.length > 100) {
            this.audit = this.audit.slice(-100);
        }
    }

    getHighestRoleLevel() {
        let maxLevel = -1;
        for (const role of this.roles) {
            maxLevel = Math.max(maxLevel, role.level);
        }
        return maxLevel;
    }

    toJSON() {
        return {
            id: this.id,
            phoneNumber: this.phoneNumber,
            name: this.name,
            pushName: this.pushName,
            roles: Array.from(this.roles).map(r => ({
                name: r.name,
                level: r.level
            })),
            metadata: this.metadata,
            auditCount: this.audit.length,
            highestRoleLevel: this.getHighestRoleLevel()
        };
    }
}

/**
 * SESSION MANAGEMENT
 */
class Session {
    constructor(userId, phoneNumber, metadata = {}) {
        this.id = uuidv4();
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.createdAt = Date.now();
        this.lastActivity = Date.now();
        this.isActive = true;
        this.metadata = {
            ip: metadata.ip || 'unknown',
            userAgent: metadata.userAgent || 'whatsapp-web',
            clientId: metadata.clientId,
            ...metadata
        };
        this.tokens = new Map();
        this.permissions = new Set();
    }

    generateToken(type = 'access', expiresIn = 3600000) { // 1 hour default
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + expiresIn;
        
        this.tokens.set(type, {
            token,
            expiresAt,
            createdAt: Date.now()
        });
        
        return token;
    }

    validateToken(token, type = 'access') {
        const storedToken = this.tokens.get(type);
        if (!storedToken) {
            return false;
        }
        
        if (Date.now() > storedToken.expiresAt) {
            this.tokens.delete(type);
            return false;
        }
        
        return storedToken.token === token;
    }

    refreshActivity() {
        this.lastActivity = Date.now();
    }

    isExpired(timeout = 3600000) { // 1 hour default session timeout
        return Date.now() - this.lastActivity > timeout;
    }

    invalidate() {
        this.isActive = false;
        this.tokens.clear();
    }

    addPermission(permission) {
        this.permissions.add(permission);
    }

    hasPermission(permission) {
        return this.permissions.has(permission);
    }
}

/**
 * AUTHENTICATION & AUTHORIZATION MANAGER
 */
class AuthenticationManager {
    constructor() {
        this.users = new Map(); // phoneNumber -> WhatsAppUser
        this.sessions = new Map(); // sessionId -> Session
        this.roles = new Map(); // roleName -> Role
        this.blacklist = new Set(); // Blocked phone numbers
        this.rateLimits = new Map(); // phoneNumber -> attempts data
        
        this.config = {
            maxLoginAttempts: 5,
            lockoutDuration: 900000, // 15 minutes
            sessionTimeout: 3600000, // 1 hour
            tokenLifetime: 3600000,  // 1 hour
            adminNumbers: config.bot?.adminNumbers || []
        };
        
        this.metrics = {
            totalUsers: 0,
            activeSessions: 0,
            blockedUsers: 0,
            authAttempts: 0,
            authFailures: 0,
            startTime: Date.now()
        };
        
        // Initialize default roles
        this.initializeDefaultRoles();
        
        logger.info('🔐 AuthenticationManager initialized');
    }

    initializeDefaultRoles() {
        // GUEST ROLE - Default for new users
        const guestRole = new Role('guest', 'Default guest user', 0)
            .addPermission(new Permission('basic_chat', 'Basic chat interactions', 'chat', 'send'))
            .addPermission(new Permission('price_inquiry', 'Price inquiries', 'prices', 'read'))
            .addPermission(new Permission('service_info', 'Service information', 'services', 'read'));
        
        // USER ROLE - Verified users
        const userRole = new Role('user', 'Verified user', 10)
            .addPermission(new Permission('basic_chat', 'Basic chat interactions', 'chat', '*'))
            .addPermission(new Permission('price_inquiry', 'Price inquiries', 'prices', 'read'))
            .addPermission(new Permission('service_info', 'Service information', 'services', '*'))
            .addPermission(new Permission('order_creation', 'Create orders', 'orders', 'create'))
            .addPermission(new Permission('warranty_check', 'Check warranties', 'warranties', 'read'));
        
        // VIP ROLE - Premium customers
        const vipRole = new Role('vip', 'VIP customer', 20)
            .addPermission(new Permission('all_basic', 'All basic permissions', '*', 'read'))
            .addPermission(new Permission('priority_support', 'Priority support', 'support', '*'))
            .addPermission(new Permission('special_pricing', 'Special pricing access', 'prices', '*'))
            .addPermission(new Permission('order_management', 'Order management', 'orders', '*'));
        
        // ADMIN ROLE - System administrators
        const adminRole = new Role('admin', 'System administrator', 100)
            .addPermission(new Permission('full_access', 'Full system access', '*', '*'))
            .addPermission(new Permission('user_management', 'User management', 'users', '*'))
            .addPermission(new Permission('system_config', 'System configuration', 'system', '*'))
            .addPermission(new Permission('audit_access', 'Audit log access', 'audit', '*'));
        
        this.roles.set('guest', guestRole);
        this.roles.set('user', userRole);
        this.roles.set('vip', vipRole);
        this.roles.set('admin', adminRole);
        
        logger.info('🏷️ Default roles initialized', {
            roles: Array.from(this.roles.keys())
        });
    }

    async authenticateUser(phoneNumber, name = null, pushName = null, metadata = {}) {
        const startTime = Date.now();
        this.metrics.authAttempts++;
        
        try {
            const sanitizedPhone = this.sanitizePhoneNumber(phoneNumber);
            
            // Check if user is blocked
            if (this.blacklist.has(sanitizedPhone)) {
                this.metrics.authFailures++;
                logger.warn('🚫 Blocked user attempted authentication', {
                    phoneNumber: sanitizedPhone,
                    name, pushName
                });
                return {
                    success: false,
                    reason: 'user_blocked',
                    message: 'User is blocked from the system'
                };
            }
            
            // Check rate limiting
            const rateLimitResult = this.checkRateLimit(sanitizedPhone);
            if (!rateLimitResult.allowed) {
                this.metrics.authFailures++;
                return {
                    success: false,
                    reason: 'rate_limited',
                    message: `Too many attempts. Try again in ${Math.ceil(rateLimitResult.resetIn / 60000)} minutes`,
                    retryAfter: rateLimitResult.resetIn
                };
            }
            
            // Get or create user
            let user = this.users.get(sanitizedPhone);
            if (!user) {
                user = new WhatsAppUser(sanitizedPhone, name, pushName);
                
                // Assign default role based on admin list
                if (this.config.adminNumbers.includes(sanitizedPhone)) {
                    user.addRole(this.roles.get('admin'));
                    user.setTrustLevel('verified', 'admin_number');
                } else {
                    user.addRole(this.roles.get('guest'));
                }
                
                this.users.set(sanitizedPhone, user);
                this.metrics.totalUsers++;
                
                logger.info('👤 New user registered', {
                    phoneNumber: sanitizedPhone,
                    name, pushName,
                    defaultRole: user.hasRole('admin') ? 'admin' : 'guest'
                });
            } else {
                // Update user info if provided
                if (name && user.name !== name) user.name = name;
                if (pushName && user.pushName !== pushName) user.pushName = pushName;
                user.updateActivity();
            }
            
            // Check if user is blocked
            if (user.isBlocked()) {
                return {
                    success: false,
                    reason: 'user_temporarily_blocked',
                    message: 'User is temporarily blocked',
                    blockedUntil: user.metadata.blockedUntil
                };
            }
            
            // Create session
            const session = new Session(user.id, sanitizedPhone, metadata);
            this.sessions.set(session.id, session);
            this.metrics.activeSessions++;
            
            // Generate tokens
            const accessToken = session.generateToken('access', this.config.tokenLifetime);
            const refreshToken = session.generateToken('refresh', this.config.tokenLifetime * 24); // 24 hours
            
            // Reset rate limit on successful auth
            this.resetRateLimit(sanitizedPhone);
            
            user.logAction('authentication_success', {
                sessionId: session.id,
                metadata
            });
            
            const authResult = {
                success: true,
                user: user.toJSON(),
                session: {
                    id: session.id,
                    accessToken,
                    refreshToken,
                    expiresIn: this.config.tokenLifetime
                },
                permissions: user.hasRole('admin') ? ['*'] : user.getPermissionsList(),
                processingTime: Date.now() - startTime
            };
            
            logger.info('✅ User authenticated successfully', {
                phoneNumber: sanitizedPhone,
                sessionId: session.id,
                roles: Array.from(user.roles).map(r => r.name),
                processingTime: authResult.processingTime
            });
            
            return authResult;
            
        } catch (error) {
            this.metrics.authFailures++;
            logger.error('❌ Authentication error', {
                phoneNumber,
                error: error.message,
                stack: error.stack
            });
            
            return {
                success: false,
                reason: 'authentication_error',
                message: 'Internal authentication error'
            };
        }
    }

    async authorizeAction(sessionId, resource, action, context = {}) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isActive) {
            return {
                authorized: false,
                reason: 'invalid_session',
                message: 'Session not found or inactive'
            };
        }
        
        if (session.isExpired(this.config.sessionTimeout)) {
            session.invalidate();
            this.sessions.delete(sessionId);
            this.metrics.activeSessions--;
            
            return {
                authorized: false,
                reason: 'session_expired',
                message: 'Session has expired'
            };
        }
        
        const user = this.getUserByPhone(session.phoneNumber);
        if (!user) {
            return {
                authorized: false,
                reason: 'user_not_found',
                message: 'User not found'
            };
        }
        
        // Check if user is blocked
        if (user.isBlocked()) {
            return {
                authorized: false,
                reason: 'user_blocked',
                message: 'User is temporarily blocked'
            };
        }
        
        // Check permissions
        const hasPermission = user.hasPermission(resource, action);
        
        session.refreshActivity();
        user.updateActivity();
        
        if (hasPermission) {
            user.logAction('action_authorized', {
                sessionId,
                resource,
                action,
                context
            });
        } else {
            user.logAction('action_denied', {
                sessionId,
                resource,
                action,
                context
            });
            
            logger.warn('🚫 Action denied', {
                phoneNumber: session.phoneNumber,
                sessionId,
                resource,
                action,
                userRoles: Array.from(user.roles).map(r => r.name)
            });
        }
        
        return {
            authorized: hasPermission,
            reason: hasPermission ? 'authorized' : 'insufficient_permissions',
            message: hasPermission ? 'Action authorized' : 'Insufficient permissions for this action',
            user: user.toJSON()
        };
    }

    checkRateLimit(phoneNumber) {
        const now = Date.now();
        const rateLimitData = this.rateLimits.get(phoneNumber) || {
            attempts: 0,
            firstAttempt: now,
            lockedUntil: null
        };
        
        // Check if currently locked
        if (rateLimitData.lockedUntil && now < rateLimitData.lockedUntil) {
            return {
                allowed: false,
                resetIn: rateLimitData.lockedUntil - now,
                attempts: rateLimitData.attempts
            };
        }
        
        // Reset if lockout period has passed
        if (rateLimitData.lockedUntil && now >= rateLimitData.lockedUntil) {
            rateLimitData.attempts = 0;
            rateLimitData.firstAttempt = now;
            rateLimitData.lockedUntil = null;
        }
        
        // Check if we need to reset the window (1 hour)
        if (now - rateLimitData.firstAttempt > 3600000) {
            rateLimitData.attempts = 0;
            rateLimitData.firstAttempt = now;
        }
        
        rateLimitData.attempts++;
        this.rateLimits.set(phoneNumber, rateLimitData);
        
        if (rateLimitData.attempts > this.config.maxLoginAttempts) {
            rateLimitData.lockedUntil = now + this.config.lockoutDuration;
            
            logger.warn('🔒 User rate limited', {
                phoneNumber,
                attempts: rateLimitData.attempts,
                lockedUntil: rateLimitData.lockedUntil
            });
            
            return {
                allowed: false,
                resetIn: this.config.lockoutDuration,
                attempts: rateLimitData.attempts
            };
        }
        
        return {
            allowed: true,
            attempts: rateLimitData.attempts,
            remaining: this.config.maxLoginAttempts - rateLimitData.attempts
        };
    }

    resetRateLimit(phoneNumber) {
        this.rateLimits.delete(phoneNumber);
    }

    sanitizePhoneNumber(phone) {
        const cleaned = String(phone).replace(/[^\d+]/g, '');
        if (!cleaned.startsWith('+')) {
            return '+52' + cleaned;
        }
        return cleaned;
    }

    getUserByPhone(phoneNumber) {
        return this.users.get(this.sanitizePhoneNumber(phoneNumber));
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    blockUser(phoneNumber, duration = 3600000, reason = '') {
        const user = this.getUserByPhone(phoneNumber);
        if (user) {
            user.blockUntil(Date.now() + duration, reason);
            this.metrics.blockedUsers++;
        }
        
        this.blacklist.add(this.sanitizePhoneNumber(phoneNumber));
        
        logger.warn('🔒 User blocked', {
            phoneNumber: this.sanitizePhoneNumber(phoneNumber),
            duration,
            reason
        });
    }

    unblockUser(phoneNumber) {
        const sanitizedPhone = this.sanitizePhoneNumber(phoneNumber);
        this.blacklist.delete(sanitizedPhone);
        
        const user = this.getUserByPhone(phoneNumber);
        if (user) {
            user.metadata.blockedUntil = null;
            user.logAction('user_unblocked', {});
            this.metrics.blockedUsers = Math.max(0, this.metrics.blockedUsers - 1);
        }
        
        logger.info('🔓 User unblocked', { phoneNumber: sanitizedPhone });
    }

    promoteUser(phoneNumber, roleName) {
        const user = this.getUserByPhone(phoneNumber);
        const role = this.roles.get(roleName);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        if (!role) {
            throw new Error('Role not found');
        }
        
        user.addRole(role);
        
        // Update trust level for role promotions
        if (roleName === 'user') {
            user.setTrustLevel('trusted', 'role_promotion');
        } else if (roleName === 'vip') {
            user.setTrustLevel('verified', 'vip_promotion');
        } else if (roleName === 'admin') {
            user.setTrustLevel('verified', 'admin_promotion');
        }
        
        logger.info('⬆️ User promoted', {
            phoneNumber: this.sanitizePhoneNumber(phoneNumber),
            roleName,
            newTrustLevel: user.metadata.trustLevel
        });
        
        return user;
    }

    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        
        // Clean expired sessions
        let expiredSessions = 0;
        for (const [sessionId, session] of this.sessions) {
            if (session.isExpired(this.config.sessionTimeout)) {
                session.invalidate();
                this.sessions.delete(sessionId);
                expiredSessions++;
            }
        }
        
        this.metrics.activeSessions -= expiredSessions;
        
        return {
            ...this.metrics,
            uptime,
            authSuccessRate: 1 - (this.metrics.authFailures / Math.max(1, this.metrics.authAttempts)),
            activeSessionsCount: this.sessions.size,
            registeredUsersCount: this.users.size,
            blockedUsersCount: this.blacklist.size,
            averageSessionDuration: uptime / Math.max(1, this.metrics.totalUsers)
        };
    }

    cleanup() {
        // Remove expired sessions
        const now = Date.now();
        let cleanedSessions = 0;
        
        for (const [sessionId, session] of this.sessions) {
            if (session.isExpired(this.config.sessionTimeout)) {
                session.invalidate();
                this.sessions.delete(sessionId);
                cleanedSessions++;
            }
        }
        
        this.metrics.activeSessions -= cleanedSessions;
        
        // Clean old rate limit data
        for (const [phone, data] of this.rateLimits) {
            if (now - data.firstAttempt > 3600000 && !data.lockedUntil) {
                this.rateLimits.delete(phone);
            }
        }
        
        logger.info('🧹 Auth cleanup completed', {
            cleanedSessions,
            activeSessionsRemaining: this.sessions.size
        });
        
        return cleanedSessions;
    }
}

/**
 * MIDDLEWARE INTEGRATION
 */
class AuthMiddleware {
    constructor(authManager = null) {
        this.authManager = authManager || new AuthenticationManager();
        this.bypassEnabled = false;
    }

    enableBypass(enabled = true) {
        this.bypassEnabled = enabled;
        logger.warn(`🚨 Auth bypass ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    async authenticate(phoneNumber, name, pushName, metadata = {}) {
        if (this.bypassEnabled) {
            logger.warn('⚠️ Authentication bypassed');
            return { success: true, bypass: true };
        }
        
        return await this.authManager.authenticateUser(phoneNumber, name, pushName, metadata);
    }

    async authorize(sessionId, resource, action, context = {}) {
        if (this.bypassEnabled) {
            logger.warn('⚠️ Authorization bypassed');
            return { authorized: true, bypass: true };
        }
        
        return await this.authManager.authorizeAction(sessionId, resource, action, context);
    }

    middleware() {
        return async (req, res, next) => {
            if (this.bypassEnabled) {
                req.auth = { bypass: true };
                return next();
            }
            
            try {
                // Extract session ID from headers or query
                const sessionId = req.headers['x-session-id'] || req.query.sessionId;
                
                if (!sessionId) {
                    return res.status(401).json({
                        error: 'Authentication required',
                        message: 'Session ID required'
                    });
                }
                
                // Get resource and action from route
                const resource = req.route?.path?.split('/')[1] || 'unknown';
                const action = req.method.toLowerCase();
                
                const authResult = await this.authorize(sessionId, resource, action, {
                    route: req.route?.path,
                    method: req.method,
                    ip: req.ip
                });
                
                if (!authResult.authorized) {
                    return res.status(403).json({
                        error: 'Authorization failed',
                        reason: authResult.reason,
                        message: authResult.message
                    });
                }
                
                req.auth = authResult;
                next();
                
            } catch (error) {
                logger.error('❌ Auth middleware error', { error: error.message });
                res.status(500).json({
                    error: 'Internal auth error',
                    message: 'Please try again later'
                });
            }
        };
    }
}

module.exports = {
    Permission,
    Role,
    WhatsAppUser,
    Session,
    AuthenticationManager,
    AuthMiddleware
};