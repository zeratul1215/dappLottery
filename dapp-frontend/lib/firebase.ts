import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
