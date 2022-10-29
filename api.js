require("dotenv").config();
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const axios = require("axios");
const phone = require("awesome-phonenumber");
const moment = require("moment");


const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tapfuma-12ab6-default-rtdb.firebaseio.com",
});

const fs = admin.firestore();
fs.settings({ignoreUndefinedProperties: true});

const currentDate = moment().format("YYYY/MMM/DD");
const accountBalanceChatFlowMapIDs = {"": ""};
const onboardingChatFlowMapIDs = {"A0": "A0", "A1": "A1", "A2": "A2", "A3": "A3", "A4": "A4", "A5": "A5", "A6": "A6", "A7": "A7", "A8": "A8", "A9": "A9", "A10": "A10", "A11": "A11", "A12": "A12", "A13": "A13", "A14": "A14", "A15": "A15", "A16": "A16", "A17": "A17", "A18": "A18", "A19": "A19", "A20": "A20", "A21": "A21", "A22": "A22", "A23": "A23", "A24": "A24", "A25": "A25", "A26": "A26", "A27": "A27", "A28": "A28", "A29": "A29"};
const supportedCountryCodes = {"CA": "CA", "ZA": "ZA", "LS": "LS", "SZ": "SZ", "ZW": "ZW", "BW": "BW", "ZM": "ZM", "NA": "NA", "MW": "MW", "TZ": "TZ", "KE": "KE", "BI": "BI", "RW": "RW", "UG": "UG", "US": "US", "GB": "GB", "AU": "AU", "NZ": "NZ", "IE": "IE", "GH": "GH", "NG": "NG", "LB": "LB", "AE": "AE", "QA": "QA", "BH": "BH"};
const consumerListMenu = [
  {
    "id": "",
    "title": "🔎 Search for shops",
  },
  {
    "id": "",
    "title": "🆔 View your TID",
  },
  {
    "id": "",
    "title": "💰 Top-up balance",
  },
  {
    "id": "",
    "title": "🎁 Send Zawadi",
  },
  {
    "id": "",
    "title": "💸 Make payment",
  },
  {
    "id": "",
    "title": "⚖️ Check balance",
  },
  {
    "id": "",
    "title": "🧾 View past transactions",
  },
  {
    "id": "",
    "title": "❤️‍🩹 Get support",
  },
];
const merchantListMenu = [
  {
    "id": "",
    "title": "💵 Charge customer",
  },
  {
    "id": "",
    "title": "🔄 Issue refund",
  },
  {
    "id": "",
    "title": "🧾 View past transactions",
  },
  {
    "id": "",
    "title": "🆔 View your TID",
  },
  {
    "id": "",
    "title": "⚖️ Check balance",
  },
  {
    "id": "",
    "title": "🔎 Search for shops",
  },
  {
    "id": "",
    "title": "❤️‍🩹 Get support",
  },
];
// const responseBody = [];
let userMessageBody = {};
let responseMenu = [];


