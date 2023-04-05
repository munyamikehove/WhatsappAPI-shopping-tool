require("dotenv").config();
const axios = require("axios");
const moment = require("moment");
const gcs = require("./getCartStatus");

function mapO(fs, chatFlowMapID, messageType, buttonReplyID, cartSnapshot, userPhoneNumber, countryCode, listReplyID, currentMessageTimeStamp, supportedCurrencyCodes, stripeCustomerID, stripe, stripeCustomer, currentUSDExchangeRates, FieldValue, MTRAddress, cityLimits) {
  let responseToUserText = {};
  let axiosTrigger = true;
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "O1":
        {
          axiosTrigger = false;


          if (messageType == "buttonReply" && buttonReplyID == "RH") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "PO") {
            // Cart total
            let subTotal = 0.0;
            let displaySubTotal = "";
            let displayGrandTotal = "";
            // Shipping fee
            let displayShippingFee = "";
            let shippingFee = 0;
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


            // Account balance
            let balance = 0;
            const currency = stripeCustomer["currency"].toUpperCase();
            if (countryCode != "UG" && countryCode != "RW") {
              balance = stripeCustomer["balance"]/-100;
            } else {
              balance = stripeCustomer["balance"]/-1;
            }

            // currency in usd equivalent
            const usdEQ = subTotal/currentUSDExchangeRates[countryCode];


            if (cityLimits[countryCode]) {
              if (usdEQ >= 75) {
                displayShippingFee = formatter.format(0);
                shippingFee = 0;
              } else if (usdEQ > 20 && usdEQ < 75) {
                displayShippingFee = formatter.format((0.15*subTotal));
                shippingFee = 0.15*subTotal;
              } else {
                displayShippingFee = formatter.format(20);
                shippingFee = 20;
              }
            } else {
              shippingFee = 0;
              displayShippingFee = "Charged by seller at pickup/delivery";
            }


            displaySubTotal = formatter.format(subTotal);
            displayGrandTotal = formatter.format((shippingFee + subTotal));

            if (balance > subTotal) {
              if (balance > (shippingFee + subTotal) ) {
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": `Shipping Address:\n${MTRAddress}\n\nCart total:\n${displaySubTotal}\n\nShipping and fees:\n${displayShippingFee}\n\n\n*Total Due*\n*${displayGrandTotal}*`,
                    },
                    "action": {
                      "buttons": [
                        {
                          "type": "reply",
                          "reply": {
                            "id": "RH",
                            "title": "Back home",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "PN",
                            "title": "Pay now",
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
              } else {
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": `*You have insufficient funds to complete this transaction.*\n\nAccount balance:\n${balance} ${currency}\n\nShipping:\n${displayShippingFee}\n\nCart total:\n${displayGrandTotal}`,
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
                            "id": "VC",
                            "title": "View Cart",
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
                    "text": `*You have insufficient funds to complete this transaction.*\n\nAccount balance:\n${balance} ${currency}\n\nShipping:\n${displayShippingFee}\n\nCart total:\n${displayGrandTotal}`,
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
                          "id": "VC",
                          "title": "View Cart",
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
            } else if (key == "Yes") {
              const productID= buttonReplyID.split("::")[2];
              const productTitle= buttonReplyID.split("::")[3];

              const productRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`);
              productRef.delete().then(async ()=>{
                const cartResult = await gcs.getCartStatus(userPhoneNumber, countryCode, fs);
                cartSnapshot = cartResult["cartSnapshot"];
              }).then(()=>{
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
                }, 1500);
              });
            } else if (key == "No") {
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
            }
          } else if (messageType == "buttonReply" && buttonReplyID == "VC") {
            if (cartSnapshot.size > 0) {
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
              }, 1500);
            } else {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "PN") {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Please wait while we process your payment...",
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

            let subTotal = 0.0;
            let shippingFee = 0;
            let blnc = 0;
            let grandTTL = 0;

            cartSnapshot.forEach((doc) => {
              const productData = doc.data();
              const productPrice = productData["productPrice"];


              const b = `0.${productPrice.split(".")[1].trim()}`;
              const c = productPrice.split(".")[0].trim();
              const c2 = c.replace(/\D/g, "");

              subTotal = subTotal + parseFloat(c2) + parseFloat(b);
            });

            stripe.customers.retrieve(
                `${stripeCustomerID}`,
            ).then((customer) => {
              let stripeBalanceTransactionValue = 0;
              if (countryCode != "UG" && countryCode != "RW") {
                blnc = customer["balance"]/-100;
              } else {
                blnc = customer["balance"]/-1;
              }

              const usdEQ = subTotal/currentUSDExchangeRates[countryCode];


              if (cityLimits[countryCode]) {
                if (usdEQ >= 75) {
                  shippingFee = 0;
                } else if (usdEQ > 20 && usdEQ < 75) {
                  shippingFee = 0.15*subTotal;
                } else {
                  shippingFee = 20;
                }
              } else {
                shippingFee = 0;
              }


              grandTTL = shippingFee + subTotal;

              if (blnc > grandTTL) {
                const cartNumber = Date.now();


                if (countryCode != "UG" && countryCode != "RW") {
                  stripeBalanceTransactionValue = grandTTL*100;
                } else {
                  stripeBalanceTransactionValue = grandTTL;
                }

                stripe.customers.createBalanceTransaction(
                    `${stripeCustomerID}`,
                    {
                      "amount": stripeBalanceTransactionValue,
                      "currency": `${supportedCurrencyCodes[countryCode]}`,
                      "description": `purchase of cart#${cartNumber} `,
                    },
                ).then(()=>{
                  const date = new Date();
                  date.setDate(date.getDate() + 7);
                  const deliveryDate = moment(date).format("MMM Do YYYY");

                  cartSnapshot.forEach((doc) => {
                    const productData = doc.data();
                    const productLink = productData["productLink"];
                    const productTitle = productData["productTitle"];
                    const productPrice = productData["productPrice"];
                    const productID = productData["productID"];

                    const sellerPN = productLink.split("/")[5];

                    const responseMessage = {
                      "messaging_product": "whatsapp",
                      "to": sellerPN,
                      "type": "template",
                      "template": {
                        "name": "sale_registered",
                        "language": {
                          "code": "en",
                        },
                        "components": [
                          {
                            "type": "header",
                            "parameters": [
                              {
                                "type": "image",
                                "image": {
                                  "link": "https://tapsimagestorage.web.app/images/successful_sale.png",
                                },
                              },
                            ],
                          },
                          {
                            "type": "body",
                            "parameters": [
                              {
                                "type": "text",
                                "text": `${productTitle}`,
                              },
                            ],
                          },
                        ],
                      },
                    };

                    axios({
                      method: "POST",
                      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
                      data: responseMessage,
                      headers: {"Content-Type": "application/json"},
                    }).catch(function(error) {
                      const docRef5 = fs.collection("errors");
                      docRef5.add({
                        "errorMessage": "axios error unsupportedMessage is:" + error.message,
                      });
                    });

                    const dcRef = fs.collection(`${countryCode}`).doc("Sales").collection(`${sellerPN}`).doc(`cart#${cartNumber}`);
                    dcRef.set({
                      productLink,
                      productTitle,
                      productPrice,
                      productID,
                      "productIsDelivered": false,
                      "productPickedUp": false,
                      "sellerHasBeenCredited": false,
                    });

                    fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`).doc(`${productID}`).delete();
                  });

                  const dcRef = fs.collection(`${countryCode}`).doc("Purchases").collection(`${userPhoneNumber}`).doc(`cart#${cartNumber}`);
                  dcRef.set(cartSnapshot);

                  const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                  docRef.set({
                    "purchasedCartNumbers": FieldValue.arrayUnion(`${cartNumber}`),
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
                        "type": "image",
                        "image": {
                          "link": "https://tapsimagestorage.web.app/images/now_shipping.png",
                        },
                      },
                      "body": {
                        "text": `*Congratulations!!!* 🎉🥳🎉\n\nYour purchase was successfully processed!\n\nExpected delivery date:\n${deliveryDate}`,
                      },
                      "footer": {
                        "text": "Check your profile to view your delivery status.",
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
                      "mapDerror": "axios error for map D is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }).catch((err)=>{
                  const docRef3 = fs.collection("stripePurchaseErrorFollowUps");
                  docRef3.add({
                    "purchase oMap error": `${err.message}`,
                    "isErrorResolved": false,
                    userPhoneNumber,
                    cartNumber,
                    countryCode,
                  });

                  const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                  docRef.set({
                    "chatFlowMapID": "A6",
                    "lastMessageTimeStamp": currentMessageTimeStamp,
                  }, {merge: true});

                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "to": userPhoneNumber,
                    "text": {
                      "body": "We ran into a technical problem while trying to complete your purchase. A member of our team will reach out to you shortly to resolve the issue.",
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
                      "text": "*You have insufficient funds to complete this transaction.*\n\nPlease top-up your balance to complete this purchase.",
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
                            "id": "VC",
                            "title": "View Cart",
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
              }
            }).catch((err) => {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": "*Error completing transaction*\n\nWe ran into an error while processing your transaction. Please try again or reach out to our support team if this problem persists.",
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
            });
          } else if (messageType == "buttonReply" && buttonReplyID == "TB") {
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
          } else {
            if (cartSnapshot.size > 0) {
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
                    "text": "We seem to have missed your response.\n\nHere is a summary of your cart.\nTo delete an item in your cart, tap and send it from the list below 👇🏾.",
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
          }
        }
        break;
        //   case "O2":
        //     {

        //     }
        //     break;
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

exports.mapO = mapO;
