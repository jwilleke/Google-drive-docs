// Copyright 2018 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const fs1 = require('fs');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const process = require('process');
const {
  authenticate
} = require('@google-cloud/local-auth');
const {
  google
} = require('googleapis');
const docs = google.docs('v1');

const testDocID = '1OFy5hXyTo-FKIlxS5yTZuRz5BEKKDmw9e8kagvRjyQk';


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/documents.readonly', 'https://www.googleapis.com/auth/drive'];
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
const CREDENTIALS_PATH = path.join(process.cwd(), '/private/client_secret_631989661261-q4gfhr8d30ijufljbhin7g5u1374hjaf.apps.googleusercontent.com.json');


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



async function runSample() {
  // Obtain user credentials to use for the request
  const auth = await authorize();
  google.options({
    auth
  });

  const res = await docs.documents.get({
    documentId: testDocID,
  });
  fs1.writeFileSync('temp.json', JSON.stringify(res.data));
  //console.log(util.inspect(res.data, false, 17));
  return res.data;
}

async function test() {
  let resData = await runSample().catch(console.error);
  console.log(JSON.stringify(resData));
}

test();