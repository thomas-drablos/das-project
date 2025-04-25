// import { UserInfoClient } from 'auth0';
import { auth } from 'express-oauth2-jwt-bearer';

export const requireAuth = auth({
    audience: 'http://api.cometcommerce.com',
    issuerBaseURL: 'https://dev-olcmjrm1xuqtgb8o.us.auth0.com/',
    tokenSigningAlg: 'RS256',
});
