const creds = require ('../private/client_secret_631989661261-q4gfhr8d30ijufljbhin7g5u1374hjaf.apps.googleusercontent.com.json');
const tokens = require ('../private/token.json');

const driveClientId = creds.web.client_id || '';
const driveClientSecret = creds.web.client_secret || '';
const driveRedirectUri = creds.web.redirect_uris[0] || '';
const driveRefreshToken = tokens.refresh_token || '';

console.log(`driveClientId: ${driveClientId}`);
console.log(`driveClientSecret: ${driveClientSecret}`);
console.log(`driveRedirectUri: ${driveRedirectUri}`);
console.log(`driveRefreshToken: ${driveRefreshToken}`);

console.log(`Finished reading credentials.`);



