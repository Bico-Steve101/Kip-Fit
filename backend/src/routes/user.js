const pool = require('../config');
const NodeCache = require('node-cache');

// Initialize cache with a TTL (time to live) of 60 seconds for users
const userCache = new NodeCache({ stdTTL: 60 });

async function getUserInfo(userId) {
    const cacheKey = `user_${userId}`;
    let userInfo = userCache.get(cacheKey);
    
    if (!userInfo) {
        try {
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await pool.query(query, [userId]);
            userInfo = result.rows[0] || null;
            if (userInfo) {
                userCache.set(cacheKey, userInfo);
            }
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            return null;
        }
    }
    return userInfo;
}

module.exports = getUserInfo;
