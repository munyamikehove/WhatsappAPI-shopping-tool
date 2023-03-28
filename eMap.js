require("dotenv").config();
const axios = require("axios");
const moment = require("moment");

function mapE(chatFlowMapID, fs, countryCode, userPhoneNumber, currentMessageTimeStamp, buttonReplyID, currencyPrefix, currentUSDExchangeRates, messageType, stripeCustomer, govIssuedIDType, govIssuedPhotoID, officialUserName, userBirthDate, MTRAddress, minimumWithdrawalThreshold, userTextMessage, supportedCurrencyCodes, stripe, stripeCustomerID, authyID) {
  let responseToUserText = {};

  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "E1":
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


                  const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                  docRef.set({
                    "chatFlowMapID": "E2",
                    "lastMessageTimeStamp": currentMessageTimeStamp,
                  }, {merge: true});

                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "to": userPhoneNumber,
                    "type": "interactive",
                    "interactive": {
                      "type": "button",
                      "body": {
                        "text": `Your current Tapfuma wallet balance is *${balance} ${currency}*.\n\nWhat would you like to do next?`,
                      },
                      "action": {
                        "buttons": [
                          {
                            "type": "reply",
                            "reply": {
                              "id": "TB",
                              "title": "Top-up Balance",
                            },
                          },
                          {
                            "type": "reply",
                            "reply": {
                              "id": "WB",
                              "title": "Withdraw Balance",
                            },
                          },
                          {
                            "type": "reply",
                            "reply": {
                              "id": "BH",
                              "title": "Back home",
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
                      "mapAerror": "axios error for map E is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }
              }).catch(function(error) {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
                docRef.add({
                  "mapDerror": "axios error for map E1 is:" + error.message,
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
                "mapAerror": "axios error for map E is:" + error.message,
                "isResolved": false,
              });
            });
          }
        }
        break;
      case "E2":
        {
          if (messageType == "buttonReply" && buttonReplyID == "TB") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E3",
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
                  "text": "*Top-up guide*\n\nAdding money to your Tapfuma wallet allows you to transact on Tapfuma.\n\nAdd money to your Tapfuma wallet using any supported payment method.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "E3",
                        "title": "Next",
                      },
                    },

                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BH") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "WB") {
            let balance = 0;
            const currency = stripeCustomer["currency"].toUpperCase();
            if (countryCode != "UG" && countryCode != "RW") {
              balance = stripeCustomer["balance"]/-100;
            } else {
              balance = stripeCustomer["balance"]/-1;
            }

            if (balance >= minimumWithdrawalThreshold[countryCode]) {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "E6",
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
                    "text": `You have ${balance} ${currency} available to withdraw.\n\nWe will send this entire amount to you within the next 24 hours using WorldRemit, Western Union, or Mukuru money transfer.\n\nYou will receive a transaction reference number once we have sent the funds.`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "E3",
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
                "chatFlowMapID": "A6",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": `You have ${balance} ${currency} in your account.\n\nThe minimum amount you can withdraw from your account is ${minimumWithdrawalThreshold[countryCode]} ${currency}.\n\nPlease contact support if you need further assistance.`,
                },
              };
            }
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": "We seem to have missed your response. What would you like to do next?",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "TB",
                        "title": "Top-up Balance",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BH",
                        "title": "Return home",
                      },
                    },
                  ],
                },
              },
            };
          }
        }
        break;
      case "E3":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "E4",
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
                "text": "We support payments through\n\nVisa, Mastercard, American Express, Discover, Diners Club, JCB, China UnionPay, Alipay, WeChat Pay, Klarna, Affirm, Afterpay / Clearpay, Cash App Pay, Apple Pay, Google Pay, Giropay, iDEAL, EPS, and Bancontact.",
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "E3",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "E4":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "E5",
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
                "text": `We will bill your payment method in USD and deposit the corresponding amount to your Tapfuma wallet in your local currency (${currencyPrefix[countryCode]}).\n\n 1 USD = ${currentUSDExchangeRates[countryCode]} ${currencyPrefix[countryCode]}`,
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "E5",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "E5":
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
              "body": "Use this link to add money to your Tapfuma wallet:\n\nhttps://buy.stripe.com/bIYdTu3Uv9UI7vObII",
            },
          };
        }
        break;
      case "E6":
        {
          if (govIssuedIDType && govIssuedPhotoID) {
            const userBirthDateObject = moment(userBirthDate).format("MMM Do YYYY");

            let govIssuedIDTypeString = "";
            if (govIssuedIDType == "PP") {
              govIssuedIDTypeString = "passport number";
            } else {
              govIssuedIDTypeString = "national ID number";
            }

            let balance = 0;
            const currency = stripeCustomer["currency"].toUpperCase();
            if (countryCode != "UG" && countryCode != "RW") {
              balance = stripeCustomer["balance"]/-100;
            } else {
              balance = stripeCustomer["balance"]/-1;
            }

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E12",
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
                  "text": `Here are the details we will provide to the money transfer agent, please confirm that they are accurate:\n\nRecipient Name:\n${officialUserName}\n\nRecipient DOB:\n${userBirthDateObject}\n\nRecipient ${govIssuedIDTypeString}:\n${govIssuedPhotoID}\n\nExpected payout:\n${balance} ${currency}\n\nRecipient address:\n${MTRAddress}`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "CS",
                        "title": "Contact Support",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "CP",
                        "title": "Confirm Payout",
                      },
                    },
                  ],
                },
              },
            };
          } else {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E7",
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
                  "text": "What government-issued photo ID do you intend to use to collect your cash ?",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "PP",
                        "title": "Passport",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "NID",
                        "title": "National ID",
                      },
                    },
                  ],
                },
              },
            };
          }
        }
        break;
      case "E7":
        {
          if (messageType == "buttonReply" && buttonReplyID == "PP") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E8",
              "govIssuedIDType": "PP",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "What is your passport number?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "NID") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E8",
              "govIssuedIDType": "NID",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "What is your national ID number?",
              },
            };
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": "We seem to have missed your response.\n\nWhat government-issued photo ID do you intend to use to collect your cash ?",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "PP",
                        "title": "Passport",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "NID",
                        "title": "National ID",
                      },
                    },
                  ],
                },
              },
            };
          }
        }
        break;
      case "E8":
        {
          if (messageType == "text") {
            if (govIssuedIDType == "PP") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "E9",
                "govIssuedPhotoID": `${userTextMessage.trim()}`,
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `You entered\n\n*${userTextMessage.trim()}*\n\nas your passport number. Is this correct?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "E9.YES",
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "E9.NO",
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
                "chatFlowMapID": "E9",
                "govIssuedPhotoID": `${userTextMessage.trim()}`,
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `You entered\n\n*${userTextMessage.trim()}*\n\nas your national ID number. Is this correct?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "E9.YES",
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "E9.NO",
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
      case "E9":
        {
          if (messageType == "buttonReply" && buttonReplyID == "E9.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E10",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Money Transfer Recipient Address*\n\nPlease send us your home address as a text message.",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "E9.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E7",
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
                  "text": "No worries. Let's try again.\n\nWhat government-issued photo ID do you intend to use to collect your cash ?",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "PP",
                        "title": "Passport",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "NID",
                        "title": "National ID",
                      },
                    },
                  ],
                },
              },
            };
          } else {
            let idType = "";
            if (govIssuedIDType == "PP") {
              idType = "national ID";
            } else {
              idType = "passport";
            }

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": `We seem to have missed your response. You entered\n\n*${govIssuedPhotoID}*\n\nas your ${idType} number. Is this correct?`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "E9.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "E9.NO",
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
      case "E10":
        {
          if (messageType == "text") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "MTRAddress": userTextMessage,
              "chatFlowMapID": "E11",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": `You entered\n\n*${userTextMessage.trim()}*\n\nas your home address. Is this correct?`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "E11.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "E11.NO",
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
                "body": "We seem to have missed your response.\n\nPlease send us your home address as a text message.",
              },
            };
          }
        }
        break;
      case "E11":
        {
          if (messageType == "buttonReply" && buttonReplyID == "E11.YES") {
            const userBirthDateObject = moment(userBirthDate).format("MMM Do YYYY");
            let govIssuedIDTypeString = "";
            if (govIssuedIDType == "PP") {
              govIssuedIDTypeString = "passport number";
            } else {
              govIssuedIDTypeString = "national ID number";
            }

            let balance = 0;
            const currency = stripeCustomer["currency"].toUpperCase();
            if (countryCode != "UG" && countryCode != "RW") {
              balance = stripeCustomer["balance"]/-100;
            } else {
              balance = stripeCustomer["balance"]/-1;
            }

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E12",
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
                  "text": `Here are the details we will provide to the money transfer agent, please confirm that they are accurate:\n\nRecipient Name:\n${officialUserName}\n\nRecipient DOB:\n${userBirthDateObject}\n\nRecipient ${govIssuedIDTypeString}:\n${govIssuedPhotoID}\n\nExpected payout:\n${balance} ${currency}\n\nRecipient address:\n${MTRAddress}`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "CS",
                        "title": "Contact Support",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "CP",
                        "title": "Confirm Payout",

                      },
                    },
                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "E11.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "E10",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "No worries, let's try that again.\n\nPlease send us your home address as a text message.",
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
                  "text": `You entered\n\n*${MTRAddress}*\n\nas your home address. Is this correct?`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "E11.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "E11.NO",
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
      case "E12":
        {
          if (messageType == "buttonReply" && buttonReplyID == "CS") {
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
                  "text": "To speak to a customer service representative, please send your questions and/or comments by tapping on the link below.\n\nCustomer support link👇🏾\nhttps://wa.me/16473739305\n\nHow else can we be of assistance today?",
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
          } else if (messageType == "buttonReply" && buttonReplyID == "CP") {
            const ref = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            ref.set({
              "chatFlowMapID": "A6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            let balance = 0;
            const currency = stripeCustomer["currency"].toUpperCase();
            if (countryCode != "UG" && countryCode != "RW") {
              balance = stripeCustomer["balance"]/-100;
            } else {
              balance = stripeCustomer["balance"]/-1;
            }
            const payoutDate = Date.now();

            const docRef = fs.collection("stripePayouts").doc(`${countryCode}`).collection(`${userPhoneNumber}`);
            docRef.add({
              "dateRequested": `${payoutDate}`,
              "payoutAmount": `${balance}`,
              "payoutCurrency": `${currency}`,
              "userPhoneNumber": `${userPhoneNumber}`,
              "payoutStatus": "pendingTransfer",
              "stripePayoutRefNumber": "pending",
            });
            // payoutStatus = pendingTransfer, processingTransfer, completedTransfer

            const payoutAmnt = stripeCustomer["balance"]/-1;
            stripe.customers.createBalanceTransaction(
                `${stripeCustomerID}`,
                {
                  "amount": payoutAmnt,
                  "currency": `${supportedCurrencyCodes[countryCode]}`,
                  "description": `payout of ${payoutAmnt} ${currency} on ${payoutDate}`,
                }).catch((err) =>{
              const docRef3 = fs.collection("stripePayoutFollowUps");
              docRef3.add({
                "error": `${err.message}`,
                "status": "unresolved",
                countryCode,
                userPhoneNumber,
                payoutDate,
                payoutAmnt,
                currency,
              });
            });

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Your payout is on its way!*🎉\n\nWe are processing your payout and will message your transaction reference number to you within 24 hours.\n\nTank you for choosing Tapfuma 😃.",
              },
            };
          } else {
            const userBirthDateObject = moment(userBirthDate).format("MMM Do YYYY");
            let govIssuedIDTypeString = "";
            if (govIssuedIDType == "PP") {
              govIssuedIDTypeString = "passport number";
            } else {
              govIssuedIDTypeString = "national ID number";
            }

            let balance = 0;
            const currency = stripeCustomer["currency"].toUpperCase();
            if (countryCode != "UG" && countryCode != "RW") {
              balance = stripeCustomer["balance"]/-100;
            } else {
              balance = stripeCustomer["balance"]/-1;
            }


            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": `Here are the details we will provide to the money transfer agent, please confirm that they are accurate:\n\nRecipient Name:\n${officialUserName}\n\nRecipient DOB:\n${userBirthDateObject}\n\nRecipient ${govIssuedIDTypeString}:\n${govIssuedPhotoID}\n\nExpected payout:\n${balance} ${currency}\n\nRecipient address:\n${MTRAddress}`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "CS",
                        "title": "Contact Support",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "CP",
                        "title": "Confirm Payout",
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

    if (chatFlowMapID != "E1") {
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


    resolve();
  });
}

exports.mapE = mapE;
