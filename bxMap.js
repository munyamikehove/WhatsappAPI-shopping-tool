require("dotenv").config();
const axios = require("axios");
const moment = require("moment");

let responseMenu = [];

function mapBX(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, countryCode, previousChatFlowMapID, userTextMessage, addressLatitude, addressLongitude, addressFull, addressName, fs, merchantListMenu, consumerListMenu, categoryListMenu) {
  let responseToUserText = {};
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "BX0":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX0.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 1 of 5  -  User Name*\n\nWhat is your full name as it appears on your birth certificate?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX0.NO") {
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
      case "BX1":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "BX2",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "to": userPhoneNumber,
            "text": {
              "body": "*Step 1 of 5  -  User Name*\n\nWhat is your full name as it appears on your birth certificate?",
            },
          };
        }
        break;
      case "BX2":
        {
          if (messageType == "text") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX3",
              "userName": userTextMessage.trim(),
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": `You entered *${userTextMessage.trim()}* as your full name. Is this correct?`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX3.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX3.NO",
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
                "body": "What is your full name as it appears on your birth certificate?\n\nWe need this information for account recovery if you ever lose access to this phone number.",
              },
            };
          }
        }
        break;
      case "BX3":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX3.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 2 of 5  -  Date of Birth*\n\nWhat is your date of birth? Please enter it as M.D.YYYY\n\nE.G. A person born on October 12th, 1992 would respond 10.12.1992",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX3.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. Lets try again 😀.\n\nWhat is your full name as it appears on your birth certificate?\n\nWe need this information for account recovery if you ever lose access to this phone number.",
              },
            };
          }
        }
        break;
      case "BX4":
        {
          if (messageType == "text") {
            const minimumBirthDateObject = moment().subtract(18, "years").calendar();
            const userBirthDateObject = moment(userTextMessage).format("MMM Do YYYY");
            const minimumBirthDate = moment(minimumBirthDateObject).format("YYYY-MM-DD");
            const userBirthDate = moment(userTextMessage).format("YYYY-MM-DD");

            if (userBirthDateObject == "Invalid date") {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "You have entered an invalid date 😵‍💫.\n\nPlease enter your date of birth following the M.D.YYYY format.\n\nFor example, if you were born on the 9th of August 1992, your date of borth would be 8.9.1992",
                },
              };
            } else {
              if (moment(userBirthDate).isSameOrBefore(minimumBirthDate)) {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "chatFlowMapID": "BX5",
                  userBirthDate,
                  "lastMessageTimeStamp": currentMessageTimeStamp,
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
                            "id": "BX5.YES",
                            "title": "Yes",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BX5.NO",
                            "title": "No",
                          },
                        },
                      ],
                    },
                  },
                };
              } else {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "chatFlowMapID": "00",
                  "lastMessageTimeStamp": currentMessageTimeStamp,
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
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "You have entered an invalid date 😵‍💫.\n\nPlease enter your date of birth following the M.D.YYYY format.\n\nFor example, if you were born on the 9th of August 1992, your date of borth would be 8.9.1992",
              },
            };
          }
        }
        break;
      case "BX5":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX5.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 3 of 5 - Account Backup*\n\nWhat email address can we use to contact you if you ever lose access to this number?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX5.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. Lets try again 😀.\n\nPlease enter your date of birth following the M.D.YYYY format.\n\nFor example, if you were born on the 9th of August 1992, your date of borth would be 8.9.1992",
              },
            };
          }
        }
        break;
      case "BX6":
        {
          if (messageType == "text") {
            if (userTextMessage.trim().length < 6) {
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
                  "chatFlowMapID": "BX7",
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
                            "id": "BX7.YES",
                            "title": "Yes",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BX7.NO",
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
      case "BX7":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX7.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX8",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 4 of 5 - Business Address*\n\nPlease send us your business address as a text message.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX7.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX6",
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
      case "BX8":
        {
          if (messageType == "text") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "addressFull": userTextMessage,
              "chatFlowMapID": "BX9",
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
                        "id": "BX9.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX9.NO",
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
      case "BX9":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX9.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX10",
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
                    "link": "https://tapsimagestorage.web.app/images/authy.jpeg",
                  },
                },
                "body": {
                  "text": "*Step 5 of 5 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX10.NEXT",
                        "title": "Next",
                      },
                    },
                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX9.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX8",
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
      case "BX10":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX10.NEXT") {
            // Check if user was performing gated action
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
                "chatFlowMapID": "BX11",
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
                          "id": "BX11.VM",
                          "title": "View Menu",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "BX11.ST",
                          "title": "Search Tapfuma",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "BX11.BP",
                          "title": "Browse Products",
                        },
                      },
                    ],
                  },
                },
              };
            }
          } else {
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
                    "link": "https://tapsimagestorage.web.app/images/authy.jpeg",
                  },
                },
                "body": {
                  "text": "*Step 5 of 5 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX10.NEXT",
                        "title": "Next",
                      },
                    },
                  ],
                },
              },
            };
          }
        }
        break;
      case "BX11":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX11.VM") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "BX11.BP") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "BX11.ST") {
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
                        "id": "BX11.VM",
                        "title": "View Menu",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX11.ST",
                        "title": "Search Tapfuma",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX11.BP",
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
          "chatFlowMapID": "BX11",
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
                    "id": "BX11.VM",
                    "title": "View Menu",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "BX11.ST",
                    "title": "Search Tapfuma",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "BX11.BP",
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
        "mapBXerror": "axios error for map BX is:" + error.message,
        "isResolved": false,
      });
    });

    resolve();
  });
}

exports.mapBX = mapBX;
