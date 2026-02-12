// Paste your Firebase config here.
// Create a Firebase project at https://console.firebase.google.com/
// Add a Web app and copy the config object, then replace the placeholder below.

// Example config structure:
// const firebaseConfig = {
//   apiKey: "...",
//   authDomain: "...",
//   projectId: "...",
//   storageBucket: "...",
//   messagingSenderId: "...",
//   appId: "...",
// };

// After pasting your config, this file will initialize Firebase for the app.

(function(){
  // Firebase web config (from user)
  const firebaseConfig = {
    apiKey: "AIzaSyB5ry6httboFBuBHedmXcNw6_lOBiNU6JI",
    authDomain: "fir-menu-6c464.firebaseapp.com",
    projectId: "fir-menu-6c464",
    storageBucket: "fir-menu-6c464.firebasestorage.app",
    messagingSenderId: "791749704131",
    appId: "1:791749704131:web:777256de2b8f47c8502576",
    measurementId: "G-S5G7Q4ZLGV"
  };

  try {
    if (firebaseConfig && firebaseConfig.projectId && typeof firebase !== 'undefined') {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized (compat)');
      } else {
        console.log('Firebase already initialized');
      }
    } else {
      console.log('Firebase config not set or firebase SDK missing');
    }
  } catch (e) {
    console.warn('Firebase init error', e);
  }
})();