router.get("/", async (req, res) =>{
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];


  if (mode && token) {
    if (mode==="subscribe" && token===process.env.TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});


router.post("/", async (req, res) => {
  const bodyParam = req.body;
  let messageType = "";
  let chatFlowMapID = "";
  let lastMessageTimeStamp = "";
  let listReplyID = "";
  let buttonReplyID = "";
  let userTextMessage = "";
  let locationLatitude = "";
  let locationLongitude = "";
  // let tapsWABAID = "";
  // let tapsPNID = "";
  let currentMessageID = "";
  let userName = "";
  let userPhoneNumber = "";
  let currentMessageTimeStamp = "";
  let countryCode = "";

  if (bodyParam != null) {
    // Filter messages to remove delivery/read status posts
    if (bodyParam.entry && bodyParam.entry[0].changes && bodyParam.entry[0].changes[0].value.messages && bodyParam.entry[0].changes[0].value.messages[0]) {
      const requestData = bodyParam.entry[0].changes[0].value.messages[0];
      const requestData2 = bodyParam.entry[0].changes[0].value.contacts[0];
      // const requestData3 = bodyParam.entry[0].changes[0].value.contacts[0];
      // const requestData4 = bodyParam.entry[0].changes[0].value.contacts[0];
      currentMessageID = requestData["id"];
      userName = requestData2.profile["name"];
      userPhoneNumber = requestData["from"];
      currentMessageTimeStamp = requestData["timestamp"];
      // tapsWABAID = requestData4["id"];
      // tapsPNID = requestData3["phone_number_id"];
      messageType = requestData["type"]; // only text, interactive and location messages


      if (messageType == "text" || messageType == "location" || messageType == "interactive") {
        if (messageType == "interactive") {
          if (`${requestData["interactive"]["type"]}` == "list_reply") {
            messageType = "listReply";
            listReplyID = requestData["interactive"]["list_reply"]["id"];

            userMessageBody = {currentMessageID,
              userName,
              userPhoneNumber,
              "lastMessageTimeStamp": currentMessageTimeStamp,
              // tapsWABAID,
              // tapsPNID,
              messageType,
              listReplyID};
          } else if (`${requestData["interactive"]["type"]}` == "button_reply") {
            messageType = "buttonReply";
            buttonReplyID = requestData["interactive"]["button_reply"]["id"];

            userMessageBody = {currentMessageID,
              userName,
              userPhoneNumber,
              "lastMessageTimeStamp": currentMessageTimeStamp,
              // tapsWABAID,
              // tapsPNID,
              messageType,
              buttonReplyID};
          }
        } else if (messageType == "text") {
          userTextMessage = requestData.text["body"];

          userMessageBody = {currentMessageID,
            userName,
            userPhoneNumber,
            "lastMessageTimeStamp": currentMessageTimeStamp,
            // tapsWABAID,
            // tapsPNID,
            messageType,
            userTextMessage};
        } else if (messageType == "location") {
          locationLatitude = requestData["location"]["latitude"];
          locationLongitude = requestData["location"]["longitude"];

          userMessageBody = {currentMessageID,
            userName,
            userPhoneNumber,
            "lastMessageTimeStamp": currentMessageTimeStamp,
            // tapsWABAID,
            // tapsPNID,
            messageType,
            locationLatitude,
            locationLongitude};
        }

        await sendReadReceipt(currentMessageID);

        const parsedNumber = phone(`+${userPhoneNumber}`);
        countryCode = parsedNumber.getRegionCode();

        if (supportedCountryCodes[countryCode]) {
          const docRef = fs.collection(`${countryCode}:userMessages`).doc(`${userPhoneNumber}`).collection(`${currentDate}`);
          docRef.add({
            userMessageBody,
          });

          const userProfile = await getUserProfile(userPhoneNumber);

          if (userProfile["exists"]) {
            const userData = userProfile["userDataObj"];
            chatFlowMapID = userData["chatFlowMapID"];
            lastMessageTimeStamp = userData["lastMessageTimeStamp"];

            switch (true) {
              case onboardingChatFlowMapIDs[chatFlowMapID] != undefined:
                await sendOnboardingResponse(userPhoneNumber, userName, chatFlowMapID, lastMessageTimeStamp, messageType, listReplyID, buttonReplyID, userTextMessage, currentMessageTimeStamp);
                break;
              case accountBalanceChatFlowMapIDs[chatFlowMapID] != undefined:
                await sendAccountBalanceResponse(userProfile, userPhoneNumber, userName);
                break;
              default:
              // code block
            }
          } else {
            await sendOnboardingResponse(userPhoneNumber, userName, chatFlowMapID, lastMessageTimeStamp, messageType, listReplyID, buttonReplyID, userTextMessage, currentMessageTimeStamp);
          }
        } else {
        // Send a coming soon message to the user
          await sendUnsupportedCountryResponse(userPhoneNumber, userName, countryCode, currentMessageTimeStamp);
        }
      } else {
        await sendUnsupportedMessageTypeResponse(userPhoneNumber, userName);
      }


      res.sendStatus(200);
    }
  }
});


function sendReadReceipt(currentMessageID) {
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
        "errorMessage": {error},
      });
    });

    resolve();
  });
}

