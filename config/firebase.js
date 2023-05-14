const firebase = require("firebase");
const firebaseConfig = {
  apiKey: "AIzaSyDmthqeHVkmZ0TBfLCle2jOtJWjXPUxFQ8",
    authDomain: "testfirebase-d7fd2.firebaseapp.com",
    projectId: "testfirebase-d7fd2",
    storageBucket: "testfirebase-d7fd2.appspot.com",
    messagingSenderId: "210803812532",
    appId: "1:210803812532:web:bec029f3792061c58f4fe1",
    measurementId: "G-LKDWQQMQKP"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const User = db.collection("Users");
module.exports = User;
