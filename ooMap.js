require("dotenv").config();
const axios = require("axios");
const moment = require("moment");

let responseMenu = [];

function map00(userPhoneNumber, messageType, listReplyID, currentMessageTimeStamp, countryCode, registeredUser, registeredMerchant, buttonReplyID, fs, permittedMerchants, consumerListMenu, merchantListMenu, categoryListMenu, stripeCustomer, govIssuedIDType, govIssuedPhotoID, userBirthDate, MTRAddress, officialUserName, addressFull, supportedCurrencyCodes, cartSnapshot) {
  let responseToUserText = {};
  let chatFlowMapID = "";
  let yesButtonID = "";
  let noButtonID = "";
  let axiosTrigger = true;

  return new Promise((resolve, reject) => {
    // send response message to user
    if (messageType == "listReply") {
      switch (listReplyID) {
        // case "B0":
        //   {

        //   }
        //   break;
        case "C0":
          {
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
          }
          break;
        case "D0":
          {
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
          }
          break;
        case "E0":
          {
            if (registeredUser) {
              if (registeredMerchant) {
                if (govIssuedIDType && govIssuedPhotoID) {
                  const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                  docRef.set({
                    "chatFlowMapID": "E1",
                    "lastMessageTimeStamp": currentMessageTimeStamp,
                  }, {merge: true});

                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "to": userPhoneNumber,
                    "text": {
                      "body": "To access this feature, please send us the Tapfuma token from your Authy app.",
                    },
                  };
                } else {
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
                }
              } else {
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
                            "id": "BH",
                            "title": "Back home",
                          },
                        },
                      ],
                    },
                  },
                };
              }
            } else {
              chatFlowMapID = "B0";
              yesButtonID = "B0.YES";
              noButtonID = "B0.NO";

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": chatFlowMapID,
                "lastMessageTimeStamp": currentMessageTimeStamp,
                "previousChatFlowMapID": "E0",
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": "It looks like you are not yet a registered user.\n\nOnly registered sellers can access account balance features.\n\nWould you like to become a registered user?",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": yesButtonID,
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": noButtonID,
                          "title": "No, not today",
                        },
                      },
                    ],
                  },
                },
              };
            }
          }
          break;
        case "F0":
          {
            if (registeredUser) {
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
                    "text": "*Gift card guide*\n\nSending money through a giftcard allows your friend or family member to transact on Tapfuma.\n\nYour friend or family member must be a registered Tapfuma user.\n\nAll gift cards are denominated in USD.When you send a gift card, we will add the local currency equivalent to your recipients Tapfuma wallet.\n\nTapfuma is not a remittance service, money transfer service or banking service.\nThe money you send as a giftcard cannot be withdrawn as cash by your recipient.",
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
            } else {
              chatFlowMapID = "B0";
              yesButtonID = "B0.YES";
              noButtonID = "B0.NO";

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": chatFlowMapID,
                "lastMessageTimeStamp": currentMessageTimeStamp,
                "previousChatFlowMapID": "F0",
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": "It looks like you are not yet a registered user.\n\nOnly registered sellers can access perform peer-to-peer transfers.\n\nWould you like to become a registered user?",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": yesButtonID,
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": noButtonID,
                          "title": "No, not today",
                        },
                      },
                    ],
                  },
                },
              };
            }
          }
          break;
        case "G0":
          {
            if (registeredUser) {
              if (registeredMerchant) {
                if (govIssuedIDType && govIssuedPhotoID) {
                  const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                  docRef.set({
                    "chatFlowMapID": "G1",
                    "lastMessageTimeStamp": currentMessageTimeStamp,
                  }, {merge: true});

                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "to": userPhoneNumber,
                    "text": {
                      "body": "To access this feature, please send us the Tapfuma token from your Authy app.",
                    },
                  };
                } else {
                  let balance = 0;
                  const currency = stripeCustomer["currency"].toUpperCase();
                  if (countryCode != "UG" && countryCode != "RW") {
                    balance = stripeCustomer["balance"]/-100;
                  } else {
                    balance = stripeCustomer["balance"]/-1;
                  }

                  const userBirthDateObject = moment(userBirthDate).format("MMM Do YYYY");

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
                        "text": `*Your Profile*:\n\nFull Name:\n${officialUserName}\n\nDOB:\n${userBirthDateObject}\n\nCurrent balance:\n${balance} ${currency}\n\nBusiness address:\n${addressFull}`,
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
                }
              } else {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
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

                const userBirthDateObject = moment(userBirthDate).format("MMM Do YYYY");

                let buyerAddress = "";
                if (addressFull != undefined) {
                  buyerAddress = `\n\nDelivery address:\n${MTRAddress}`;
                }

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": `*Your Profile*:\n\nFull Name:\n${officialUserName}\n\nDOB:\n${userBirthDateObject}\n\nCurrent balance:\n${balance} ${currency}${buyerAddress}`,
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
              }
            } else {
              chatFlowMapID = "B0";
              yesButtonID = "B0.YES";
              noButtonID = "B0.NO";

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": chatFlowMapID,
                "lastMessageTimeStamp": currentMessageTimeStamp,
                "previousChatFlowMapID": "G0",
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": "It looks like you are not yet a registered user.\n\nOnly registered sellers can access user profile features.\n\nWould you like to become a registered user?",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": yesButtonID,
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": noButtonID,
                          "title": "No, not today",
                        },
                      },
                    ],
                  },
                },
              };
            }
          }
          break;
        case "H0":
          {
            if (permittedMerchants[userPhoneNumber] != undefined) {
              if (registeredMerchant) {
                responseMenu = merchantListMenu;

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": `${userPhoneNumber}`,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": "To proceed, please choose an option from the *Seller Services* menu below.",
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
                if (registeredUser) {
                  chatFlowMapID = "BZ0";
                  yesButtonID = "BZ0.YES";
                  noButtonID = "BZ0.NO";
                } else {
                  chatFlowMapID = "BX0";
                  yesButtonID = "BX0.YES";
                  noButtonID = "BX0.NO";
                }
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "chatFlowMapID": chatFlowMapID,
                  "lastMessageTimeStamp": currentMessageTimeStamp,
                  "previousChatFlowMapID": "H0",
                }, {merge: true});

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": "It looks like you are not yet a registered seller.\n\nOnly registered sellers can sell products on Tapfuma.\n\nWould you like to become a registered seller?",
                    },
                    "action": {
                      "buttons": [
                        {
                          "type": "reply",
                          "reply": {
                            "id": yesButtonID,
                            "title": "Yes",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": noButtonID,
                            "title": "No, not today",
                          },
                        },
                      ],
                    },
                  },
                };
              }
            } else {
              const docRef = fs.collection(`${countryCode}`).doc("MerchantAccountRequests").collection(`${userPhoneNumber}`).doc("requestData");
              docRef.set({
                "userPhoneNumber": userPhoneNumber,
                "dateRequested": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "We currently only allow registered merchants to sell through Tapfuma.\n\nIf your number is connected to a whatsapp business account, we will take a look at your catalog and reach out to notify you whether or not you have been authorized to sell on Tapfuma. This will take between 1 to 3 days.\n\n Respond 'M' to view the menu or 'X' to return home.",
                },
              };
            }
          }
          break;
        case "I0":
          {
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
                "header": {
                  "type": "document",
                  "document": {
                    "link": `https://tapsimagestorage.firebaseapp.com/documents/${countryCode}/tapfumafaqs.pdf`,
                    "filename": "Tapfuma FAQs",
                  },
                },
                "body": {
                  "text": "To view our buyer and seller FAQs, tap the PDF above 👆🏾\n\nHow else could we be of assistance today?",
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
                  ],
                },
              },
            };
          }
          break;
        case "J0":
          {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 1 of 5 - Product Link*\n\nPlease share a link to the product in your whatsapp catalog with us.\n\n The link should look something like this:\n\n_https://wa.me/p/4838928229/2637218383_",
              },
            };
          }
          break;
        case "K0":
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
          }
          break;
          // case "L0":
          //   {

          //   }
          //   break;
        case "O0":
          {
            if (registeredUser) {
              if (cartSnapshot.size > 0) {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "chatFlowMapID": "O1",
                  "lastMessageTimeStamp": currentMessageTimeStamp,
                }, {merge: true});

                axiosTrigger = false;
                let subTotal = 0.0;
                let displaySubTotal = "";
                const shoppingCart = [];
                cartSnapshot.forEach((doc) => {
                  const productData = doc.data();
                  const productTitle = productData["productTitle"];
                  const productPrice = productData["productPrice"];
                  const productID = doc.id;


                  const b = `0.${productPrice.split(".")[1].trim()}`;
                  const c = productPrice.split(".")[0].trim();
                  const c2 = c.replace(/\D/g, "");

                  subTotal = subTotal + parseFloat(c2) + parseFloat(b);

                  shoppingCart.push({
                    "id": `RMV::Ask::${productID}::${productTitle}`,
                    "title": productPrice,
                    "description": productTitle,
                  });
                });

                const formatter = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: `${supportedCurrencyCodes[countryCode]}`,
                });

                displaySubTotal = formatter.format(subTotal);

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": `${userPhoneNumber}`,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": "Here is a summary of your cart.\n\nTo delete an item in your cart, tap and send it from the list below 👇🏾.",
                    },
                    "action": {
                      "button": "View Cart Items",
                      "sections": [
                        {
                          "title": `Subtotal ${displaySubTotal}`,
                          "rows": shoppingCart,
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
                    "mapDerror": "axios error for map D is:" + error.message,
                    "isResolved": false,
                  });
                });


                setTimeout(function() {
                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": userPhoneNumber,
                    "type": "interactive",
                    "interactive": {
                      "type": "button",
                      "body": {
                        "text": "What would you like to do next?",
                      },
                      "action": {
                        "buttons": [
                          {
                            "type": "reply",
                            "reply": {
                              "id": "RH",
                              "title": "Return home",
                            },
                          },
                          {
                            "type": "reply",
                            "reply": {
                              "id": "PO",
                              "title": "Pay for order",
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
                      "mapDerror": "axios error for map D is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }, 1000);
              } else {
                axiosTrigger = false;
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "text": {
                    "body": "Your shopping cart is currently empty. Respond 'b' to browse a new category or 'x' to return home.",
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
                    "mapDerror": "axios error for map D is:" + error.message,
                    "isResolved": false,
                  });
                });
              }
            } else {
              chatFlowMapID = "B0";
              yesButtonID = "B0.YES";
              noButtonID = "B0.NO";

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": chatFlowMapID,
                "lastMessageTimeStamp": currentMessageTimeStamp,
                "previousChatFlowMapID": "G0",
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": "It looks like you are not yet a registered user.\n\nOnly registered sellers can access user profile features.\n\nWould you like to become a registered user?",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": yesButtonID,
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": noButtonID,
                          "title": "No, not today",
                        },
                      },
                    ],
                  },
                },
              };
            }
          }
          break;
        case "N0":
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
          break;
        default:
        {
          responseMenu = consumerListMenu;

          responseToUserText = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": `${userPhoneNumber}`,
            "type": "interactive",
            "interactive": {
              "type": "list",
              "body": {
                "text": "Choose the \"⭐️ Browse Products\" option from the menu below to view fun products and services.",
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
        }
      }
    } else if (messageType == "buttonReply" && buttonReplyID == "G0") {
      const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
      docRef.set({
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

      const userBirthDateObject = moment(userBirthDate).format("MMM Do YYYY");

      let buyerAddress = "";
      if (addressFull != undefined) {
        buyerAddress = `\n\nDelivery address:\n${MTRAddress}`;
      }

      responseToUserText = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": userPhoneNumber,
        "type": "interactive",
        "interactive": {
          "type": "button",
          "body": {
            "text": `*Your Profile*:\n\nFull Name:\n${officialUserName}\n\nDOB:\n${userBirthDateObject}\n\nCurrent balance:\n${balance} ${currency}${buyerAddress}`,
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
    } else {
      if (messageType == "buttonReply" && buttonReplyID == "J0") {
        const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
        docRef.set({
          "chatFlowMapID": "J1",
          "lastMessageTimeStamp": currentMessageTimeStamp,
        }, {merge: true});

        responseToUserText = {
          "messaging_product": "whatsapp",
          "to": userPhoneNumber,
          "text": {
            "body": "*Step 1 of 5 - List Product*\n\nPlease share a link to the product in your whatsapp catalog with us.\n\n The link should look something like this:\n\n_https://wa.me/p/4838928229/2637218383_",
          },
        };
      } else {
        responseMenu = consumerListMenu;

        responseToUserText = {
          "messaging_product": "whatsapp",
          "recipient_type": "individual",
          "to": `${userPhoneNumber}`,
          "type": "interactive",
          "interactive": {
            "type": "list",
            "body": {
              "text": "How can we be of assistance to you? 😃\n\nChoose the \"⭐️ Browse Products\" option from the menu below to view fun products and services.",
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
      }
    }

    if (axiosTrigger) {
      axios({
        method: "POST",
        url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
        data: responseToUserText,
        headers: {"Content-Type": "application/json"},
      }).catch(function(error) {
        const docRef5 = fs.collection("errors");
        docRef5.add({
          "errorMessage": "axios error for sendMenuSelection is:" + error.message,
        });
      });
    }

    resolve();
  });
}

exports.map00 = map00;
