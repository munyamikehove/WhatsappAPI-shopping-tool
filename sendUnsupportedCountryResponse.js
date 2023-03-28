require("dotenv").config();
const axios = require("axios");

function sendUnsupportedCountryResponse(userPhoneNumber, userName, countryCode, currentMessageTimestamp, fs) {
  return new Promise((resolve, reject) => {
    // Send a coming soon message to the user
    const textResponse = {
      "messaging_product": "whatsapp",
      "to": userPhoneNumber,
      "text": {
        "body": `Hi ${userName}. We do not yet provide service to users in your country. Please check back with us soon.`,
      },
    };

    const docRef = fs.collection("stats").doc("unservedUserInterest").collection(`${countryCode}`);
    docRef.add({
      countryCode: `${currentMessageTimestamp}`,
    });

    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: textResponse,
      headers: {"Content-Type": "application/json"},
    }).catch(function(error) {
      const docRef5 = fs.collection("errors");
      docRef5.add({
        "errorMessage": "axios error for unsupportedCountry is:" + error.message,
      });
    });

    resolve();
  });
}

exports.sendUnsupportedCountryResponse = sendUnsupportedCountryResponse;
