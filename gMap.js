require("dotenv").config();
const axios = require("axios");
const moment = require("moment");

function mapG(chatFlowMapID, fs, countryCode, userPhoneNumber, currentMessageTimeStamp, addressFull, messageType, stripeCustomer, govIssuedIDType, govIssuedPhotoID, officialUserName, userBirthDate, MTRAddress, userTextMessage, authyID) {
  let responseToUserText = {};

  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "G1":
        {
          if (messageType == "text") {
            const a = userTextMessage.trim();
            const b = a.replace(/\s/g, "");
            const authyCode = b;


            if (authyCode.length == 7) {
              axios({
                method: "GET",
                url: `https://api.authy.com/protected/json/verify/${authyCode}/${authyID}`,
                headers: {"X-Authy-API-Key": `${process.env.AUTHY_API_KEY}`},
              }).then((res) => {
                if (res.data["success"] == "true" || res.data["success"] == true) {
                  let balance = 0;
                  const currency = stripeCustomer["currency"].toUpperCase();
                  if (countryCode != "UG" && countryCode != "RW") {
                    balance = stripeCustomer["balance"]/-100;
                  } else {
                    balance = stripeCustomer["balance"]/-1;
                  }

                  const userBirthDateObject = moment(userBirthDate).format("MMM Do YYYY");

                  let govIssuedIDTypeString = "";
                  if (govIssuedIDType == "PP") {
                    govIssuedIDTypeString = "Passport number";
                  } else {
                    govIssuedIDTypeString = "National ID number";
                  }


                  const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                  docRef.set({
                    "chatFlowMapID": "A6",
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
                        "text": `*Your Profile*:\n\nFull Name:\n${officialUserName}\n\nDOB:\n${userBirthDateObject}\n\n${govIssuedIDTypeString}:\n${govIssuedPhotoID}\n\nCurrent balance:\n${balance} ${currency}\n\nResidential address:\n${MTRAddress}\n\nBusiness address:\n${addressFull}`,
                      },
                      "action": {
                        "buttons": [
                          {
                            "type": "reply",
                            "reply": {
                              "id": "A6",
                              "title": "Continue",
                            },
                          },
                        ],
                      },
                    },
                  };

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
                } else {
                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "to": userPhoneNumber,
                    "text": {
                      "body": "We could not verify the authy code. Please try again or contact Tapfuma support if this problem persists.",
                    },
                  };

                  axios({
                    method: "POST",
                    url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
                    data: responseToUserText,
                    headers: {"Content-Type": "application/json"},
                  }).catch(function(error) {
                    const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
                    docRef.add({
                      "mapAerror": "axios error for map G is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }
              }).catch(function(error) {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
                docRef.add({
                  "mapDerror": "axios error for map G1 is:" + error.message,
                  "isResolved": false,
                });

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "text": {
                    "body": "We could not verify the authy code. Please try again or contact Tapfuma support if this problem persists.",
                  },
                };

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
              });
            } else {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "To access this feature, please send us the Tapfuma token from your Authy app.\n\nYou can respond 'X' to return home.",
                },
              };

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
            }
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "To access this feature, please send us the Tapfuma token from your Authy app.\n\nYou can respond 'X' to return home.",
              },
            };

            axios({
              method: "POST",
              url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
              data: responseToUserText,
              headers: {"Content-Type": "application/json"},
            }).catch(function(error) {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
              docRef.add({
                "mapAerror": "axios error for map G is:" + error.message,
                "isResolved": false,
              });
            });
          }
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


    resolve();
  });
}

exports.mapG = mapG;
