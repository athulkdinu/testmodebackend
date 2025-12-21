const { RtcTokenBuilder, RtcRole } = require('agora-token');


const generateToken = (req, res) => {
    try {
        const appId = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        
        const query = req.query || {};
        const body = req.body || {};
        
        const channelName = query.channelName || body.channelName || 'mainRoom';
        
        
        console.log('Token generation request:', {
            hasAppId: !!appId,
            hasCertificate: !!appCertificate,
            channelName,
            appIdLength: appId?.length,
            certificateLength: appCertificate?.length,
            queryParams: Object.keys(query),
            bodyParams: Object.keys(body)
        });
        
        
        let uid = query.uid || body.uid;
        if (!uid || uid === 0 || uid === '0') {
            uid = Math.floor(Math.random() * (Math.pow(2, 32) - 1)) + 1;
        } else {
            uid = parseInt(uid);
        }
        const role = RtcRole.PUBLISHER; 
        const expirationTimeInSeconds = 3600; 

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

        
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            role,
            expirationTimeInSeconds, 
            expirationTimeInSeconds  
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

