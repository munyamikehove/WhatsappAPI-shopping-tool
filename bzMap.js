require("dotenv").config();
const axios = require("axios");

let responseMenu = [];

function mapBZ(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, countryCode, previousChatFlowMapID, userTextMessage, addressLatitude, addressLongitude, addressFull, addressName, fs, merchantListMenu, consumerListMenu, categoryListMenu) {
  let responseToUserText = {};
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "BZ0":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BZ0.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BZ2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 1 of 2 - Account Backup*\n\nWhat email address can we use to contact you if you ever lose access to this number?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ0.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "A6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok 😃. Send us a message when you need our assistance and we will respond with a menu of options.",
              },
            };
          } else {
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
        break;
      case "BZ1":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "BZ2",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "to": userPhoneNumber,
            "text": {
              "body": "*Step 1 of 2 - Account Backup*\n\nWhat email address can we use to contact you if you ever lose access to this number?",
            },
          };
        }
        break;
      case "BZ2":
        {
          if (messageType == "text") {
            if (userTextMessage.trim().length < 5) {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Oops! It seems you did not enter a valid email address 🥴.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
                },
              };
            } else {
              const re = /\S+@\S+\.\S+/;
              const rex = re.test(userTextMessage.toLowerCase());
              if (rex == false) {
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber.toLowerCase(),
                  "text": {
                    "body": "Oops! It seems you did not enter a valid email address.\nWhat email address can we use to reach you if we fail to reach you on this number?",
                  },
                };
              } else {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "chatFlowMapID": "BZ3",
                  "userEmail": userTextMessage.trim().toLowerCase(),
                  "lastMessageTimeStamp": currentMessageTimeStamp,
                }, {merge: true});

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": `You entered *${userTextMessage.trim().toLowerCase()}* as your email address. Is this correct?`,
                    },
                    "action": {
                      "buttons": [
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BZ3.YES",
                            "title": "Yes",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BZ3.NO",
                            "title": "No",
                          },
                        },
                      ],
                    },
                  },
                };
              }
            }
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber.toLowerCase(),
              "text": {
                "body": "Oops! It seems you did not enter a valid email address.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          }
        }
        break;
      case "BZ3":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BZ3.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BZ4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 2 of 2 - Business Address*\n\nPlease send us your business address as a text message.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ3.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BZ2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. Lets try again 😀.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          }
        }
        break;
      case "BZ4":
        {
          if (messageType == "text") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "addressFull": userTextMessage,
              "chatFlowMapID": "BZ5",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": `You entered\n\n*${userTextMessage}*\n\nas your address. Is this correct?`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BZ5.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BZ5.NO",
                        "title": "No",
                      },
                    },
                  ],
                },
              },
            };
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Please send us your business address as a text message.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          }
        }
        break;
      case "BZ5":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BZ5.YES") {
            // Check if user was persorming p2pTransfer or productPuchase or accountBalanceCheck or profileCheck
            if (previousChatFlowMapID == "H0") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "00",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseMenu = merchantListMenu;

              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": `${userPhoneNumber}`,
                "type": "interactive",
                "interactive": {
                  "type": "list",
                  "body": {
                    "text": "🎉 Congratulations on becoming a registered seller! 🎉\n\nTo proceed, please choose an option from the *Seller Services* menu below.",
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
            } else {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "BZ6",
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
                          "id": "BZ6.VM",
                          "title": "View Menu",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "BZ6.ST",
                          "title": "Search Tapfuma",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "BZ6.BP",
                          "title": "Browse Products",
                        },
                      },
                    ],
                  },
                },
              };
            }
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ5.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BZ4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. Lets try again 😀.\n\nPlease send us your business address as a text message.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          }
        }
        break;
      case "BZ6":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BZ6.VM") {
            responseMenu = consumerListMenu;

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
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
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ6.BP") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ6.ST") {
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
                        "id": "BZ6.VM",
                        "title": "View Menu",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BZ6.ST",
                        "title": "Search Tapfuma",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BZ6.BP",
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
          "chatFlowMapID": "BZ6",
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
                    "id": "BZ6.VM",
                    "title": "View Menu",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "BZ6.ST",
                    "title": "Search Tapfuma",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "BZ6.BP",
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
        "mapBZerror": "axios error for map BZ is:" + error.message,
        "isResolved": false,
      });
    });

    resolve();
  });
}

exports.mapBZ = mapBZ;
