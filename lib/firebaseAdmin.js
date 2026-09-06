import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin environment variables are missing.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export async function requireUser(req) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    const error = new Error("Firebase ID token is missing.");
    error.statusCode = 401;
    throw error;
  }

  const idToken = authorization.substring(7).trim();

  if (!idToken) {
    const error = new Error("Firebase ID token is missing.");
    error.statusCode = 401;
    throw error;
  }

  try {
    return await getAdminAuth().verifyIdToken(idToken);
  } catch {
    const error = new Error("Firebase ID token is invalid or expired.");
    error.statusCode = 401;
    throw error;
  }
  }