function sendUnsupportedMessageTypeResponse(userPhoneNumber, userName) {
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
        "errorMessage": {error},
      });
    });

    resolve();
  });
}

function sendUnsupportedCountryResponse(userPhoneNumber, userName, countryCode, currentMessageTimestamp) {
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
        "errorMessage": {error},
      });
    });

    resolve();
  });
}

function getUserProfile(userPhoneNumber) {
  return new Promise((resolve, reject) => {
  // check if user is new or exisits

    const userDataRef = fs.collection("userProfiles").doc(userPhoneNumber);

    const userData = userDataRef.get().then((doc) => {
      if (doc.exists) {
        const udt = {"userDataObj": doc.data(), "exists": true};
        return udt;
      } else {
        const udt = {"exists": false};
        return udt;
      }
    }).catch((error) => {
      const udt = {"exists": false};
      return udt;
    });


    return resolve(userData);
  });
}

function sendAccountBalanceResponse(userProfile, userPhoneNumber, userName) {
  return new Promise((resolve, reject) => {
  // send response message to user
    const userProfileStatus = userProfile["exists"];
    if (userProfileStatus) {
      const userProfileObj = userProfile["userDataObj"];
      if (userProfileObj["accountType"] == "consumer") {
        responseMenu = consumerListMenu;
      } else {
        responseMenu = merchantListMenu;
      }
      const interactiveListResponse = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": `${userPhoneNumber}`,
        "type": "interactive",
        "interactive": {
          "type": "list",
          "header": {
            "type": "text",
            "text": `Hello ${userName}`,
          },
          "body": {
            "text": "Welcome to Tapfuma! How can I assist you today?",
          },
          "action": {
            "button": "Select an option",
            "sections": [
              {

                "rows": responseMenu,
              },
            ],
          },
        },
      };

      axios({
        method: "POST",
        url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
        data: interactiveListResponse,
        headers: {"Content-Type": "application/json"},
      }).catch(function(error) {
        const docRef5 = fs.collection("errors");
        docRef5.add({
          "errorMessage": {error},
        });
      });
    }

    resolve();
  });
}

