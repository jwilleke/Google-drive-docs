//import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { GoogleDriveService } from './googleDriveService.js';

//dotenv.config();

const CREDENTIALS_FILE = '/private/client_secret_631989661261-q4gfhr8d30ijufljbhin7g5u1374hjaf.apps.googleusercontent.com.json';

const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';

(async () => {
  const googleDriveService = new GoogleDriveService(driveClientId, driveClientSecret, driveRedirectUri, driveRefreshToken);

  const finalPath = path.resolve(__dirname, '../public/spacex-uj3hvdfQujI-unsplash.jpg');
  const folderName = 'Picture';
  const fileMimeType = 'image/jpg';

  if (!fs.existsSync(finalPath)) {
    throw new Error('File not found!');
  }

  let folder = await googleDriveService.searchFolder(folderName).catch((error) => {
    console.error(error);
    return null;
  });

  if (!folder) {
    folder = await googleDriveService.createEntry(finalPath, fileMimeType);
  }

  await googleDriveService.saveFile('SpaceX', finalPath, fileMimeType, folder.id).catch((error) => {
    console.error(error);
  });

  console.info('File uploaded successfully!');

  // Delete the file on the server
  fs.unlinkSync(finalPath);
})();