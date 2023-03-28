require("dotenv").config();
const axios = require("axios");

function sendWaitlistedResponse(userPhoneNumber, countryCode, currentMessageTimeStamp, fs) {
  return new Promise((resolve, reject) => {
    const docRef = fs.collection(`${countryCode}`).doc("JoinTapfuaRequest").collection(`${userPhoneNumber}`).doc("requestData");
    docRef.set({
      "userPhoneNumber": userPhoneNumber,
      "dateRequested": currentMessageTimeStamp,
    }, {merge: true});

    const responseToUserText = {
      "messaging_product": "whatsapp",
      "to": userPhoneNumber,
      "text": {
        "body": "We have added you to the waitlist and will notify you when we activate your account.\n\nFeel free to check out the application until then 😃.",
      },
    };

    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: responseToUserText,
      headers: {"Content-Type": "application/json"},
    }).catch(function(error) {
      const docRef5 = fs.collection("errors");
      docRef5.add({
        "errorMessage": "axios error readReceipt is:" + error.message,
      });
    });

    resolve();
  });
}

exports.sendWaitlistedResponse = sendWaitlistedResponse;