function sendOnboardingResponse(userPhoneNumber, userName, chatFlowMapID, lastMessageTimeStamp, messageType, listReplyID, buttonReplyID, userTextMessage, currentMessageTimeStamp) {
  let responseToUserText = {};

  return new Promise((resolve, reject) => {
  // send response message to user

    switch (chatFlowMapID) {
      case "A1":
        {
          if (messageType == "buttonReply" && buttonReplyID == "A1.YES") {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Excellent!\nPlease enter your date of birth as MM/DD/YYYY.\n\nFor example, if you were born on the 9th of August 1992, your date of borth would be 08/09/1992.",
              },
            };

            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A2",
              userPhoneNumber,
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});
          } else if (messageType == "buttonReply" && buttonReplyID == "A1.NO") {
            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A0",
              userPhoneNumber,
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. You can check back with us when you are ready to become a user. Thank you for reaching out to us.",
              },
            };
          }
        }
        break;
      case "A2":
        {
          const minimumBirthDateObject = moment().subtract(18, "years").calendar();
          const userBirthDateObject = moment(userTextMessage).format("MMM Do YYYY");
          const minimumBirthDate = moment(minimumBirthDateObject).format("YYYY-MM-DD");
          const userBirthDate = moment(userTextMessage).format("YYYY-MM-DD");


          if (userBirthDateObject == "Invalid date") {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "You have entered an invalid date.\nPlease enter your date of birth as MM/DD/YYYY.\n\nFor example, if you were born on the 9th of August 1992, your date of borth would be 08/09/1992.",
              },
            };
          } else {
            if (moment(userBirthDate).isSameOrBefore(minimumBirthDate)) {
              const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
              docRef.set({
                "chatFlowMapID": "A3",
                userBirthDate,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `You entered ${userBirthDateObject} as your birth date. Is this correct?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "A3.YES",
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "A3.NO",
                          "title": "No",
                        },
                      },
                    ],
                  },
                },
              };
            } else {
              const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
              docRef.set({
                "chatFlowMapID": "A0",
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "You are not old enough to use this service as you are under the age of 18. We will inform you when we add parential guidance features. Thank you for choosing Tapfuma.",
                },
              };
            }
          }
        }

        break;
      case "A3":
        {
          if (messageType == "buttonReply" && buttonReplyID == "A3.YES") {
            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A4",
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Awesome!\nStarting with your first name, please enter your full name as it appears on your birth certificate.\n\nFor example, if your last name is Moyo and your first name is Tawanda, your response would be *Tawanda* *Moyo*.",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "A3.NO") {
            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A2",
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Ok, lets try that again.\nPlease enter your date of birth as MM/DD/YYYY.\n\nFor example, if you were born on the 9th of August 1992, your date of borth would be 08/09/1992.",
              },
            };
          }
        }
        break;
      case "A4":
        {
          if (userTextMessage.trim().length === 0) {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Oops! It seems you did not enter a name.\nStarting with your first name, please enter your full name as it appears on your birth certificate.\n\nFor example, if your last name is Moyo and your first name is Tatenda, your response would be *Tatenda* *Moyo*.",
              },
            };
          } else {
            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A5",
              "userName": userTextMessage,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": `You entered *${userTextMessage}* as your full name. Is this correct?`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "A5.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "A5.NO",
                        "title": "No",
                      },
                    },
                  ],
                },
              },
            };
          }
        }
        break;
      case "A5":
        {
          if (messageType == "buttonReply" && buttonReplyID == "A5.YES") {
            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A6",
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "We're almost done setting up your account!\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "A5.NO") {
            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A4",
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "No worries, lets try again.\nStarting with your first name, please enter your full name as it appears on your birth certificate.\n\nFor example, if your last name is Moyo and your first name is Tatenda, your response would be *Tatenda* *Moyo*.",
              },
            };
          }
        }
        break;
      case "A6":
        {
          if (userTextMessage.trim().length === 0) {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Oops! It seems you did not enter a valid email address.\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          } else {
            const re = /\S+@\S+\.\S+/;
            const rex = re.test(userTextMessage.toLowerCase());
            if (rex == false) {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Oops! It seems you did not enter a valid email address.\nWhat email address can we use to reach you if we fail to reach you on this number?",
                },
              };
            } else {
              const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
              docRef.set({
                "chatFlowMapID": "A7",
                "userEmail": userTextMessage,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `You entered *${userTextMessage}* as your email address. Is this correct?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "A7.YES",
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "A7.NO",
                          "title": "No",
                        },
                      },
                    ],
                  },
                },
              };
            }
          }
        }
        break;
      case "A7":
        {
          if (messageType == "buttonReply" && buttonReplyID == "A7.YES") {
            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A8",
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": "16473739305",
              "type": "interactive",
              "interactive": {
                "type": "button",
                "header": {
                  "type": "image",
                  "image": {
                    "link": "https://tapsimagestorage.web.app/images/pay.jpg",
                  },
                },
                "body": {
                  "text": "A *General account* is used to make purchases with Tapfuma merchants, and for peer-to-peer transfers.\n\nTapfuma does not charge for peer-to-peer transfers.\nTapfuma does not charge monthly or annual fees.\nTapfuma has no required minimium account balance.\n",
                },
                "footer": {
                  "text": "You cannot withdraw money from a general account.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "A8.NEXT1",
                        "title": "Next",
                      },
                    },

                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "A7.NO") {
            const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
            docRef.set({
              "chatFlowMapID": "A6",
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "No worries, lets try again.\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          }
        }
        break;
      case "A8":
        {
          if (messageType == "buttonReply" && buttonReplyID == "A8.NEXT1") {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": "16473739305",
              "type": "interactive",
              "interactive": {
                "type": "button",
                "header": {
                  "type": "image",
                  "image": {
                    "link": "https://tapsimagestorage.web.app/images/pay.jpg",
                  },
                },
                "body": {
                  "text": "A *Merchant account* is used to accept payments for goods and services you sell.\n\nYou can access your sales through the Visa/Mastercard that we will send to you once your merchant account is approved.\nTo be approved as a merchant, you must have a WhatsApp business account with products in your catalog. You products must be priced in your local currency.\nThe balance in your Merchant account is stored in USD, even when you make sales  in your local currency.",
                },
                "footer": {
                  "text": "Merchant accounts cannot make peer-to-peer transfers.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "A8.NEXT2",
                        "title": "Next",
                      },
                    },

                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "A7.NEXT2") {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": "16473739305",
              "type": "interactive",
              "interactive": {
                "type": "button",
                "header": {
                  "type": "image",
                  "image": {
                    "link": "https://tapsimagestorage.web.app/images/card.png",
                  },
                },
                "body": {
                  "text": "*Merchant accout* (continued)\n\nTapfuma does not charge payment processing fees.\nTapfuma does not charge monthly or annual fees.\nTapfuma has no required minimium account balance.\n As a Merchant, you get unlimited free transactions when you make purchases online or at any point-of-sale using your Tapfuma provided Visa/Mastercard .",
                },
                "footer": {
                  "text": "ATM withdrawals cost 7% amount withdrawn plus ATM fees.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "A8.NEXT3",
                        "title": "Next",
                      },
                    },

                  ],
                },
              },
            };
          }
          // else if (messageType == "buttonReply" && buttonReplyID == "A7.NEXT3") {

          // }
        }
        break;
      case "A9":

        break;
      case "A10":

        break;
      case "A11":

        break;
      case "A12":

        break;
      case "A13":

        break;
      case "A14":

        break;
      case "A15":

        break;
      case "A16":

        break;
      case "A17":

        break;
      case "A18":

        break;
      case "A19":

        break;
      case "A20":

        break;
      case "A21":

        break;
      case "A22":

        break;
      case "A23":

        break;
      case "A24":

        break;
      case "A25":

        break;
      case "A26":

        break;
      case "A27":

        break;
      case "A28":

        break;
      case "A29":

        break;

      default:
      {
        const docRef = fs.collection("userProfiles").doc(userPhoneNumber);
        docRef.set({
          "chatFlowMapID": "A1",
          userPhoneNumber,
          "lastMessageTimeStamp": currentMessageTimeStamp,
        }, {merge: true});

        responseToUserText = {
          "messaging_product": "whatsapp",
          "to": userPhoneNumber,
          "type": "interactive",
          "interactive": {
            "type": "button",
            "body": {
              "text": `Welcome ${userName}. It looks like you are not yet a registered user. Would you like to join Tapfuma today?`,
            },
            "action": {
              "buttons": [
                {
                  "type": "reply",
                  "reply": {
                    "id": "A1.YES",
                    "title": "Yes",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "A1.NO",
                    "title": "No",
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
      const docRef5 = fs.collection("errors");
      docRef5.add({
        "errorMessage": {error},
      });
    });


    resolve();
  });
}


router.put("/:id", async (req, res) => {
  res.send({"Hello": "PUT"});
});

router.delete("/:id", async (req, res) => {
  res.send({"Hello": "DELETE"});
});

module.exports = router;

