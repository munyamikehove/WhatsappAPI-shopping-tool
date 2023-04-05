require("dotenv").config();
const axios = require("axios");
const moment = require("moment");

let responseMenu = [];

function mapB(userPhoneNumber, previousChatFlowMapID, chatFlowMapID, messageType, buttonReplyID, userTextMessage, currentMessageTimeStamp, countryCode, fs, consumerListMenu, categoryListMenu, cityLimits) {
  let responseToUserText = {};
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "B0":
        {
          if (messageType == "buttonReply" && buttonReplyID == "B0.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 1 of 4  -  User Name*\n\nWhat is your full name as it appears on your birth certificate?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "B0.NO") {
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
      case "B1":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "B2",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "to": userPhoneNumber,
            "text": {
              "body": "*Step 1 of 4  -  User Name*\n\nWhat is your full name as it appears on your birth certificate?",
            },
          };
        }
        break;
      case "B2":
        {
          if (messageType == "text") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B3",
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
                        "id": "B3.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "B3.NO",
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
      case "B3":
        {
          if (messageType == "buttonReply" && buttonReplyID == "B3.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 2 of 4  -  Date of Birth*\n\nWhat is your date of birth? Please enter it as M.D.YYYY\n\nE.G. A person born on October 12th, 1992 would respond 10.12.1992",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "B3.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B2",
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
      case "B4":
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
                  "chatFlowMapID": "B5",
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
                            "id": "B5.YES",
                            "title": "Yes",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "B5.NO",
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
      case "B5":
        {
          if (messageType == "buttonReply" && buttonReplyID == "B5.YES") {
            let cityLimitsText = "";
            if (cityLimits[countryCode]) {
              cityLimitsText = `*Step 3 of 4*\n*Delivery Address*\n\nPlease send us a text response of the address you would like us to deliver your packages to.\n\nPlease note, we currently limit deliveries to ${cityLimits[countryCode]}`;
            } else {
              cityLimitsText = "*Step 3 of 4*\n*We do not yet offer delivery in your country*.\n\nThis means, after you purchase a product through Tapfuma, you will have to arrange (and in some cases pay for) delivery or pickups by messaging the seller.\n\nIf you face any issues when dealing with a seller, please contact within 7 days of the purchase for dispute resolution.\n\n*Respond with 'I agree' to proceed.*";
            }

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": `${cityLimitsText}`,
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "B5.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B4",
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
      case "B6":
        {
          if (messageType == "text") {
            const homeAddress = userTextMessage.trim();
            if (cityLimits[countryCode]) {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "MTRAddress": homeAddress,
                "chatFlowMapID": "B7",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `You entered\n\n*${homeAddress}*\n\nas your home address. Is this correct?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "B7.YES",
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "B7.NO",
                          "title": "No",
                        },
                      },
                    ],
                  },
                },
              };
            } else {
              if (homeAddress == "I agree" || homeAddress == "i agree") {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "chatFlowMapID": "B8",
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
                      "text": "*Step 4 of 4 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                    },
                    "action": {
                      "buttons": [
                        {
                          "type": "reply",
                          "reply": {
                            "id": "B8.NEXT",
                            "title": "Next",
                          },
                        },
                      ],
                    },
                  },
                };
              } else {
                const cityLimitsText = "*We do not yet offer delivery in your country*.\n\nThis means, after you purchase a product through Tapfuma, you will have to arrange pickups or delivery by messaging the seller.\n\nIf you face any issues when dealing with a seller, please contact within 7 days of the purchase for dispute resolution.\n\n*Respond with 'I agree' to proceed.*";
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "text": {
                    "body": `${cityLimitsText}`,
                  },
                };
              }
            }
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "We seem to have missed your response.\n\nPlease send us your home address as a text message.",
              },
            };
          }
        }
        break;
      case "B7":
        {
          if (messageType == "buttonReply" && buttonReplyID == "B7.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B8",
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
                  "text": "*Step 4 of 4 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "B8.NEXT",
                        "title": "Next",
                      },
                    },
                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "B7.NO") {
            const cityLimitsText = `*Delivery Address*\n\nPlease send us a text response of the address you would like us to deliver your packages to.\n\nPlease note, we currently limit deliveries to ${cityLimits[countryCode]}`;


            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": `${cityLimitsText}`,
              },
            };
          }
        }
        break;
      case "B8":
        {
          if (messageType == "buttonReply" && buttonReplyID == "B8.NEXT") {
            // Check if user was persorming p2pTransfer or productPuchase or accountBalanceCheck or profileCheck
            if (previousChatFlowMapID == "E0") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "E2",
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
                    "text": "🎉 Congratulations on becoming a registered user! 🎉\n\nTo view your account balance, tap the 'Next' button below.",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "WB",
                          "title": "Next",
                        },
                      },
                    ],
                  },
                },
              };
            } else if (previousChatFlowMapID == "F0") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "F1",
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
                    "text": "🎉 Congratulations on becoming a registered user! 🎉\n\nTo send someone a giftcard to spend on Tapfuma, tap the 'Next' button below.",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "F1",
                          "title": "Next",
                        },
                      },
                    ],
                  },
                },
              };
            } else if (previousChatFlowMapID == "G0") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "G0",
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
                    "text": "🎉 Congratulations on becoming a registered user! 🎉\n\nTo view your profile, tap the 'Next' button below.",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "G0",
                          "title": "Next",
                        },
                      },
                    ],
                  },
                },
              };
            } else {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "B7",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": "🎉 Congratulations on becoming a registered user! 🎉\n\nHow can we be of further assistance today?",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "B7.VM",
                          "title": "View Menu",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "B7.ST",
                          "title": "Search Tapfuma",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "B7.BP",
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
                  "text": "*Step 4 of 4 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "B8.NEXT",
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
      case "B9":
        {
          if (messageType == "buttonReply" && buttonReplyID == "B7.VM") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "B7.BP") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "B7.ST") {
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
                        "id": "B7.VM",
                        "title": "View Menu",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "B7.ST",
                        "title": "Search Tapfuma",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "B7.BP",
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
          "chatFlowMapID": "B9",
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
                    "id": "B9.VM",
                    "title": "View Menu",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "B9.ST",
                    "title": "Search Tapfuma",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "B9.BP",
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
        "mapBerror": "axios error for map B is:" + error.message,
        "isResolved": false,
      });
    });

    resolve();
  });
}

exports.mapB = mapB;
