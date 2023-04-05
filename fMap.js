require("dotenv").config();
const axios = require("axios");

function mapF(chatFlowMapID, fs, countryCode, userPhoneNumber, currentMessageTimeStamp) {
  let responseToUserText = {};

  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "F1":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "F2",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userPhoneNumber,
            "type": "interactive",
            "interactive": {
              "type": "button",
              "body": {
                "text": "*Gift card guide*\n\nSending money through a giftcard allows your friend or family member to transact on Tapfuma.\n\nYour friend or family member must be a registered Tapfuma user.\n\nAll gift cards are denominated in USD. When you send a gift card, we will add the local currency equivalent to your recipients Tapfuma wallet.\n\nTapfuma is not a remittance service, money transfer service or banking service.\nThe money you send as a giftcard cannot be withdrawn as cash by your recipient.",
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "F2",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "F2":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A6",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "to": userPhoneNumber,
            "text": {
              "body": "Use the link to send a giftcard to your friend or family member.\n\nhttps://buy.stripe.com/7sI8za4Yzgj617q8wx",
            },
          };
        }
        break;
      default:
      {
        const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
        docRef.set({
          "chatFlowMapID": "A6",
          "lastMessageTimeStamp": currentMessageTimeStamp,
        }, {merge: true});

        responseToUserText = {
          "messaging_product": "whatsapp",
          "to": userPhoneNumber,
          "type": "interactive",
          "interactive": {
            "type": "button",
            "body": {
              "text": " How can we be of assistance today?",
            },
            "action": {
              "buttons": [
                {
                  "type": "reply",
                  "reply": {
                    "id": "A6.VM",
                    "title": "View Menu",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "A6.ST",
                    "title": "Search Tapfuma",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "A6.BP",
                    "title": "Browse Products",
                  },
                },
              ],
            },
          },
        };
      }
    }


    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: responseToUserText,
      headers: {"Content-Type": "application/json"},
    }).catch(function(error) {
      const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
      docRef.add({
        "mapAerror": "axios error for map E is:" + error.message,
        "isResolved": false,
      });
    });


    resolve();
  });
}

exports.mapF = mapF;
