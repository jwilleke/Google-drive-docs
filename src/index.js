"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const googleDriveService_1 = require("./googleDriveService");
dotenv_1.default.config();
const CREDENTIALS_FILE = '/private/client_secret_631989661261-q4gfhr8d30ijufljbhin7g5u1374hjaf.apps.googleusercontent.com.json';
const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';
(() => __awaiter(void 0, void 0, void 0, function* () {
    const googleDriveService = new googleDriveService_1.GoogleDriveService(driveClientId, driveClientSecret, driveRedirectUri, driveRefreshToken);
    const finalPath = path.resolve(__dirname, '../public/spacex-uj3hvdfQujI-unsplash.jpg');
    const folderName = 'Picture';
    const fileMimeType = 'image/jpg';
    if (!fs.existsSync(finalPath)) {
        throw new Error('File not found!');
    }
    let folder = yield googleDriveService.searchFolder(folderName).catch((error) => {
        console.error(error);
        return null;
    });
    if (!folder) {
        folder = yield googleDriveService.createEntry(finalPath, fileMimeType);
    }
    yield googleDriveService.saveFile('SpaceX', finalPath, fileMimeType, folder.id).catch((error) => {
        console.error(error);
    });
    console.info('File uploaded successfully!');
    // Delete the file on the server
    fs.unlinkSync(finalPath);
}))();
