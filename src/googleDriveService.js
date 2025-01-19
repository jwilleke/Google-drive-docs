"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GoogleDriveService = void 0;
const fs = require('fs');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  google
} = require('googleapis');
class GoogleDriveService {
  constructor(clientId, clientSecret, redirectUri, refreshToken) {
    this.driveClient = this.createDriveClient(clientId, clientSecret, redirectUri, refreshToken);
  }
  createDriveClient(clientId, clientSecret, redirectUri, refreshToken) {
    const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    client.setCredentials({
      refresh_token: refreshToken
    });
    return google.drive({
      version: 'v3',
      auth: client,
    });
  }
  createEntry(name, mimeType) {
    return this.driveClient.files.create({
      resource: {
        name: name,
        mimeType: mimeType,
      },
      //fields: 'id, name',
    });
  }
  searchFolder(folderName) {
    return new Promise((resolve, reject) => {
      this.driveClient.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
        fields: 'files(id, name)',
      }, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res.data.files ? res.data.files[0] : null);
      });
    });
  }
  saveFile(fileName, filePath, fileMimeType, folderId) {
    return this.driveClient.files.create({
      requestBody: {
        name: fileName,
        mimeType: fileMimeType,
        parents: folderId ? [folderId] : [],
      },
      media: {
        mimeType: fileMimeType,
        body: fs.createReadStream(filePath),
      },
    });
  }
  deleteEntry(fileID) {
    return this.driveClient.files.delete({
      fileId: fileID,
    });
  }
}
exports.GoogleDriveService = GoogleDriveService;