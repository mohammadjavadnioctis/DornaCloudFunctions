import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {onPropertyRegistragionSendAdminEmailHandler}
  from
  "./adminConfirmProperty";
// var admin = require("firebase-admin");
// var serviceAccount = require("");

admin.initializeApp();

const adminDb = admin.firestore();


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//


export const createUserDocument = functions.auth.user().onCreate((user) => {
  adminDb
      .collection("users")
      .doc(user.uid)
      .set(JSON.parse(JSON.stringify(user)));
});


export const onPropertyCreationSendEmailToAdmin = functions.firestore
    .document("testproperties/{propertyId}")
// .collection("users")
    .onCreate(onPropertyRegistragionSendAdminEmailHandler);
