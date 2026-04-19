import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Test connection
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc to trigger a network request
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore Connection: Success");
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.warn("Firestore Connection: Connected, but permissions were denied (this is expected if rules are not yet updated).");
    } else if (error?.message?.includes('the client is offline')) {
      console.error("Firestore Connection: FAILED. The client is offline.");
      console.error("DIAGNOSTIC: Firestore is unreachable. Please ensure:");
      console.error("1. Firestore is ENABLED in the Firebase Console for project 'communityconnect-924fe'.");
      console.error("2. You have created a database (usually named '(default)').");
      console.error("3. Your network allows connections to firestore.googleapis.com.");
    } else {
      console.error("Firestore Connection Test Error:", error);
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
