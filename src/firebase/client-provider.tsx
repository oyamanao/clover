
'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// These functions are now defined directly within the client component.
function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

function initializeFirebase() {
  const firebaseConfig = {
    projectId: "studio-5785792637-546f1",
    appId: "1:1041815318927:web:eeffa24a495a821738dbfa",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "studio-5785792637-546f1.firebaseapp.com",
    measurementId: "",
    messagingSenderId: "1041815318927"
  };

  if (getApps().length) {
    return getSdks(getApp());
  }
  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}


interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    if (typeof window !== 'undefined') {
      const services = initializeFirebase();
      setFirebaseServices(services);
    }
  }, []);

  if (!firebaseServices) {
    // Render nothing or a loading spinner until Firebase is initialized.
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
