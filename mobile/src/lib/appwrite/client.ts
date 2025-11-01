import { Client, Account, Databases, Storage, Functions } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './config';

// Create Appwrite client instance
const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { client };
