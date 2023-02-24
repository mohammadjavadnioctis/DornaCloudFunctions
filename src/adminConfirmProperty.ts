/* eslint-disable @typescript-eslint/no-var-requires */
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
// import sendGridClient = require("@sendgrid/mail");
// import SibApiV3Sdk = require("sib-api-v3-sdk");
const SibApiV3Sdk = require("sib-api-v3-sdk");


// interface SendGridEmailData {
//     //   emailAddress: string;
//     //   firstName: string;
// }

export const onPropertyRegistragionSendAdminEmailHandler = async (
    snapshot: FirebaseFirestore.DocumentSnapshot,
    context: functions.EventContext
) => {
  // sendGridClient.setApiKey(functions.config().send_grid.api_key);

  const emailDelayInSeconds = 30;
  //   const sendGridTemplateId = "d-3cffd915cb0f402caeec6f51c4cfcca5";
  const propertyId: string = context.params.propertyId;
  const params: any = context.params;
  const docRef = await admin.firestore().collection("testproperties").doc("6GgqRR3hdIvcDiTyTTYt");
  docRef.get().then((doc) => {
    if (doc.exists) {
      console.log("Document data Brother:", doc.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });

  // console.log("the ref brother", ref);
  // const propertyInfo = await (await admin.firestore().collection("users").doc(propertyId).
  //     get().then((property) => property.data()));
  // console.log("this is the property info:", propertyInfo);
  // Ensure the document contains an email address and first name

  //   if (!emailAddress) {
  //     console.error(
  //   new Error('Missing emailAddress
  //   or firstName on user document. Aborting.')
  //     );
  //     return;
  //   }

  try {
    // const sendGridEmailBody: any = {
    //   //   firstName,
    //   //   emailAddress
    // };
    await writePropertyMetaData(propertyId, emailDelayInSeconds);
    // await triggerSendGridEmail(
    //     sendGridEmailBody,
    //     sendGridTemplateId,
    //     emailDelayInSeconds
    // );
    await sendEmailUsingSendinBlue(propertyId, params);
  } catch (error) {
    console.error(error);
    return;
  }
};


// const triggerSendGridEmail = (
//     emailData: any,
//     templateId: string,
//     delayInSeconds: number
// ): Promise<any> => {
//   const mailData = {
//     to: "mjsweb.sitesend@gmail.com",
//     from: "mohammadjavadnoctis2@gmail.com",
//     send_at: moment()
//         .add(delayInSeconds, "seconds")
//         .unix(),
//     templateId,
//     dynamic_template_data: {
//     },
//   };
//   return sendGridClient.send(mailData);
// };

const writePropertyMetaData = (
    propertyId: string,
    delay: number
): Promise<string | FirebaseFirestore.Transaction> => {
  const docRef = admin
      .firestore()
      .doc(`emails/${propertyId}/transactional/accountCreation`);

  return admin.firestore().runTransaction(async (transaction) => {
    const metaData = {
      delay,
      propertyId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const emailDoc = await transaction.get(docRef);
    if (emailDoc.exists) {
      return Promise.reject(
          new Error(`property document at
           ${docRef.path} already exists. Aborting`)
      );
    }
    return transaction.create(docRef, metaData);
  });
};


const sendEmailUsingSendinBlue = (propertyId: string, params: any) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;

  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = functions.config().sendinblue.key;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "My subject {{params.subject}}";
  sendSmtpEmail.htmlContent = `<html><body><h1>This is my first transactional email
   {{params.parameter}}</h1>this is the params ${params}</body></html>`;
  sendSmtpEmail.sender = {"name": "MJ Rezaei", "email": "mohammadjavadnoctis2@gmail.com"};
  sendSmtpEmail.to = [{"email": "mjsweb.sitesend@gmail.com", "name": "MJ Rezaei 2"}];
  sendSmtpEmail.replyTo = {"email": "replyto@domain.com", "name": "John Doe"};
  sendSmtpEmail.headers = {"Some-Custom-Name": "unique-id-1234"};
  sendSmtpEmail.params = {"parameter": "My param value", "subject": "New Subject"};

  apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data: any) {
    console.log("API called successfully. Returned data: " + JSON.stringify(data));
  }, function(error: any) {
    console.error(error);
  });
};
