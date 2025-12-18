const { RtcTokenBuilder, RtcRole } = require('agora-token');

// Generate Agora RTC token
const generateToken = (req, res) => {
    try {
        const appId = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        // Safely access query and body parameters
        const query = req.query || {};
        const body = req.body || {};
        
        const channelName = query.channelName || body.channelName || 'mainRoom';
        
        // Debug logging (remove in production)
        console.log('Token generation request:', {
            hasAppId: !!appId,
            hasCertificate: !!appCertificate,
            channelName,
            appIdLength: appId?.length,
            certificateLength: appCertificate?.length,
            queryParams: Object.keys(query),
            bodyParams: Object.keys(body)
        });
        
        // Generate a random UID if not provided (between 1 and 2^32-1)
        // If 0 is passed, generate random UID for token
        let uid = query.uid || body.uid;
        if (!uid || uid === 0 || uid === '0') {
            uid = Math.floor(Math.random() * (Math.pow(2, 32) - 1)) + 1;
        } else {
            uid = parseInt(uid);
        }
        const role = RtcRole.PUBLISHER; // PUBLISHER can publish and subscribe
        const expirationTimeInSeconds = 3600; // Token expires in 1 hour

        if (!appId) {
            return res.status(400).json({ 
                error: 'AGORA_APP_ID is not configured in backend .env file' 
            });
        }

        if (!appCertificate) {
            return res.status(400).json({ 
                error: 'AGORA_APP_CERTIFICATE is not configured in backend .env file. Please add it to generate tokens.' 
            });
        }

        // Build token with uid
        // tokenExpire: number of seconds from now (not a timestamp)
        // privilegeExpire: optional, defaults to 0 (same as tokenExpire for full privileges)
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            role,
            expirationTimeInSeconds, // tokenExpire: seconds from now
            expirationTimeInSeconds  // privilegeExpire: same as tokenExpire
        );

        res.json({
            token,
            appId,
            channelName,
            uid,
            expirationTime: expirationTimeInSeconds
        });
    } catch (error) {
        console.error('Error generating Agora token:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Environment check:', {
            hasAppId: !!process.env.AGORA_APP_ID,
            hasCertificate: !!process.env.AGORA_APP_CERTIFICATE,
            appId: process.env.AGORA_APP_ID,
            certificate: process.env.AGORA_APP_CERTIFICATE ? '***' + process.env.AGORA_APP_CERTIFICATE.slice(-4) : 'missing'
        });
        res.status(500).json({ 
            error: 'Failed to generate token',
            message: error.message,
            details: error.stack,
            envCheck: {
                hasAppId: !!process.env.AGORA_APP_ID,
                hasCertificate: !!process.env.AGORA_APP_CERTIFICATE
            }
        });
    }
};

module.exports = {
    generateToken
};

