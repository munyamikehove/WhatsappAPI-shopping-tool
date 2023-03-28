require("dotenv").config();
const axios = require("axios");

function sendUnsupportedMessageTypeResponse(userPhoneNumber, userName, fs) {
  return new Promise((resolve, reject) => {
    // Send a coming soon message to the user
    const textResponse = {
      "messaging_product": "whatsapp",
      "to": userPhoneNumber,
      "text": {
        "body": `Hi ${userName}. Please send us a text message or a whatsapp location message. We currently do not support messages containing documents, contacts or images.`,
      },
    };

    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: textResponse,
      headers: {"Content-Type": "application/json"},
    }).catch(function(error) {
      const docRef5 = fs.collection("errors");
      docRef5.add({
        "errorMessage": "axios error unsupportedMessage is:" + error.message,
      });
    });

    resolve();
  });
}

exports.sendUnsupportedMessageTypeResponse = sendUnsupportedMessageTypeResponse;
