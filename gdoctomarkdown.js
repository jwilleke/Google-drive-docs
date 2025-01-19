/**
 * This script converts a Google Doc to Markdown and saves it to a local file.
 * 
 * 
 */
const { google } = require('googleapis');
const { readFileSync, writeFileSync } = require('fs');
const readline = require('readline');
const fs = require('fs');
const { googleDocsToMarkdown } = require('docs-markdown');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');


// Configuration constants
const SCOPES = [
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];
//const documentid = '1vaAyyVpJHoUEbE9zNgCw3msIT8HpKB6gv5zraNlX_FE'; // Google Doc ID

const documentid = '1IsoMOJPHrCInvY81Pgo-d41iftHi-TXupFrEDiYJ6Go';
const markdownDirectory = '/Volumes/docs/MJs/insurance'; // Path to save the markdown file 

// Load client secrets from a local file.
// Path to your OAuth2 credentials JSON file
const CREDENTIALS_PATH = path.join(process.cwd(), 'private/client_secret_476263029968-rnj8n3323mng9g5nc6gc3r3q1qqhrlq8.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(process.cwd(), 'private/token.json');

async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new OAuth2Client(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token
  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (error) {
    return getNewToken(oAuth2Client);
  }
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Authorize this app by visiting this url:', authUrl);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      resolve(code);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  
  // Store the token to disk for later program executions
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  return oAuth2Client;
}

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      writeFileSync(TOKEN_PATH, JSON.stringify(token));
      convertDocToMarkdown(oAuth2Client);
    });
  });
}

// Create directory if it doesn't exist
if (!fs.existsSync(markdownDirectory)) {
  fs.mkdirSync(markdownDirectory, { recursive: true });
}

/**
 * 
 * @param {*} auth 
 * @param {*} fileId 
 * @returns path to google file
 */
async function getGoogleDrivePath(auth, fileId) {
  const drive = google.drive({ version: 'v3', auth });
  let path = [];
  let isFirstCall = true;

  async function getFolder(id) {
    const file = await drive.files.get({
      fileId: id,
      fields: 'name,parents'
    });

    // Don't add the filename (first call) to the path
    if (!isFirstCall) {
      path.unshift(file.data.name);
    }
    isFirstCall = false;

    if (file.data.parents && file.data.parents.length > 0) {
      await getFolder(file.data.parents[0]);
    }
  }

  await getFolder(fileId);
  return path.join('/');
}

// Define the function to convert the Google Doc to Markdown
async function convertDocToMarkdown(auth) {
  const docs = google.docs({ version: 'v1', auth }); // Initialize Docs API
  const drive = google.drive({ version: 'v3', auth }); // Initialize Drive API
  const docResponse = await docs.documents.get({
    documentId: documentid,
  });

  // Get full drive path and remove "My Drive/" prefix
  let drivePath = await getGoogleDrivePath(auth, documentid);
  let mdPath = drivePath.replace(/^My Drive\/?/, '');
// Get file name from Drive
const fileMetadata = await drive.files.get({
  fileId: documentid,
  fields: 'name'
});

// Get filename without extension and sanitize
const sanitizedName = fileMetadata.data.name
  .replace(/\.[^/.]+$/, '') // Remove extension if present
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

  // Combine paths and create full directory structure
  const mdFullPath = path.join(markdownDirectory, mdPath);
  if (!fs.existsSync(mdFullPath)) {
    fs.mkdirSync(mdFullPath, { recursive: true });
  }

  // Set full path for markdown file
  const markdownFilePath = path.join(mdFullPath, `${sanitizedName}.md`);

  const file = await docs.documents.get({ documentId: documentid });
  const markdown = googleDocsToMarkdown(file.data);
  
  writeFileSync(markdownFilePath, markdown);
  console.log(`Saved to: ${markdownFilePath}`);
}

async function main() {
  try {
    const auth = await authorize();
    console.log('Authentication successful!');
    let gpath = await getGoogleDrivePath(auth, documentid);
    console.log(`gpath: ${gpath}`);
  } catch (error) {
    console.error('Error:', error);
  }

  try {
    const auth = await authorize();
    console.log('Authentication successful!');
    await convertDocToMarkdown(auth);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();