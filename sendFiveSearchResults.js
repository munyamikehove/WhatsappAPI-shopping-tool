require("dotenv").config();
const axios = require("axios");
const {parser} = require("html-metadata-parser");

function sendFiveSearchResults(userTextMessage, countryCode, userPhoneNumber, currentBrowseProductsIndex, currentMessageTimeStamp, currentSearchResultsID, isNewSearch, fs, client) {
  return new Promise((resolve, reject) => {
    let responseToUserText = {};
    const index = client.initIndex(`${countryCode}_product_index`);

    let productTitle = "";
    let productDescription = "";
    let productPrice = "";
    let productLink = "";
    let productID = "";
    let productReviews = "";
    let productPDFLink = "";
    let productStars = "";
    let searchTerm = "";
    let imageRefreshedOn = "0";
    let productColors = "";
    let productSizes = "";
    let productScore = 0;
    let counter = 0;
    let live = false;
    let responseButtons = [];

    if (isNewSearch) {
      currentSearchResultsID = Date.now();
    }

    // First response while fetching products
    responseToUserText = {
      "messaging_product": "whatsapp",
      "to": userPhoneNumber,
      "text": {
        "body": "Give us a moment to find your products......",
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
        "mapJerror": "axios error for sendFiveBrowseResults5 is:" + error.message,
        "isResolved": false,
      });
    });


    if (isNewSearch) {
      index
          .search(userTextMessage)
          .then(({hits}) => {
            const resultCount = hits.length;

            if (resultCount>0) {
              hits.forEach((product) => {
                productTitle = product.productTitle;
                productDescription = product.productDescription;
                productScore = product.productScore;
                productReviews = product.productReviews;
                productLink = product.productLink;
                productID = product.objectID;
                searchTerm = userTextMessage;
                productColors = product.productColors;
                productSizes = product.productSizes;
                live = product.live;
                productPrice = product.productPrice;
                imageRefreshedOn = product.imageRefreshedOn;

                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("searchResults").collection(`search#_${currentSearchResultsID}`).doc(`${productID}`);

                docRef.set({
                  productPrice,
                  imageRefreshedOn,
                  productID,
                  productLink,
                  productReviews,
                  productScore,
                  productSizes,
                  productColors,
                  searchTerm,
                  productDescription,
                  productTitle,
                  live,
                }, {merge: true});
              });
            } else {
              const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef2.set({
                "chatFlowMapID": "C3",
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
                    "text": "We couldn't find any products for this search.\n\nPlease try a different search term or use the browse feature to see all available products.",
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": "NS",
                          "title": "New Search",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "BP",
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
                  "mapJerror": "axios error for sendFiveBrowseResults4 is:" + error.message,
                  "isResolved": false,
                });
              });
            }
          }).then(()=>{
            setTimeout(function() {
              const query = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("searchResults").collection(`search#_${currentSearchResultsID}`).where("live", "==", true);
              query.get().then((snapShot) => {
                counter = 0;
                // const currentSnapshotIndex = 0;
                const size = snapShot.size;


                // Size 0 is returned when snapshot is empty
                if (size > 0) {
                  snapShot.forEach((doc) => {
                    // const algoliaTestRef = fs.collection("algoliaTest").doc(`${doc.id}`);
                    // algoliaTestRef.set({
                    //   "result": doc.data(),
                    // }, {merge: true});

                    // doc.data() is never undefined for query doc snapshots
                    const productData = doc.data();
                    let shortenedProductLink = "";
                    imageRefreshedOn = productData["imageRefreshedOn"];
                    productTitle = productData["productTitle"];
                    productDescription = productData["productDescription"];
                    productPrice = productData["productPrice"];
                    productLink = productData["productLink"];
                    productScore = productData["productScore"];
                    productReviews = productData["productReviews"];
                    productSizes = productData["productSizes"];
                    productColors = productData["productColors"];
                    productPDFLink = productData["productPDFLink"];
                    productID = doc.id;

                    counter = counter+1;

                    switch (true) {
                      case productScore > 0 && productScore <= 20:
                        productStars = "⭐️☆☆☆☆";
                        break;
                      case productScore > 20 && productScore <= 40:
                        productStars = "⭐️⭐️☆☆☆";
                        break;
                      case productScore > 40 && productScore <= 60:
                        productStars = "⭐️⭐️⭐️☆☆";
                        break;
                      case productScore > 60 && productScore <= 80:
                        productStars = "⭐️⭐️⭐️⭐️☆";
                        break;
                      case productScore > 80 && productScore <= 100:
                        productStars = "⭐️⭐️⭐️⭐️⭐️";
                        break;
                    }

                    if (counter <= (currentBrowseProductsIndex+5) && counter > currentBrowseProductsIndex) {
                      shortenedProductLink = productLink.split("https://")[1].trim();

                      // Saved for reviews
                      // \n\nView reviews👇🏾\nwww.reviws.web.app/${productID}
                      if (productReviews > 1) {
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
                                "link": productPDFLink,
                                "filename": "Tap here for product reviews",
                              },
                            },
                            "body": {
                              "text": `*${productTitle}*\n\n${productDescription}\n\n${productPrice}\n\n${productStars} ${productReviews}\n\nView product👇🏾\n${shortenedProductLink}\n\n `,
                            },
                            "action": {
                              "buttons": [
                                {
                                  "type": "reply",
                                  "reply": {
                                    "id": `SH::${productLink}`,
                                    "title": "Share",
                                  },
                                },
                                {
                                  "type": "reply",
                                  "reply": {
                                    "id": "A2",
                                    "title": "Add to cart",
                                  },
                                },
                              ],
                            },
                          },
                        };
                      } else {
                        responseToUserText = {
                          "messaging_product": "whatsapp",
                          "preview_url": true,
                          "recipient_type": "individual",
                          "to": userPhoneNumber,
                          "type": "interactive",
                          "interactive": {
                            "type": "button",
                            // "header": {
                            //   "type": "image",
                            //   "image": {
                            //     "link": productImage,
                            //   },
                            // },
                            "body": {
                              "text": `*${productTitle}*\n\n${productDescription}\n\n${productPrice}\n\nView product👇🏾\n${shortenedProductLink}`,
                            },
                            "footer": {
                              "text": `${productStars} ${productReviews}`,
                            },
                            "action": {
                              "buttons": [
                                {
                                  "type": "reply",
                                  "reply": {
                                    "id": `SH::${productLink}`,
                                    "title": "Share",
                                  },
                                },
                                {
                                  "type": "reply",
                                  "reply": {
                                    "id": `ATC::{"productColors":"${productColors}","productSizes":"${productSizes}","productID":"${productID}","productTitle":"${productTitle}","productLink":"${productLink}","productPrice":"${productPrice}"}`,
                                    "title": "Add to cart",
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
                          "mapJerror": "axios error for sendFiveSearchResults1 is:" + error.message,
                          "isResolved": false,
                          "saver": `*${productTitle}*\n${productDescription}\n\n${productPrice}\n\nView product👇🏾\n${shortenedProductLink}${productID}${productReviews}${productStars}`,
                        });
                      });

                      if (counter == (currentBrowseProductsIndex+5) && counter < size ) {
                        const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                        docRef2.set({
                          "chatFlowMapID": "C3",
                          "lastMessageTimeStamp": currentMessageTimeStamp,
                          "currentSearchResultsID": currentSearchResultsID,
                        }, {merge: true});

                        const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                        docRef.set({
                          "currentBrowseProductsIndex": counter,
                        }, {merge: true});


                        responseButtons = [
                          {
                            "type": "reply",
                            "reply": {
                              "id": "NS",
                              "title": "New Search",
                            },
                          },
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
                              "id": "VM",
                              "title": "View More",
                            },
                          },
                        ];

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
                              "buttons": responseButtons,
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
                              "mapJerror": "axios error for sendFiveBrowseResults2 is:" + error.message,
                              "isResolved": false,
                            });
                          });
                        }, 2500);
                      } else if (counter == currentBrowseProductsIndex+5 || counter == size) {
                        const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                        docRef2.set({
                          "chatFlowMapID": "C3",
                          "lastMessageTimeStamp": currentMessageTimeStamp,
                          "currentSearchResultsID": currentSearchResultsID,
                        }, {merge: true});

                        const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                        docRef.set({
                          "currentBrowseProductsIndex": counter,
                        }, {merge: true});

                        responseButtons = [
                          {
                            "type": "reply",
                            "reply": {
                              "id": "NS",
                              "title": "New Search",
                            },
                          },
                          {
                            "type": "reply",
                            "reply": {
                              "id": "CO",
                              "title": "Checkout",
                            },
                          },
                        ];

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
                              "buttons": responseButtons,
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
                              "mapJerror": "axios error for sendFiveSearchResults2 is:" + error.message,
                              "isResolved": false,
                            });
                          });
                        }, 2500);
                      }
                    }


                    if ((parseInt(currentMessageTimeStamp) - parseInt(imageRefreshedOn)) > 86400 || imageRefreshedOn == null) {
                      parser(productLink).then((result)=>{
                        if (result.og["description"] !== undefined) {
                          const fixedDescriptionArray = result.og["description"].split("·");
                          if (fixedDescriptionArray[1] !== undefined) {
                            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                            productRef.set({
                              "productImage": result.og["image"],
                              "imageRefreshedOn": currentMessageTimeStamp,
                            }, {merge: true});

                            const index = client.initIndex(`${countryCode}_product_index`);
                            const objectID = doc.id;
                            index.partialUpdateObjects([{objectID, "imageRefreshedOn": currentMessageTimeStamp}], {createIfNotExists: false});
                          } else {
                            const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                            productRef.set({
                              "live": false,
                            }, {merge: true});

                            const index = client.initIndex(`${countryCode}_product_index`);
                            const objectID = doc.id;
                            index.partialUpdateObjects([{objectID, "live": false}], {createIfNotExists: false});
                          }
                        } else {
                          const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                          productRef.set({
                            "live": false,
                          }, {merge: true});

                          const index = client.initIndex(`${countryCode}_product_index`);
                          const objectID = doc.id;
                          index.partialUpdateObjects([{objectID, "live": false}], {createIfNotExists: false});
                        }
                      }).catch((error)=>{
                        const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                        productRef.set({
                          "live": false,
                        }, {merge: true});

                        const index = client.initIndex(`${countryCode}_product_index`);
                        const objectID = doc.id;
                        index.partialUpdateObjects([{objectID, "live": false}], {createIfNotExists: false});
                      });
                    }
                  });
                }
              }).catch(function(error) {
                const docRef = fs.collection("sendFiveSearchResultsTest").doc("test2");
                docRef.set({
                  error,
                }, {merge: true});
              });
            }, 750);
          })
          .catch((err) => {
            const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef2.set({
              "chatFlowMapID": "C3",
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
                  "text": "We couldn't find any products for this search.\n\nPlease try a different search term or use the browse feature to see all available products.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "NS",
                        "title": "New Search",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BP",
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
                "mapJerror": "axios error for sendFiveSearchResults4 is:" + error.message,
                "isResolved": false,
              });
            });
          });
    } else {
      const query = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("searchResults").collection(`search#_${currentSearchResultsID}`).where("live", "==", true);
      query.get().then((snapShot) => {
        counter = 0;
        // const currentSnapshotIndex = 0;
        const size = snapShot.size;


        // Size 0 is returned when snapshot is empty
        if (size > 0) {
          snapShot.forEach((doc) => {
            // const algoliaTestRef = fs.collection("algoliaTest").doc(`${doc.id}`);
            // algoliaTestRef.set({
            //   "result": doc.data(),
            // }, {merge: true});

            // doc.data() is never undefined for query doc snapshots
            const productData = doc.data();
            let shortenedProductLink = "";
            imageRefreshedOn = productData["imageRefreshedOn"];
            productTitle = productData["productTitle"];
            productDescription = productData["productDescription"];
            productPrice = productData["productPrice"];
            productLink = productData["productLink"];
            productScore = productData["productScore"];
            productReviews = productData["productReviews"];
            productSizes = productData["productSizes"];
            productColors = productData["productColors"];
            productID = doc.id;

            counter = counter+1;

            switch (true) {
              case productScore > 0 && productScore <= 20:
                productStars = "⭐️☆☆☆☆";
                break;
              case productScore > 20 && productScore <= 40:
                productStars = "⭐️⭐️☆☆☆";
                break;
              case productScore > 40 && productScore <= 60:
                productStars = "⭐️⭐️⭐️☆☆";
                break;
              case productScore > 60 && productScore <= 80:
                productStars = "⭐️⭐️⭐️⭐️☆";
                break;
              case productScore > 80 && productScore <= 100:
                productStars = "⭐️⭐️⭐️⭐️⭐️";
                break;
            }

            if (counter <= (currentBrowseProductsIndex+5) && counter > currentBrowseProductsIndex) {
              shortenedProductLink = productLink.split("https://")[1].trim();

              // Saved for reviews
              // \n\nView reviews👇🏾\nwww.reviws.web.app/${productID}
              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": userPhoneNumber,
                "type": "interactive",
                "interactive": {
                  "type": "button",
                  // "header": {
                  //   "type": "image",
                  //   "image": {
                  //     "link": productImage,
                  //   },
                  // },
                  "body": {
                    "text": `*${productTitle}*\n\n${productDescription}\n\n${productPrice}\n\nView product👇🏾\n${shortenedProductLink}`,
                  },
                  "footer": {
                    "text": `${productStars} ${productReviews}`,
                  },
                  "action": {
                    "buttons": [
                      {
                        "type": "reply",
                        "reply": {
                          "id": `ATC::{"productColors":"${productColors}","productSizes":"${productSizes}","productID":"${productID}","productTitle":"${productTitle}","productLink":"${productLink}","productPrice":"${productPrice}"}`,
                          "title": "Add to cart",
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
                  "mapJerror": "axios error for sendFiveSearchResults1 is:" + error.message,
                  "isResolved": false,
                  "saver": `*${productTitle}*\n${productDescription}\n\n${productPrice}\n\nView product👇🏾\n${shortenedProductLink}${productID}${productReviews}${productStars}`,
                });
              });

              if (counter == (currentBrowseProductsIndex+5) && counter < size ) {
                const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef2.set({
                  "chatFlowMapID": "C3",
                  "lastMessageTimeStamp": currentMessageTimeStamp,
                  "currentSearchResultsID": currentSearchResultsID,
                }, {merge: true});

                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "currentBrowseProductsIndex": counter,
                }, {merge: true});


                responseButtons = [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "NS",
                      "title": "New Search",
                    },
                  },
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
                      "id": "VM",
                      "title": "View More",
                    },
                  },
                ];

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
                      "buttons": responseButtons,
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
                      "mapJerror": "axios error for sendFiveBrowseResults2 is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }, 2500);
              } else if (counter == currentBrowseProductsIndex+5 || counter == size) {
                const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef2.set({
                  "chatFlowMapID": "C3",
                  "lastMessageTimeStamp": currentMessageTimeStamp,
                  "currentSearchResultsID": currentSearchResultsID,
                }, {merge: true});

                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "currentBrowseProductsIndex": counter,
                }, {merge: true});

                responseButtons = [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "NS",
                      "title": "New Search",
                    },
                  },
                  {
                    "type": "reply",
                    "reply": {
                      "id": "CO",
                      "title": "Checkout",
                    },
                  },
                ];

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
                      "buttons": responseButtons,
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
                      "mapJerror": "axios error for sendFiveSearchResults2 is:" + error.message,
                      "isResolved": false,
                    });
                  });
                }, 2500);
              }
            }


            if ((parseInt(currentMessageTimeStamp) - parseInt(imageRefreshedOn)) > 86400 || imageRefreshedOn == null) {
              parser(productLink).then((result)=>{
                if (result.og["description"] !== undefined) {
                  const fixedDescriptionArray = result.og["description"].split("·");
                  if (fixedDescriptionArray[1] !== undefined) {
                    const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                    productRef.set({
                      "productImage": result.og["image"],
                      "imageRefreshedOn": currentMessageTimeStamp,
                    }, {merge: true});

                    const index = client.initIndex(`${countryCode}_product_index`);
                    const objectID = doc.id;
                    index.partialUpdateObjects([{objectID, "imageRefreshedOn": currentMessageTimeStamp}], {createIfNotExists: false});
                  } else {
                    const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                    productRef.set({
                      "live": false,
                    }, {merge: true});

                    const index = client.initIndex(`${countryCode}_product_index`);
                    const objectID = doc.id;
                    index.partialUpdateObjects([{objectID, "live": false}], {createIfNotExists: false});
                  }
                } else {
                  const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                  productRef.set({
                    "live": false,
                  }, {merge: true});

                  const index = client.initIndex(`${countryCode}_product_index`);
                  const objectID = doc.id;
                  index.partialUpdateObjects([{objectID, "live": false}], {createIfNotExists: false});
                }
              }).catch((error)=>{
                const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                productRef.set({
                  "live": false,
                }, {merge: true});

                const index = client.initIndex(`${countryCode}_product_index`);
                const objectID = doc.id;
                index.partialUpdateObjects([{objectID, "live": false}], {createIfNotExists: false});
              });
            }
          });
        }
      }).catch(function(error) {
        const docRef = fs.collection("sendFiveSearchResultsTest").doc("test2");
        docRef.set({
          error,
        }, {merge: true});
      });
    }


    return resolve();
  });
}

exports.sendFiveSearchResults = sendFiveSearchResults;
