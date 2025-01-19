/**
 * Simple Oauth Test to make sure that the Oauth flow is working,
 * Does NOT store tokens.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');

const {
  google
} = require('googleapis');
const peopleService = google.people('v1');

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI.  To get these credentials for your application, visit https://console.cloud.google.com/apis/credentials.
 */
const keyPath = path.join(__dirname, 'private/client_secret_631989661261-q4gfhr8d30ijufljbhin7g5u1374hjaf.apps.googleusercontent.com.json');
let keys = {
  redirect_uris: ['']
};
if (fs.existsSync(keyPath)) {
  keys = require(keyPath).web;
}

/**
 * Create a new OAuth2 client with the configured keys.
 */
const oauth2Client = new google.auth.OAuth2(
  keys.client_id,
  keys.client_secret,
  keys.redirect_uris[0]
);

/**
 * This is one of the many ways you can configure googleapis to use authentication credentials.  In this method, we're setting a global reference for all APIs.  Any other API you use here, like google.drive('v3'), will now use this auth client. You can also override the auth client at the service and method call levels.
 */
google.options({
  auth: oauth2Client
});

/**
 * Open an http server to accept the oauth callback. In this simple example, the only request to our webserver is to /callback?code=<code>
 */
async function authenticate(scopes) {
  return new Promise((resolve, reject) => {
    // grab the url that will be used for authorization
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
    });
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:3000')
              .searchParams;
            res.end('Authentication successful! Please return to the console.');
            server.destroy();
            const {
              tokens
            } = await oauth2Client.getToken(qs.get('code'));
            oauth2Client.credentials = tokens; // eslint-disable-line require-atomic-updates
            resolve(oauth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(3000, () => {
        // open the browser to the authorize url to start the workflow
        opn(authorizeUrl, {
          wait: false
        }).then(cp => cp.unref());
      });
    destroyer(server);
  });
}

async function getProfile() {
  // retrieve user profile
  const res = await peopleService.people.get({
    resourceName: 'people/me',
    personFields: 'emailAddresses',
  });
  console.log(res.data);
}

const scopes = [
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/user.emails.read',
  'profile',
];

/**
 * Print the display name if available for 10 connections.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listConnectionNames(auth) {
  const service = google.people({version: 'v1', auth});
  const res = await service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 100,
    personFields: 'names,emailAddresses',
  });
  const connections = res.data.connections;
  if (!connections || connections.length === 0) {
    console.log('No connections found.');
    return;
  }
  console.log('Connections:');
  connections.forEach((person) => {
    if (person.names && person.names.length > 0) {
      console.log(`Name: ${person.names[0].displayName} Email: ${JSON.stringify(person.emailAddresses)}`);
    } else {
      console.log('No display name found for connection.');
    }
  });
}

async function test() {
  let client = await authenticate(scopes);
  await getProfile();
  //await listConnectionNames(client);
  
}

test();