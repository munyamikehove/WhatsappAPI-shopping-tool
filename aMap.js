require("dotenv").config();
const axios = require("axios");

let responseMenu = [];

function mapA(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, countryCode, fs, consumerListMenu, categoryListMenu) {
  let responseToUserText = {};
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "A1":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A2",
            "registeredMerchant": false,
            "registeredUser": false,
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userPhoneNumber,
            "type": "interactive",
            "interactive": {
              "type": "button",
              "header": {
                "type": "image",
                "image": {
                  "link": "https://tapsimagestorage.web.app/images/welcome.png",
                },
              },
              "body": {
                "text": `Hello ${userName},\nand welcome to Tapfuma! 😃\n\nBefore you get started, allow us to introduce ourselves.\n\nTapfuma is a chat application you can use to buy or sell products on Whatsapp.`,
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "A2",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "A2":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A3",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userPhoneNumber,
            "type": "interactive",
            "interactive": {
              "type": "button",
              "header": {
                "type": "image",
                "image": {
                  "link": "https://tapsimagestorage.web.app/images/general_account.png",
                },
              },
              "body": {
                "text": "To buy products on Tapfuma, send us a Whatsapp message and we will respond with a menu. Choose the search or browse menu options to find products to buy.\n\nWhen you find a product you like, simply pay for it using your Whatsapp connected *Tapfuma Wallet*, and we will deliver the product to your door-step.",
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "A3",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "A3":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A4",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userPhoneNumber,
            "type": "interactive",
            "interactive": {
              "type": "button",
              "header": {
                "type": "image",
                "image": {
                  "link": "https://tapsimagestorage.web.app/images/merchant_account.jpg",
                },
              },
              "body": {
                "text": "Selling products on Tapfuma is just as easy. Simply send us a whatsapp message and we will respond with a menu. Use the list products menu options to list products to sell.\n\nWhen you make a sale, we will handle product delivery. Three days after product delivery, your sales will be available to pick up as cash at any Western Union, WorldRemit or Mukuru money transfer agency.",
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "A4",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "A4":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A5",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userPhoneNumber,
            "type": "interactive",
            "interactive": {
              "type": "button",
              "header": {
                "type": "image",
                "image": {
                  "link": "https://tapsimagestorage.web.app/images/free_services.png",
                },
              },
              "body": {
                "text": "Tapfuma accounts are free to use for both buyers and sellers!\n\n➣ We will never charge you to list, search for or buy products on our platform.\n\n➣ We do not charge payment processing fees for transactions on Tapfuma.\n\n➣ All peer-to-peer transfers are unlimited and free.",
              },
              "footer": {
                "text": "We only charge sellers 10% to withdraw sales.",
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "A5",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "A5":
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
                "text": "*Important shortcuts*\n\nSend the letter:\n'X' to return home\n'S' to search for a product\n'M' for the menu\n'B' to browse products\n\nNow that you know about us, how can we be of assistance today?",
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
        break;
      case "A6":
        {
          if (messageType == "buttonReply" && buttonReplyID == "A6.VM") {
            responseMenu = consumerListMenu;
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set( {
              "chatFlowMapID": "00",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": `${userPhoneNumber}`,
              "type": "interactive",
              "interactive": {
                "type": "list",
                "body": {
                  "text": "Please pick an option from the menu below.",
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
          } else if (messageType == "buttonReply" && buttonReplyID == "A6.BP") {
            responseMenu = categoryListMenu;

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "D2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": `${userPhoneNumber}`,
              "type": "interactive",
              "interactive": {
                "type": "list",
                "body": {
                  "text": "Please pick a category from the menu below.",
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
          } else if (messageType == "buttonReply" && buttonReplyID == "A6.ST") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "C2",
              "currentBrowseProductsIndex": 0,
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "What product are you looking for today?",
              },
            };
          } else {
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
        "mapAerror": "axios error for map A is:" + error.message,
        "isResolved": false,
      });
    });

    resolve();
  });
}

exports.mapA = mapA;

