require("dotenv").config();
const axios = require("axios");
const sfsr = require("./sendFiveSearchResults");
const gcs = require("./getCartStatus");

let responseMenu = [];

function mapC(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, listReplyID, countryCode, currentBrowseProductsIndex, previousChatFlowMapID, userTextMessage, currentSearchResultsID, itemsInCart, cartSnapshot, fs, client, currencyPrefix, categoryListMenu) {
  let responseToUserText = {};
  let axiosTrigger = true;
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
            if (itemsInCart < 1) {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Your cart is currently empty. Please add products to your cart before checking out.",
                },
              };
            }
          } else if (messageType == "buttonReply" && buttonReplyID.split("::")[0] == "ATC") {
            // Add to Cart
            if (itemsInCart <= 9) {
              let productSizes = [];
              let productColors = [];

              const product = JSON.parse(buttonReplyID.split("::")[1]);
              if (product["productSizes"] != "undefined") {
                productSizes = product["productSizes"].split(",");
              }
              if (product["productColors"] != "undefined") {
                productColors = product["productColors"].split(",");
              }
              const productID = product["productID"];
              const productTitle = product["productTitle"];
              const productLink = product["productLink"];

              const shortenedProductLink = productLink.split("https://")[1].trim();

              const docRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${product["productID"]}`);
              docRef.set({
                "productID": product["productID"],
                "productLink": product["productLink"],
                "productPrice": product["productPrice"],
                "productTitle": product["productTitle"],
                itemsInCart,
              }, {merge: true});


              if (productSizes.length > 0 && productColors.length > 0) {
                // has color and size
                // start with color selection


                const colorSelectionMenu = [];
                productColors.forEach((element) => colorSelectionMenu.push({
                  "id": `ATCsc::{"pcs":"${element}"}::hcns::${productID}::${productTitle}::${productSizes}`,
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
                      "text": `Please pick a color for your ${product["productTitle"]} from the menu below.\n\nView product 👇🏾 :\n${shortenedProductLink}`,
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
              } else if (productSizes.length <= 0 && productColors.length > 0) {
                // has color only


                const colorSelectionMenu = [];
                productColors.forEach((element) => colorSelectionMenu.push({
                  "id": `ATCsc::{"pcs":"${element}"}::hco::${productID}::${productTitle}`,
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
                      "text": `Please pick a color for your ${product["productTitle"]} from the menu below.\n\nView product 👇🏾 :\n${shortenedProductLink}`,
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
              } else if (productSizes.length > 0 && productColors.length <= 0) {
                // has size only


                const sizeSelectionMenu = [];
                productSizes.forEach((element) => sizeSelectionMenu.push({
                  "id": `ATCss::{"productSizeSelected":"${element}"}::hso::${productID}::${productTitle}`,
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
                      "text": `Please pick a size for your ${product["productTitle"]} from the menu below.`,
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
              } else if (productSizes.length <= 0 && productColors.length <= 0) {
                // has no color or size


                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": `✅ Added ${product["productTitle"]} to your cart\n\nWhat would you like to do next?`,
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
                            "id": "NS",
                            "title": "New Search",
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
            // select size
            const sizeChosen = JSON.parse(listReplyID.split("::")[1]);
            const productSizeSelected = sizeChosen["productSizeSelected"];
            const productColorIndicator = listReplyID.split("::")[2];
            const productID = listReplyID.split("::")[3];
            const productTitle = listReplyID.split("::")[4];

            if (productColorIndicator == "hcns") {
              const docRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`);
              docRef.set(
                  {
                    productSizeSelected,
                  }, {merge: true});

              const productColor = listReplyID.split("::")[3];

              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `✅ Added ${productTitle} to your cart\nSize - ${productSizeSelected}\nColor - ${productColor}\n\nWhat would you like to do next?`,
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
                          "id": "NS",
                          "title": "New Search",
                        },
                      },
                    ],
                  },
                },
              };
            } else if (productColorIndicator == "hso") {
              const docRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`);
              docRef.set(
                  {
                    "colorAndSizeCode": productColorIndicator,
                    productSizeSelected,
                  }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `✅ Added ${productTitle} to your cart\nSize - ${productSizeSelected}\n\nWhat would you like to do next?`,
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
                          "id": "NS",
                          "title": "New Search",
                        },
                      },
                    ],
                  },
                },
              };
            }
          } else if (messageType == "listReply" && listReplyID.split("::")[0] == "ATCsc") {
            // select color
            const colorChosen = JSON.parse(listReplyID.split("::")[1]);
            const productColorSelected = colorChosen["pcs"];
            const productSizeIndicator = listReplyID.split("::")[2];
            const productID = listReplyID.split("::")[3];
            const productTitle = listReplyID.split("::")[4];

            if (productSizeIndicator == "hcns") {
              const productSizes = listReplyID.split("::")[5].split(",");

              const sizeSelectionMenu = [];
              productSizes.forEach((element) => sizeSelectionMenu.push({
                "id": `ATCss::{"productSizeSelected":"${element}"}::hcns::${productColorSelected}`,
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
            } else if (productSizeIndicator == "hco") {
              const docRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`);
              docRef.set(
                  {
                    productColorSelected,
                    "colorAndSizeCode": productSizeIndicator,
                  }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `✅ Added ${productTitle} to your cart\nColor - ${productColorSelected}\n\nWhat would you like to do next?`,
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
                          "id": "NS",
                          "title": "New Search",
                        },
                      },
                    ],
                  },
                },
              };
            }
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
              const shoppingCart = [];
              cartSnapshot.forEach((doc) => {
                const productData = doc.data();
                const productTitle = productData["productTitle"];
                const productPrice = productData["productPrice"];
                const productID = doc.id;

                subTotal = subTotal + parseFloat(productPrice.split(`${currencyPrefix[countryCode]}`)[1]);

                shoppingCart.push({
                  "id": `RMV::Ask::${productID}::${productTitle}`,
                  "title": productPrice,
                  "description": productTitle,
                });
              });

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
                        "title": `Subtotal ${currencyPrefix[countryCode]} ${subTotal}`,
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
                          "title": "New Search",
                        },
                      },
                    ],
                  },
                },
              };

              setTimeout(function() {
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
                const shoppingCart = [];
                cartSnapshot.forEach((doc) => {
                  const productData = doc.data();
                  const productTitle = productData["productTitle"];
                  const productPrice = productData["productPrice"];
                  const productID = doc.id;

                  subTotal = subTotal + parseFloat(productPrice.split(`${currencyPrefix[countryCode]}`)[1]);

                  shoppingCart.push({
                    "id": `RMV::Ask::${productID}::${productTitle}`,
                    "title": productPrice,
                    "description": productTitle,
                  });
                });

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
                          "title": `Subtotal ${currencyPrefix[countryCode]} ${subTotal}`,
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
                            "title": "New Search",
                          },
                        },
                      ],
                    },
                  },
                };


                setTimeout(function() {
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
                }, 1500);
              });
            } else if (key == "No") {
              axiosTrigger = false;
              let subTotal = 0.0;
              const shoppingCart = [];
              cartSnapshot.forEach((doc) => {
                const productData = doc.data();
                const productTitle = productData["productTitle"];
                const productPrice = productData["productPrice"];
                const productID = doc.id;

                subTotal = subTotal + parseFloat(productPrice.split(`${currencyPrefix[countryCode]}`)[1]);

                shoppingCart.push({
                  "id": `RMV::Ask::${productID}::${productTitle}`,
                  "title": productPrice,
                  "description": productTitle,
                });
              });

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
                        "title": `Subtotal ${currencyPrefix[countryCode]} ${subTotal}`,
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
                          "title": "New Search",
                        },
                      },
                    ],
                  },
                },
              };

              setTimeout(function() {
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
              }, 1500);
            }
          } else {
            // Non-button response

            const docRef = fs.collection("testELSE").doc("ELSE");
            docRef.set({
              messageType,
              listReplyID,
              buttonReplyID,
            }, {merge: true});

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
        // case "C4":
        // {}
        // case "C4":
        // {}
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
          "mapDerror": "axios error for map D is:" + error.message,
          "isResolved": false,
        });
      });
    }

    resolve();
  });
}

exports.mapC = mapC;
