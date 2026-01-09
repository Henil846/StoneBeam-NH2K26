// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAVc1Q-e8BOzVucbyc9WHV9eDaA5CO1rg",
  authDomain: "stonebeam-nh.firebaseapp.com",
  projectId: "stonebeam-nh",
  storageBucket: "stonebeam-nh.firebasestorage.app",
  messagingSenderId: "961497400368",
  appId: "1:961497400368:web:ee3e8d6fe838af475119f5",
  measurementId: "G-5E9624QZHS"
};

// Initialize Firebase with error handling
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // Initialize Auth and Firestore
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Make sure auth is available globally
  window.auth = auth;
  window.db = db;
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback to local authentication if Firebase fails
  window.firebaseError = true;
}