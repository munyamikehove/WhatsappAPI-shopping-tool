require("dotenv").config();
const axios = require("axios");
const sfsr = require("./sendFiveSearchResults");
const gcs = require("./getCartStatus");

let responseMenu = [];

function mapC(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, listReplyID, countryCode, currentBrowseProductsIndex, previousChatFlowMapID, userTextMessage, currentSearchResultsID, itemsInCart, cartSnapshot, fs, client, currencyPrefix, categoryListMenu, supportedCurrencyCodes, registeredUser) {
  let responseToUserText = {};
  let axiosTrigger = true;
  let yesButtonID = "";
  let noButtonID = "";
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "C1":
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
      case "C2":
        {
          if (messageType == "text") {
            const isNewSearch = true;
            axiosTrigger = false;
            sfsr.sendFiveSearchResults(userTextMessage, countryCode, userPhoneNumber, currentBrowseProductsIndex, currentMessageTimeStamp, currentSearchResultsID, isNewSearch, fs, client);
          } else {
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
                "body": "We seem to have missed your response.What product are you looking for today?\n\nRespond 'X' to return home.",
              },
            };
          }
        }
        break;
      case "C3":
        {
          if (messageType == "buttonReply" && buttonReplyID == "CO") {
            // Checkout
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
                    "mapDerror": "axios error for map C is:" + error.message,
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
                      "mapDerror": "axios error for map C is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }, 1500);
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
                    "mapDerror": "axios error for map C is:" + error.message,
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
          } else if (messageType == "buttonReply" && buttonReplyID.split("::")[0] == "ATC") {
            axiosTrigger = false;
            // Add to Cart
            if (itemsInCart <= 9) {
              let productSizes = [];
              let productColors = [];
              const productID = buttonReplyID.split("::")[1];
              let productTitle = "";
              let productLink = "";
              let productPrice= "";
              let productHasSizes = false;
              let productHasColors = false;

              const query = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${productID}`);
              query.get().then((doc) => {
                const productData = doc.data();
                productTitle = productData["productTitle"];
                productLink = productData["productLink"];
                productPrice = productData["productPrice"];
                productHasSizes = productData["productHasSizes"];
                productHasColors = productData["productHasColors"];
                if (productData["productHasSizes"]) {
                  productSizes = productData["productSizes"];
                }
                if (productData["productHasColors"]) {
                  productColors = productData["productColors"];
                }
              }).then(() => {
                const shortenedProductLink = productLink.split("https://")[1].trim();

                const docRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`);
                docRef.set(
                    {
                      "productID": productID,
                      "productLink": productLink,
                      "productPrice": productPrice,
                      "productTitle": productTitle,
                    }
                    , {merge: true});


                if (productHasSizes && productHasColors) {
                  const colorSelectionMenu = [];
                  productColors.forEach((element) => colorSelectionMenu.push({
                    "id": `ATCsc::${productID}::${element}::yes`,
                    "title": `${element}`,
                  }));


                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": `${userPhoneNumber}`,
                    "type": "interactive",
                    "interactive": {
                      "type": "list",
                      "body": {
                        "text": `Please pick a color for your ${productTitle} from the menu below.\n\nView product 👇🏾 :\n${shortenedProductLink}`,
                      },
                      "action": {
                        "button": "Pick a color",
                        "sections": [
                          {

                            "rows": colorSelectionMenu,
                          },
                        ],
                      },
                    },
                  };
                } else if (productHasColors) {
                  const colorSelectionMenu = [];
                  productColors.forEach((element) => colorSelectionMenu.push({
                    "id": `ATCsc::${productID}::${element}::no`,
                    "title": `${element}`,
                  }));


                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": `${userPhoneNumber}`,
                    "type": "interactive",
                    "interactive": {
                      "type": "list",
                      "body": {
                        "text": `Please pick a color for your ${productTitle} from the menu below.\n\nView product 👇🏾 :\n${shortenedProductLink}`,
                      },
                      "action": {
                        "button": "Pick a color",
                        "sections": [
                          {

                            "rows": colorSelectionMenu,
                          },
                        ],
                      },
                    },
                  };
                } else if (productHasSizes) {
                  const sizeSelectionMenu = [];
                  productSizes.forEach((element) => sizeSelectionMenu.push({
                    "id": `ATCss::${productID}::${element}::na`,
                    "title": `${element}`,
                  }));

                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": `${userPhoneNumber}`,
                    "type": "interactive",
                    "interactive": {
                      "type": "list",
                      "body": {
                        "text": `Please pick a size for your ${productTitle} from the menu below.`,
                      },
                      "action": {
                        "button": "Select a size",
                        "sections": [
                          {

                            "rows": sizeSelectionMenu,
                          },
                        ],
                      },
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
                        "text": `✅ *Added to cart* ✅\n\nProduct - ${productTitle}\n\nWhat would you like to do next?`,
                      },
                      "action": {
                        "buttons": [
                          {
                            "type": "reply",
                            "reply": {
                              "id": "CO",
                              "title": "Checkout",
                            },
                          },
                          {
                            "type": "reply",
                            "reply": {
                              "id": "VC",
                              "title": "View Cart",
                            },
                          },
                          {
                            "type": "reply",
                            "reply": {
                              "id": "NS",
                              "title": "New search",
                            },
                          },
                        ],
                      },
                    },
                  };
                }

                axios({
                  method: "POST",
                  url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
                  data: responseToUserText,
                  headers: {"Content-Type": "application/json"},
                }).catch(function(error) {
                  const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
                  docRef.add({
                    "mapDerror": "axios error for map C is:" + error.message,
                    "isResolved": false,
                  });
                });
              });
            } else {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": "Your shopping cart is full. What would you like to do next?",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "VC",
                          "title": "View Cart",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "CO",
                          "title": "Checkout",
                        },
                      },
                    ],
                  },
                },
              };
            }
          } else if (messageType == "listReply" && listReplyID.split("::")[0] == "ATCss") {
            axiosTrigger = false;
            // select size
            const productID = listReplyID.split("::")[1];
            const productSizeSelected = listReplyID.split("::")[2];
            let productColorSelected = "";

            let productTitle = "";
            const query = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${productID}`);
            query.get().then((doc) => {
              const productData = doc.data();
              productTitle = productData["productTitle"];
            }).then(() => {
              const docRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`);
              docRef.set(
                  {
                    productSizeSelected,
                  }, {merge: true});

              if (listReplyID.split("::")[3] != "na") {
                productColorSelected = `\nColor - ${listReplyID.split("::")[3]}`;
              }

              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `✅ *Added to cart* ✅\n\nProduct - ${productTitle}\nSize - ${productSizeSelected}${productColorSelected}\n\nWhat would you like to do next?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "CO",
                          "title": "Checkout",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "VC",
                          "title": "View Cart",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "NS",
                          "title": "New search",
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
                  "mapDerror": "axios error for map C is:" + error.message,
                  "isResolved": false,
                });
              });
            });
          } else if (messageType == "listReply" && listReplyID.split("::")[0] == "ATCsc") {
            axiosTrigger = false;
            // select color
            let productSizes = [];
            const productID = listReplyID.split("::")[1];
            const productColorSelected = listReplyID.split("::")[2];
            const productHasSize = listReplyID.split("::")[3];

            let productTitle = "";
            const query = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${productID}`);
            query.get().then((doc) => {
              const productData = doc.data();
              productTitle = productData["productTitle"];
              productSizes = productData["productSizes"];
            }).then(() => {
              const docRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`);
              docRef.set(
                  {
                    productColorSelected,
                  }, {merge: true});

              if (productHasSize == "yes") {
                const sizeSelectionMenu = [];
                productSizes.forEach((element) => sizeSelectionMenu.push({
                  "id": `ATCss::${productID}::${element}::${productColorSelected}`,
                  "title": `${element}`,
                }));

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": `${userPhoneNumber}`,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": `Please pick a size for your ${productTitle} from the menu below.`,
                    },
                    "action": {
                      "button": "Select a size",
                      "sections": [
                        {

                          "rows": sizeSelectionMenu,
                        },
                      ],
                    },
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
                      "text": `✅ *Added to cart* ✅\n\nProduct - ${productTitle}\nColor - ${productColorSelected}\n\nWhat would you like to do next?`,
                    },
                    "action": {
                      "buttons": [
                        {
                          "type": "reply",
                          "reply": {
                            "id": "CO",
                            "title": "Checkout",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "VC",
                            "title": "View Cart",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "NS",
                            "title": "New search",
                          },
                        },
                      ],
                    },
                  },
                };
              }

              axios({
                method: "POST",
                url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
                data: responseToUserText,
                headers: {"Content-Type": "application/json"},
              }).catch(function(error) {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
                docRef.add({
                  "mapDerror": "axios error for map C is:" + error.message,
                  "isResolved": false,
                });
              });
            });
          } else if (messageType == "buttonReply" && buttonReplyID == "VM") {
            // View More
            const isNewSearch = false;
            axiosTrigger = false;
            sfsr.sendFiveSearchResults(userTextMessage, countryCode, userPhoneNumber, currentBrowseProductsIndex, currentMessageTimeStamp, currentSearchResultsID, isNewSearch, fs, client);
          } else if (messageType == "buttonReply" && buttonReplyID == "BP") {
            // Browse Products
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
          } else if (messageType == "buttonReply" && buttonReplyID == "NS") {
            // New Search
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
          } else if (messageType == "buttonReply" && buttonReplyID == "VC") {
            if (cartSnapshot.size > 0) {
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
                  "mapDerror": "axios error for map C is:" + error.message,
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
                            "id": "CO",
                            "title": "Checkout",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "NS",
                            "title": "New search",
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
                    "mapDerror": "axios error for map C is:" + error.message,
                    "isResolved": false,
                  });
                });
              }, 1500);
            } else {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Your shopping cart is currently empty. Respond 's' to search for a new product or 'x' to return home.",
                },
              };
            }
          } else if ((messageType == "listReply" && listReplyID.split("::")[0] == "RMV") || (messageType == "buttonReply" && buttonReplyID.split("::")[0] == "RMV")) {
            let key = "";

            if (messageType == "listReply") {
              key = listReplyID.split("::")[1];
            } else {
              key = buttonReplyID.split("::")[1];
            }


            if (key == "Ask") {
              const productTitle= listReplyID.split("::")[3];
              const productID= listReplyID.split("::")[2];

              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `Do you want to remove ${productTitle} from your shopping cart?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": `RMV::Yes::${productID}::${productTitle}`,
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": `RMV::No::${productID}::${productTitle}`,
                          "title": "No",
                        },
                      },
                    ],
                  },
                },
              };
            } else if (key == "Yes") {
              const productID= buttonReplyID.split("::")[2];
              const productTitle= buttonReplyID.split("::")[3];

              const productRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`);
              productRef.delete().then(async ()=>{
                const cartResult = await gcs.getCartStatus(userPhoneNumber, countryCode, fs);
                cartSnapshot = cartResult["cartSnapshot"];
              }).then(()=>{
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
                      "text": `✅ Removed ${productTitle} from your cart\n\nHere is a summary of your cart.\n\nTo delete an item in your cart, tap and send it from the list below 👇🏾.`,
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
                    "mapDerror": "axios error for map C is:" + error.message,
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
                              "id": "CO",
                              "title": "Checkout",
                            },
                          },
                          {
                            "type": "reply",
                            "reply": {
                              "id": "NS",
                              "title": "New search",
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
                      "mapDerror": "axios error for map C is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }, 1500);
              });
            } else if (key == "No") {
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
                  "mapDerror": "axios error for map C is:" + error.message,
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
                            "id": "CO",
                            "title": "Checkout",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "NS",
                            "title": "New search",
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
                    "mapDerror": "axios error for map C is:" + error.message,
                    "isResolved": false,
                  });
                });
              }, 1000);
            }
          } else {
            // Non-button response


            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "We seem to have missed your response. Respond 's' to start a new search or 'x' to return home.",
              },
            };
          }
        }
        break;
      default:
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
    }

    if (axiosTrigger) {
      axios({
        method: "POST",
        url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
        data: responseToUserText,
        headers: {"Content-Type": "application/json"},
      }).catch(function(error) {
        const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
        docRef.add({
          "mapDerror": "axios error for map C is:" + error.message,
          "isResolved": false,
        });
      });
    }

    resolve();
  });
}

exports.mapC = mapC;
