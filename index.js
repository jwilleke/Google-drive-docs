/**
 * Uses Goole DOCs API for access using OAUTH Client.
 * 
 */

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {
  authenticate
} = require('@google-cloud/local-auth');
const {
  google
} = require('googleapis');


const CREDENTIALS_FILE = '/private/client_secret_631989661261-q4gfhr8d30ijufljbhin7g5u1374hjaf.apps.googleusercontent.com.json';

// If modifying these scopes, delete token.json.
/* const SCOPES = ["https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/contacts.readonly",
  "https://www.googleapis.com/auth/user.emails.read",
  "profile",
]; */
const SCOPES = ["https://www.googleapis.com/auth/contacts.readonly",
  "https://www.googleapis.com/auth/user.emails.read",
  "profile",
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

// path to stored Token
const TOKEN_PATH = path.join(process.cwd(), '/private/token.json');
/**
 * Project name: oidc-76639
 * Project number: 631989661261
 * Project ID: oidc-76639
 */
const CREDENTIALS_PATH = path.join(process.cwd(), CREDENTIALS_FILE);


/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}


/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
async function printDocTitle(client, testDocID) {
  const res = await client.documents.get({
    documentId: testDocID,
  });
  console.log(`The title of the document is: ${res.data.title}`);
}

/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
async function printDocData(auth, documentID) {
  console.log(`documentId: ${documentID}`);
  const docs = google.docs({
    version: 'v3',
    auth
  });
  const res = await docs.documents.get({
    documentId: documentID,
  });
  console.log(`The document is: ${res.data}`);
}

const testDocID = '1OFy5hXyTo-FKIlxS5yTZuRz5BEKKDmw9e8kagvRjyQk';

/**
 * 
 * @param {*} name 
 * @param {*} mimeType 
 * @param {*} client 
 * @returns 
 */
async function createEntry(entryMetadata, client) {
  return client.files.create({
    entryMetadata,
  });
};

async function testGetDocument(auth, testDocID) {
  const docService = google.docs({
    version: 'v1',
    auth
  });
  const res = await client.documents.get({
    documentId: testDocID,
  });
  return console.log(`The document is: ${res.data}`);
}

async function getDoc(auth) {
  const docs = google.docs({
    version: 'v1',
    auth
  });
  const doc = await docs.documents.get({
    documentId: testDocID,
    fields: 'body/content,inlineObjects'
  });
  console.log(`The document is: ${JSON.stringify(doc)}`);
}

/**
 * 
 */
async function testCreateDoc() {
  let client = await authorize();
  const service = google.drive({
    version: 'v3',
    client
  });
  const fileMetadata = {
    name: 'test123',
    mimeType: 'application/vnd.google-apps.document',
  };
  const file = await service.files.create({
    resource: fileMetadata,
  });
  //let resData = await runSample().catch(console.error);
  console.log(JSON.stringify(file));
}

/**
 * 
 */
async function getProfile() {
  // retrieve user profile
  const peopleService = google.people('v1');
  const res = await peopleService.people.get({
    resourceName: 'people/me',
    personFields: 'emailAddresses',
  });
  console.log(res.data);
}

/**
 * Print the display name if available for 10 connections.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listConnectionNames(auth) {
  const service = google.people({version: 'v1', auth});
  const res = await service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 10,
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
      console.log(person.names[0].displayName);
    } else {
      console.log('No display name found for connection.');
    }
  });
}


/**
 * 
 */
async function test() {
  const auth = await authorize(SCOPES);
  const profile = await getProfile();
  console.log(`My profile: ${profile}`);
//  const document = await testGetDocument(auth, testDocID);
//  console.log(`The document is: ${document}`);
}

test();
//authorize().then(getDoc).catch(console.error);

// [END docs_quickstart]