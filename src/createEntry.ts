//import dotenv from 'dotenv';
//import * as path from 'path';
//import * as fs from 'fs';

import { GoogleDriveService } from './googleDriveService.js';

const CREDENTIALS_FILE = '/private/client_secret_631989661261-q4gfhr8d30ijufljbhin7g5u1374hjaf.apps.googleusercontent.com.json';

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';

(async () => {

  const googleDriveService = new GoogleDriveService(driveClientId, driveClientSecret, driveRedirectUri, driveRefreshToken);
  let results = await googleDriveService.createEntry('test123', 'application/vnd.google-apps.document');
  console.info('File uploaded successfully!');
  console.info(results);

});
