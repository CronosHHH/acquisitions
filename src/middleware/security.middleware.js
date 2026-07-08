import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user ? req.user.role || 'guest' : 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20; // Admins can make 20 requests per minute
        message = 'Admin rate limit exceeded (20 requests per minute)';
        break;
      case 'user':
        limit = 10; // Regular users can make 10 requests per minute
        message = 'User rate limit exceeded (10 requests per minute)';
        break;
      case 'guest':
        limit = 5; // Guests can make 5 requests per minute
        message = 'Guest rate limit exceeded (5 requests per minute)';
    }

    const client = aj.withRule(slidingWindow({
      mode: 'LIVE',
      interval: '1m', // 1 minute
      max: limit,
      name: `${role}-rate-limit`,
    }));

    const decision = await client.evaluate(req);
        
    if(decision.isDenied() && decision.reason.isBot()) {
      logger.warn(`Bot detected: ${decision.reason.getCategory()}`, {ip: req.ip, path: req.path});
      return res.status(403).send('Access denied: Bot detected');
    }

    if(decision.isDenied() && decision.reason.isShield()) {
      logger.warn(`Shield Bloqued request: ${decision.reason.getCategory()}`, {ip: req.ip, path: req.path, method: req.method});
      return res.status(403).send('Access denied: Shield blocked');
    }

    if(decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn(`Rate limit exceeded: ${decision.reason.getCategory()}`, {ip: req.ip, path: req.path});
      return res.status(429).send('Access denied: Rate limit exceeded');
    }

    next();

    await client.protect(req, res);
    next();
  } catch (error) {
    console.error('Error in security middleware:', error);
    res.status(500).send('Internal Server Error');
  }
};

export default securityMiddleware;