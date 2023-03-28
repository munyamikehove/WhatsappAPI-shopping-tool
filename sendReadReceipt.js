require("dotenv").config();
const axios = require("axios");

function sendReadReceipt(currentMessageID, fs) {
  return new Promise((resolve, reject) => {
    // Send a read receipt
    const messageReadResponse = {
      "messaging_product": "whatsapp",
      "status": "read",
      "message_id": `${currentMessageID}`,
    };

    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: messageReadResponse,
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

exports.sendReadReceipt = sendReadReceipt;
