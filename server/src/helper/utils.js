const userObjResponse = function(user) {
    return {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    }
}

const getClientIp = function(req) {
    // If behind a proxy, get IP from X-Forwarded-For
    let ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

    if (!ip) return null;

    // If multiple IPs (comma separated), take the first one
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    // Handle IPv6 localhost and IPv4-mapped IPv6
    if (ip === '::1') ip = '127.0.0.1';
    if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

    return ip;
}

module.exports = { userObjResponse, getClientIp };