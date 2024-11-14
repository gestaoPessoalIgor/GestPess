import { Application } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';

// Initialize Firebase before starting the app
firebase()
  .initializeApp()
  .then(() => {
    console.log("Firebase initialized successfully");
    
    // Enable analytics
    firebase().analytics().setAnalyticsCollectionEnabled(true);
    
    // Add auth state listener
    firebase().auth().onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
    });
  })
  .catch(error => {
    console.error("Error initializing Firebase:", error);
  })
  .finally(() => {
    Application.run({ moduleName: 'app-root' });
  });