require("dotenv").config();
const axios = require("axios");
const ssf = require("./superStores");
const j2 = require("./j2Extension");
const extractUrls = require("extract-urls");

let responseMenu = [];

function mapJ(fs, chatFlowMapID, countryCode, userPhoneNumber, currentMessageTimeStamp, buttonReplyID, messageType, client, consumerListMenu, currentProductID, listReplyID, categoryListMenu, userTextMessage, FieldValue, userName, merchantListMenu, categoryListReplyIDs, clothingSubCategoryListMenu, shoesSubCategoryListMenu, watchesnJewelrySubCategoryListMenu, beautySubCategoryListMenu, fragrancesSubCategoryListMenu, homenGardenSubCategoryListMenu, toysnGamesSubCategoryListMenu, sportsSubCategoryListMenu, electronicsSubCategoryListMenu, automotiveSubCategoryListMenu, lastMessageTimeStamp, currentUSDExchangeRates, jCategoryListMenu, supportedCurrencyCodes) {
  let responseToUserText = {};

  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "J1":
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
      case "J2":
        {
          if (messageType == "text") {
            const urls = extractUrls(userTextMessage.trim());

            if (urls) {
              const productLink = urls[0];
              const productLinkElementsArray = productLink.split("/");

              if (productLinkElementsArray.length == 6 && productLinkElementsArray[0] == "https:" && productLinkElementsArray[2] == "wa.me" && productLinkElementsArray[3] == "p") {
                if (productLinkElementsArray[5] == userPhoneNumber) {
                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "to": userPhoneNumber,
                    "text": {
                      "body": "One moment please...",
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
                      "mapJerror": "axios error for map J2 is:" + error.message,
                      "isResolved": false,
                    });
                  });

                  j2.j2Extension(countryCode, productLink, userName, userPhoneNumber, currentMessageTimeStamp, fs, FieldValue, merchantListMenu, supportedCurrencyCodes);
                } else {
                  responseToUserText = {
                    "messaging_product": "whatsapp",
                    "to": userPhoneNumber,
                    "text": {
                      "body": "The whatsapp product link you shared is for a product in another users catalog.\n\nPlease share a link to the product in your own whatsapp catalog with us.\n\n The link should look something like this:\n\n_https://wa.me/p/4838928229/2637218383_",
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
                      "mapJerror": "axios error for map J2 is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }
              } else {
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "text": {
                    "body": "Oops! It seems you did not share a link to a product in your whatsapp catalog 🥴.\n\nPlease share a link to the product in your whatsapp catalog with us.\n\n The link should look something like this:\n\n_https://wa.me/p/4838928229/2637218383_",
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
                    "mapJerror": "axios error for map J2 is:" + error.message,
                    "isResolved": false,
                  });
                });
              }
            } else {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Oops! It seems you did not share a link to a product in your whatsapp catalog 🥴.\n\nPlease share a link to the product in your whatsapp catalog with us.\n\n The link should look something like this:\n\n_https://wa.me/p/4838928229/2637218383_",
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
                  "mapJerror": "axios error for map J2 is:" + error.message,
                  "isResolved": false,
                });
              });
            }
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Oops! It seems you did not share a link to a product in your whatsapp catalog 🥴.\n\nPlease share a link to the product in your whatsapp catalog with us.\n\n The link should look something like this:\n\n_https://wa.me/p/4838928229/2637218383_",
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
                "mapJerror": "axios error for map J2 is:" + error.message,
                "isResolved": false,
              });
            });
          }
        }
        break;
      case "J3":
        {
          if (messageType == "buttonReply" && buttonReplyID == "J3.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
            productRef.set({
              "productHasSizes": true,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Please list each size you have available, separated by a comma.\n\nE.g. If you offer sizes 5, 7, and 12, your respond should be👇🏾\n5, 7, 12.\n\nYou can also send words like small, medium, extra large.\n\nThe maximum number of sizes is 10",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "J3.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
            productRef.set({
              "productHasSizes": false,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": "*Step 3 of 5 - Product Colors*\n\nDo you offer this product in different colors?",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J6.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J6.NO",
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
      case "J4":
        {
          if (messageType == "text") {
            const productSizesArray = userTextMessage.trim().split(",");
            const newProductSizesArray = [];
            if (productSizesArray[0] && productSizesArray.length <= 10) {
              productSizesArray.forEach((element) => {
                const el1 = element.trim(); const el2 = el1.charAt(0).toUpperCase()+ el1.slice(1); newProductSizesArray.push(el2);
              });
              const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
              productRef.set({
                "productSizes": newProductSizesArray,
              }, {merge: true});

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "J5",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              let appendedSizeList = "";
              newProductSizesArray.forEach((element) => appendedSizeList += "➣ "+element+"\n");
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `You entered the following size options:\n\n${appendedSizeList}\nIs this correct?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "J5.YES",
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "J5.NO",
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
                  "body": "Error saving available sizes.\n\nPlease list 10 or less sizes, seperated by a comma.\n\n*For Example*\nIf you offer sizes 5, 7, and 12, send us a message like this 👇🏾\n\n5, 7, 12\n\nYou can also send words like\nsmall, medium, extra large",
                },
              };
            }
          } else {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J3",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": "We seem to have missed your response.\n\nDo you offer different sizes for this product?\n\nAll sizes of this product will share the same price.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J3.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J3.NO",
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
      case "J5":
        {
          if (messageType == "buttonReply" && buttonReplyID == "J5.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": "*Step 3 of 5 - Product Colors*\n\nDo you offer this product in different colors?",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J6.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J6.NO",
                        "title": "No",
                      },
                    },
                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "J5.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
            productRef.update({
              "productSizes": fs.FieldValue.delete(),
            });

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "No worries, lets try again 😃.\n\nPlease list 10 or less sizes, seperated by a comma.\n\n*For Example*\nIf you offer sizes 5, 7, and 12, send us a message like this 👇🏾\n\n5, 7, 12\n\nYou can also send words like\nsmall, medium, extra large",
              },
            };
          }
        }
        break;
      case "J6":
        {
          if (messageType == "buttonReply" && buttonReplyID == "J6.YES") {
            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
            productRef.set({
              "productHasColors": true,
              "productScore": 100,
            }, {merge: true});

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J7",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "Please list each color you have available, separated by a comma.\n\nE.g. If you offer red, navy blue, and orange, your respond should be👇🏾\nred, navy blue, orange.\n\nThe maximum number of colors is 10",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "J6.NO") {
            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
            productRef.set({
              "productHasColors": false,
              "productScore": 100,
            }, {merge: true});

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J9",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "What keywords and key-phrases will buyers use when looking for your product?\n\nPlease list up to 5 keywords and key-phrases, each separated by a comma.\n\nAn example of key words and phrases👇🏾\nbirthday, present, gift, birthday present for husband, birthday present ideas",
              },
            };
          }
        }
        break;
      case "J7":
        {
          if (messageType == "text") {
            const productColorArray = userTextMessage.trim().split(",");
            const newProductColorArray = [];
            if (productColorArray[0] && productColorArray.length <= 10) {
              productColorArray.forEach((element) => {
                const el1 = element.trim(); const el2 = el1.charAt(0).toUpperCase()+ el1.slice(1); newProductColorArray.push(el2);
              });
              const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
              productRef.set({
                "productColors": newProductColorArray,
              }, {merge: true});

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "J8",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              let appendedColorList = "";
              newProductColorArray.forEach((element) => appendedColorList += "➣ " + element.trim() + "\n");

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `You entered the following color options:\n\n${appendedColorList}\nIs this correct?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "J8.YES",
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "J8.NO",
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
                  "body": "We seem to have missed your response.\n\nPlease list each color you have available, separated by a comma.\n\nE.g. If you offer red, navy blue, and orange, your respond should be👇🏾\nred, navy blue, orange.\n\nThe maximum number of colors is 10",
                },
              };
            }
          } else {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": "We seem to have missed your response.\n\nDo you offer different colors for this product?",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J6.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J6.NO",
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
      case "J8":
        {
          if (messageType == "buttonReply" && buttonReplyID == "J8.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J9",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 4 of 5 - Product Keywords*\n\nWhat keywords and key-phrases will users search for when looking for your product?\n\nPlease list up to 5 keywords and key-phrases, each separated by a comma.\n\nAn example of key words and phrases👇🏾\nbirthday, present, gift, birthday present for husband, birthday present ideas",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "J8.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J7",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
            productRef.update({
              "productColors": fs.FieldValue.delete(),
            });

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "No worries, lets try again 😃.\n\nPlease list 10 or less colors, seperated by a comma.\n\n*For Example*\nIf you offer red, navy blue, and orange,your respond should be👇🏾\nred, navy blue, orange",
              },
            };
          }
        }
        break;
      case "J9":
        {
          if (messageType == "text") {
            const productKeysArray = userTextMessage.trim().split(",");
            const newProductKeysArray = [];
            if (productKeysArray[0] && productKeysArray.length <= 5) {
              productKeysArray.forEach((element) => {
                const el1 = element.trim(); const el2 = el1.charAt(0).toUpperCase()+ el1.slice(1); newProductKeysArray.push(el2);
              });
              const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
              productRef.set({
                "productKeys": newProductKeysArray,
              }, {merge: true});

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "J10",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              let appendedKeysList = "";
              newProductKeysArray.forEach((element) => appendedKeysList += "➣ " + element.trim() + "\n");

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  "body": {
                    "text": `You entered the following keywords and key-phrases:\n\n${appendedKeysList}\nIs this correct?`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "J10.YES",
                          "title": "Yes",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "J10.NO",
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
                  "body": "We seem to have missed your response.\n\nPlease list up to 5 keywords and key-phrases, separated by a comma.\n\nAn example of key words and phrases👇🏾\nbirthday, present, gift, birthday present for husband, birthday present ideas",
                },
              };
            }
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 4 of 5 - Product Keywords*\n\nWhat keywords and key-phrases will users search for when looking for your product?\n\nPlease list up to 5 keywords and key-phrases, each separated by a comma.\n\nAn example of key words and phrases👇🏾\nbirthday, present, gift, birthday present for husband, birthday present ideas",
              },
            };
          }
        }
        break;
      case "J10":
        {
          if (messageType == "buttonReply" && buttonReplyID == "J10.YES") {
            responseMenu = jCategoryListMenu;

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J11",
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
                  "text": "*Step 5 of 5 - Product Category*\n\nUse the list below to choose the category your product belongs to.",
                },
                "action": {
                  "button": "Choose a category",
                  "sections": [
                    {

                      "rows": responseMenu,
                    },
                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "J10.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J9",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
            productRef.set({
              "productKeys": fs.FieldValue.delete(),
            });


            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "No worries, lets try again 😃.\n\nPlease list 5 or less keywords and key-phrases, seperated by a comma.\n\nAn example of key words and phrases👇🏾\nbirthday, present, gift, birthday present for husband, birthday present ideas",
              },
            };
          }
        }
        break;
      case "J11":
        {
          if (listReplyID && categoryListReplyIDs[listReplyID] != undefined) {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J12",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});


            switch (listReplyID) {
              case "1":
                {
                  responseMenu = clothingSubCategoryListMenu;
                }
                break;
              case "2":
                {
                  responseMenu = shoesSubCategoryListMenu;
                }
                break;
              case "3":
                {
                  responseMenu = watchesnJewelrySubCategoryListMenu;
                }
                break;
              case "4":
                {
                  responseMenu = beautySubCategoryListMenu;
                }
                break;
              case "5":
                {
                  responseMenu = fragrancesSubCategoryListMenu;
                }
                break;
              case "6":
                {
                  responseMenu = homenGardenSubCategoryListMenu;
                }
                break;
              case "7":
                {
                  responseMenu = toysnGamesSubCategoryListMenu;
                }
                break;
              case "8":
                {
                  responseMenu = sportsSubCategoryListMenu;
                }
                break;
              case "9":
                {
                  responseMenu = electronicsSubCategoryListMenu;
                }
                break;
              case "10":
                {
                  responseMenu = automotiveSubCategoryListMenu;
                }
                break;
              default:
              {
                responseMenu = categoryListMenu;
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": `${userPhoneNumber}`,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "body": {
                      "text": "*Step 5 of 5 - Product Category*\n\nUse the list below to choose the category your product belongs to.",
                    },
                    "action": {
                      "button": "Choose a category",
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

            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": `${userPhoneNumber}`,
              "type": "interactive",
              "interactive": {
                "type": "list",
                "body": {
                  "text": "*Product Sub-Category*\n\nUse the list below to choose the sub-category your product belongs to.",
                },
                "action": {
                  "button": "Choose a category",
                  "sections": [
                    {

                      "rows": responseMenu,
                    },
                  ],
                },
              },
            };
          } else {
            responseMenu = categoryListMenu;

            responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": `${userPhoneNumber}`,
              "type": "interactive",
              "interactive": {
                "type": "list",
                "body": {
                  "text": "*Step 5 of 5 - Product Category*\n\nUse the list below to choose the category your product belongs to.",
                },
                "action": {
                  "button": "Choose a category",
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
        break;
      case "J12":
        {
          if (messageType == "listReply") {
            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
            productRef.set({
              "productCategory": listReplyID,
              "trending": false,
              "productReviews": 1,
              "numberOfPurchases": 1,
            }, {merge: true}).then(()=>{
              if (userPhoneNumber == "16475577272") {
                productRef.get().then((doc) => {
                  const productDescription = doc.data()["productDescription"];
                  const productTitle = doc.data()["productTitle"];
                  const productKeywords = doc.data()["productKeys"];
                  const productReviews = doc.data()["productReviews"];
                  const productLink = doc.data()["productLink"];
                  const productScore = doc.data()["productScore"];
                  const productHasColors = doc.data()["productHasColors"];
                  const productHasSizes = doc.data()["productHasSizes"];
                  const price = doc.data()["productPrice"].split("$")[1];
                  const availableCountries = ["CA", "UG", "RW", "NG", "GH", "MZ", "KE", "TZ", "MW", "NA", "BW", "LS", "ZA", "ZM", "ZW"];
                  const objectID = doc.id;
                  let priceInUSD = 0.0;
                  let productPrice = "";
                  const imageRefreshedOn = currentMessageTimeStamp;


                  const checker = price.includes(",");
                  if (checker) {
                    priceInUSD = parseFloat(`${price.split(",")[0]}${price.split(",")[1]}`);
                  } else {
                    priceInUSD = parseFloat(price);
                  }


                  availableCountries.forEach((country)=>{
                    const index = client.initIndex(`${country}_product_index`);

                    switch (country) {
                      case "CA":
                        {
                          const rawCAD = priceInUSD;
                          const canadaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "CAD",
                          });
                          productPrice = canadaFormatter.format(rawCAD);
                        }
                        break;
                      case "UG":
                        {
                          const rawUGXShilling = priceInUSD*currentUSDExchangeRates["UG"];
                          const ugandaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "UGX",
                          });
                          productPrice = ugandaFormatter.format(rawUGXShilling);
                        }
                        break;
                      case "RW":
                        {
                          const rawRWFranc = priceInUSD*currentUSDExchangeRates["RW"];
                          const rwandaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "RWF",
                          });
                          productPrice = rwandaFormatter.format(rawRWFranc);
                        }
                        break;
                      case "GH":
                        {
                          const rawGHSCedi = priceInUSD*currentUSDExchangeRates["GH"];
                          const ghanaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "GHS",
                          });
                          productPrice = ghanaFormatter.format(rawGHSCedi);
                        }
                        break;
                      case "NG":
                        {
                          const rawNGNaira = priceInUSD*currentUSDExchangeRates["NG"];
                          const nigeriaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "NGN",
                          });
                          productPrice = nigeriaFormatter.format(rawNGNaira);
                        }
                        break;
                      case "MZ":
                        {
                          const rawMZNMetical = priceInUSD*currentUSDExchangeRates["MZ"];
                          const mozambiqueFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "MZN",
                          });
                          productPrice = mozambiqueFormatter.format(rawMZNMetical);
                        }
                        break;
                      case "KE":
                        {
                          const rawKEShilling = priceInUSD*currentUSDExchangeRates["KE"];
                          const kenyaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "KES",
                          });
                          productPrice = kenyaFormatter.format(rawKEShilling);
                        }
                        break;
                      case "TZ":
                        {
                          const rawTZShilling = priceInUSD*currentUSDExchangeRates["TZ"];
                          const tanzaniaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "TZS",
                          });
                          productPrice = tanzaniaFormatter.format(rawTZShilling);
                        }
                        break;
                      case "MW":
                        {
                          const rawMWKwacha = priceInUSD*currentUSDExchangeRates["MW"];
                          const malawiFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "MWK",
                          });
                          productPrice = malawiFormatter.format(rawMWKwacha);
                        }
                        break;
                      case "NA":
                        {
                          const rawNADollar = priceInUSD*currentUSDExchangeRates["NA"];
                          const namibiaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "NAD",
                          });
                          productPrice = namibiaFormatter.format(rawNADollar);
                        }
                        break;
                      case "BW":
                        {
                          const rawPula = priceInUSD*currentUSDExchangeRates["BW"];
                          const botswanaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "BWP",
                          });
                          productPrice = botswanaFormatter.format(rawPula);
                        }
                        break;
                      case "LS":
                        {
                          const rawLoti = priceInUSD*currentUSDExchangeRates["LS"];
                          const lesothoFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "LSL",
                          });
                          productPrice = lesothoFormatter.format(rawLoti);
                        }
                        break;
                      case "ZA":
                        {
                          const rawRand = priceInUSD*currentUSDExchangeRates["ZA"];
                          const southAfricaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "ZAR",
                          });
                          productPrice = southAfricaFormatter.format(rawRand);
                        }
                        break;
                      case "ZM":
                        {
                          const rawZMWKwacha = priceInUSD*currentUSDExchangeRates["ZM"];
                          const zambiaFormatter = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "ZMW",
                          });
                          productPrice = zambiaFormatter.format(rawZMWKwacha);
                        }
                        break;
                      case "ZW":
                        {
                          const rawUSDollar = priceInUSD;
                          const zimbabweFormatter = new Intl.NumberFormat("en-CA", {
                            style: "currency",
                            currency: "USD",
                          });
                          productPrice = zimbabweFormatter.format(rawUSDollar);
                        }
                        break;
                    }


                    if (productHasSizes) {
                      const productSizes = doc.data()["productSizes"];

                      if (productHasColors) {
                        const productColors = doc.data()["productColors"];
                        index
                            .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productColors, productSizes, productScore, productReviews, productLink, "live": true}]).then((result) =>{
                              // const docRef = fs.collection("algoliaResult");
                              // docRef.add({
                              //   "algolia": "algolia result is:" + result,
                              // });
                            }).catch((err) => {
                              console.log(err);
                              const docRef = fs.collection("algoliaError");
                              docRef.add({
                                "algolia": "algolia result is:" + err,
                              });
                            });
                      } else {
                        index
                            .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productSizes, productScore, productReviews, productLink, "live": true}]).then((result) =>{
                              // const docRef = fs.collection("algoliaResult");
                              // docRef.add({
                              //   "algolia": "algolia result is:" + result,
                              // });
                            }).catch((err) => {
                              console.log(err);
                              const docRef = fs.collection("algoliaError");
                              docRef.add({
                                "algolia": "algolia result is:" + err,
                              });
                            });
                      }
                    } else {
                      if (productHasColors) {
                        const productColors = doc.data()["productColors"];
                        index
                            .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productColors, productScore, productReviews, productLink, "live": true}]).then((result) =>{
                              // const docRef = fs.collection("algoliaResult");
                              // docRef.add({
                              //   "algolia": "algolia result is:" + result,
                              // });
                            }).catch((err) => {
                              console.log(err);
                              const docRef = fs.collection("algoliaError");
                              docRef.add({
                                "algolia": "algolia result is:" + err,
                              });
                            });
                      } else {
                        index
                            .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productScore, productReviews, productLink, "live": true}]).then((result) =>{
                              // const docRef = fs.collection("algoliaResult");
                              // docRef.add({
                              //   "algolia": "algolia result is:" + result,
                              // });
                            }).catch((err) => {
                              console.log(err);
                              const docRef = fs.collection("algoliaError");
                              docRef.add({
                                "algolia": "algolia result is:" + err,
                              });
                            });
                      }
                    }
                  });
                }).catch((err) => {
                  const docRef = fs.collection("algoliaErrors");
                  docRef.add({
                    "mapJerror": "algolia error is:" + err.message,
                  });
                });

                ssf.superStoreFunction(countryCode, currentProductID, fs, currentUSDExchangeRates);
              } else {
                productRef.get().then((doc) => {
                  const productDescription = doc.data()["productDescription"];
                  const productTitle = doc.data()["productTitle"];
                  const productKeywords = doc.data()["productKeys"];
                  const productReviews = doc.data()["productReviews"];
                  const productLink = doc.data()["productLink"];
                  const productScore = doc.data()["productScore"];
                  const productHasColors = doc.data()["productHasColors"];
                  const objectID = doc.id;
                  const index = client.initIndex(`${countryCode}_product_index`);
                  const productPrice = doc.data()["productPrice"];
                  const imageRefreshedOn = currentMessageTimeStamp;

                  if (productHasColors) {
                    const productColors = doc.data()["productColors"];
                    index
                        .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productColors, productScore, productReviews, productLink, "live": true}]).then((result) =>{
                          // const docRef = fs.collection("algoliaResult");
                          // docRef.add({
                          //   "algolia": "algolia result is:" + result,
                          // });
                        }).catch((err) => {
                          console.log(err);
                          const docRef = fs.collection("algoliaError");
                          docRef.add({
                            "algolia": "algolia result is:" + err,
                          });
                        });
                  } else {
                    index
                        .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productScore, productReviews, productLink, "live": true}]).then((result) =>{
                          // const docRef = fs.collection("algoliaResult");
                          // docRef.add({
                          //   "algolia": "algolia result is:" + result,
                          // });
                        }).catch((err) => {
                          console.log(err);
                          const docRef = fs.collection("algoliaError");
                          docRef.add({
                            "algolia": "algolia result is:" + err,
                          });
                        });
                  }
                }).catch((err) => {
                  const docRef = fs.collection("algoliaErrors");
                  docRef.add({
                    "mapJerror": "algolia error is:" + err.message,
                  });
                });
              }
            });

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J13",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": "*Congratulations on listing your product!*\n\nYou can view and edit this product in the View Product section of the seller services menu.\n\nWhat would you like to do now?",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J13.LAP",
                        "title": "List Another Product",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "J13.VM",
                        "title": "View Menu",
                      },
                    },
                  ],
                },
              },
            };
          } else {
            responseMenu = categoryListMenu;

            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J11",
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
                  "text": "*Step 5 of 5 - Product Category*\n\nUse the list below to choose the category your product belongs to.",
                },
                "action": {
                  "button": "Choose a category",
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
        break;
      case "J13":
        {
          if (messageType == "buttonReply" && buttonReplyID == "J13.LAP") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "J13.VM") {
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
          }
        }
        break;
      default:
      {
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
      }
    }

    if (chatFlowMapID !== "J2") {
      axios({
        method: "POST",
        url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
        data: responseToUserText,
        headers: {"Content-Type": "application/json"},
      }).catch(function(error) {
        const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
        docRef.add({
          "mapJerror": "axios error for map J is:" + error.message,
          "isResolved": false,
        });
      });
    }


    resolve();
  });
}

exports.mapJ = mapJ;

