require("dotenv").config();
const axios = require("axios");
const {parser} = require("html-metadata-parser");

function sendTenTrendingResults(countryCode, userPhoneNumber, productCategory, currentBrowseProductsIndex, currentMessageTimeStamp, fs, client) {
  return new Promise((resolve, reject) => {
    let responseToUserText = {};
    let productTitle = "";
    let productDescription = "";
    let productPrice = "";
    let productLink = "";
    let productID = "";
    let productReviews = "";
    let productPDFLink = "";
    let productStars = "";
    let imageRefreshedOn = "0";
    let productScore = 0;
    let responseButtons = [];

    // First response while fetching productss
    responseToUserText = {
      "messaging_product": "whatsapp",
      "to": userPhoneNumber,
      "text": {
        "body": "Give us a moment to find todays hottest products......",
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

    const query = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").where("trending", "==", true).where("live", "==", true);
    query.get().then((snapShot) => {
      let counter = 0;
      // const currentSnapshotIndex = 0;
      const size = snapShot.size;


      // Size 0 is returned when snapshot is empty
      if (size <= 0) {
        const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
        docRef2.set({
          "chatFlowMapID": "D4",
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
              "text": "We couldn't find any products in this category.\n\nPlease try a different category.",
            },
            "action": {
              "buttons": [
                {
                  "type": "reply",
                  "reply": {
                    "id": "CC",
                    "title": "Change categories",
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
      } else {
        snapShot.forEach((doc) => {
          // // NEVER LEAVE ON LIVE DEPLOY
          // // USE TO ADD ITEM TO A CATEGORY
          // const availableCountries = ["CA", "UG", "RW", "BI", "KE", "TZ", "MW", "NA", "BW", "LS", "ZA", "ZM", "ZW", "GH", "NG", "MZ"];
          // let priceInUSD = 0.0;
          // const price = doc.data()["productPrice"].split("$")[1];
          // const checker = price.includes(",");
          // if (checker) {
          //   priceInUSD = parseFloat(`${price.split(",")[0]}${price.split(",")[1]}`);
          // } else {
          //   priceInUSD = parseFloat(price);
          // }
          // const productHasSizes = false;
          // let productHasColors = false;
          // const productCategory = doc.data()["productCategory"];
          // if (productCategory == "4.1") {
          //   productHasColors = false;
          // } else {
          //   productHasColors = true;
          // }
          // productDescription = doc.data()["productDescription"];
          // productTitle = doc.data()["productTitle"];
          // const productKeywords = doc.data()["productKeys"];
          // productReviews = doc.data()["productReviews"];
          // productLink = doc.data()["productLink"];
          // productScore = doc.data()["productScore"];
          // productPrice = "";
          // imageRefreshedOn = currentMessageTimeStamp;
          // availableCountries.forEach((country)=>{
          //   // let productPrice = "";
          //   const index = client.initIndex(`${country}_product_index`);
          //   switch (country) {
          //     case "GH":
          //       {
          //         const rawGHSCedi = priceInUSD*15;
          //         const ghanaFormatter = new Intl.NumberFormat("en-US", {
          //           style: "currency",
          //           currency: "GHS",
          //         });
          //         productPrice = ghanaFormatter.format(rawGHSCedi);
          //       }
          //       break;
          //     case "NG":
          //       {
          //         const rawNGNaira = priceInUSD*500;
          //         const nigeriaFormatter = new Intl.NumberFormat("en-US", {
          //           style: "currency",
          //           currency: "NGN",
          //         });
          //         productPrice = nigeriaFormatter.format(rawNGNaira);
          //       }
          //       break;
          //     case "MZ":
          //       {
          //         const rawMZNMetical = priceInUSD*80;
          //         const mozambiqueFormatter = new Intl.NumberFormat("en-US", {
          //           style: "currency",
          //           currency: "MZN",
          //         });
          //         productPrice = mozambiqueFormatter.format(rawMZNMetical);
          //       }
          //       break;
          //     // case "CA":
          //     //   // productPrice = price;
          //     //   break;
          //     // case "UG":
          //     //   // {
          //     //   //   const rawUGXShilling = priceInUSD*4000;
          //     //   //   const ugandaFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "UGX",
          //     //   //   });
          //     //   //   productPrice = ugandaFormatter.format(rawUGXShilling);
          //     //   // }
          //     //   break;
          //     // case "RW":
          //     //   // {
          //     //   //   const rawRWFranc = priceInUSD*1100;
          //     //   //   const rwandaFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "RWF",
          //     //   //   });
          //     //   //   productPrice = rwandaFormatter.format(rawRWFranc);
          //     //   // }
          //     //   break;
          //     // case "BI":
          //     //   // {
          //     //   //   const rawBIFranc = priceInUSD*2100;
          //     //   //   const burundiFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "BIF",
          //     //   //   });
          //     //   //   productPrice = burundiFormatter.format(rawBIFranc);
          //     //   // }
          //     //   break;
          //     // case "KE":
          //     //   // {
          //     //   //   const rawKEShilling = priceInUSD*140;
          //     //   //   const kenyaFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "KES",
          //     //   //   });
          //     //   //   productPrice = kenyaFormatter.format(rawKEShilling);
          //     //   // }
          //     //   break;
          //     // case "TZ":
          //     //   // {
          //     //   //   const rawTZShilling = priceInUSD*2400;
          //     //   //   const tanzaniaFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "TZS",
          //     //   //   });
          //     //   //   productPrice = tanzaniaFormatter.format(rawTZShilling);
          //     //   // }
          //     //   break;
          //     // case "MW":
          //     //   // {
          //     //   //   const rawMWKwacha = priceInUSD*1100;
          //     //   //   const malawiFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "MWK",
          //     //   //   });
          //     //   //   productPrice = malawiFormatter.format(rawMWKwacha);
          //     //   // }
          //     //   break;
          //     // case "NA":
          //     //   // {
          //     //   //   const rawNADollar = priceInUSD*19;
          //     //   //   const namibiaFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "NAD",
          //     //   //   });
          //     //   //   productPrice = namibiaFormatter.format(rawNADollar);
          //     //   // }
          //     //   break;
          //     // case "BW":
          //     //   // {
          //     //   //   const rawPula = priceInUSD*15;
          //     //   //   const botswanaFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "BWP",
          //     //   //   });
          //     //   //   productPrice = botswanaFormatter.format(rawPula);
          //     //   // }
          //     //   break;
          //     // case "LS":
          //     //   // {
          //     //   //   const rawLoti = priceInUSD*19;
          //     //   //   const lesothoFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "LSL",
          //     //   //   });
          //     //   //   productPrice = lesothoFormatter.format(rawLoti);
          //     //   // }
          //     //   break;
          //     // case "ZA":
          //     //   // {
          //     //   //   const rawRand = priceInUSD*19;
          //     //   //   const southAfricaFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "ZAR",
          //     //   //   });
          //     //   //   productPrice = southAfricaFormatter.format(rawRand);
          //     //   // }
          //     //   break;
          //     // case "ZM":
          //     //   // {
          //     //   //   const rawZMWKwacha = priceInUSD*20;
          //     //   //   const zambiaFormatter = new Intl.NumberFormat("en-US", {
          //     //   //     style: "currency",
          //     //   //     currency: "ZMW",
          //     //   //   });
          //     //   //   productPrice = zambiaFormatter.format(rawZMWKwacha);
          //     //   // }
          //     //   break;
          //     // case "ZW":
          //     //   // {
          //     //   //   const rawUSDollar = priceInUSD;
          //     //   //   const zimbabweFormatter = new Intl.NumberFormat("en-CA", {
          //     //   //     style: "currency",
          //     //   //     currency: "USD",
          //     //   //   });
          //     //   //   productPrice = zimbabweFormatter.format(rawUSDollar);
          //     //   // }
          //     //   break;
          //   }

          //   const objectID = doc.id;


          //   if (productHasSizes) {
          //     const productSizes = doc.data()["productSizes"];

          //     if (productHasColors) {
          //       const productColors = doc.data()["productColors"];
          //       index
          //           .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productColors, productSizes, productScore, productReviews, productLink, "live": true}]).then((result) =>{
          //             const docRef = fs.collection("algoliaResult");
          //             docRef.add({
          //               "algolia": "algolia result is:" + result,
          //             });
          //           }).catch((err) => {
          //             console.log(err);
          //             const docRef = fs.collection("algoliaError");
          //             docRef.add({
          //               "algolia": "algolia result is:" + err,
          //             });
          //           });
          //     } else {
          //       index
          //           .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productSizes, productScore, productReviews, productLink, "live": true}]).then((result) =>{
          //             const docRef = fs.collection("algoliaResult");
          //             docRef.add({
          //               "algolia": "algolia result is:" + result,
          //             });
          //           }).catch((err) => {
          //             console.log(err);
          //             const docRef = fs.collection("algoliaError");
          //             docRef.add({
          //               "algolia": "algolia result is:" + err,
          //             });
          //           });
          //     }
          //   } else {
          //     if (productHasColors) {
          //       const productColors = doc.data()["productColors"];
          //       index
          //           .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productColors, productScore, productReviews, productLink, "live": true}]).then((result) =>{
          //             const docRef = fs.collection("algoliaResult");
          //             docRef.add({
          //               "algolia": "algolia result is:" + result,
          //             });
          //           }).catch((err) => {
          //             console.log(err);
          //             const docRef = fs.collection("algoliaError");
          //             docRef.add({
          //               "algolia": "algolia result is:" + err,
          //             });
          //           });
          //     } else {
          //       index
          //           .saveObjects([{objectID, imageRefreshedOn, productPrice, productDescription, productTitle, productKeywords, productScore, productReviews, productLink, "live": true}]).then((result) =>{
          //             const docRef = fs.collection("algoliaResult");
          //             docRef.add({
          //               "algolia": "algolia result is:" + result,
          //             });
          //           }).catch((err) => {
          //             console.log(err);
          //             const docRef = fs.collection("algoliaError");
          //             docRef.add({
          //               "algolia": "algolia result is:" + err,
          //             });
          //           });
          //     }
          //   }
          // });

          // const availableCountries = ["GH", "NG", "MZ"];
          // availableCountries.forEach((country)=>{
          //   const currentProductID = doc.id;
          //   const countryCode = country;
          //   superStoreFunction(countryCode, currentProductID);
          // });


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

          if (counter <= (currentBrowseProductsIndex+10) && counter > currentBrowseProductsIndex) {
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
                          "id": `ATC::${productID}`,
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
                          "id": `ATC::${productID}`,
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
                "mapJerror": "axios error for sendFiveBrowseResults1 is:" + error.message,
                "isResolved": false,
                "saver": `*${productTitle}*\n${productDescription}\n\n${productPrice}\n\nView product👇🏾\n${shortenedProductLink}${productID}${productReviews}${productStars}`,
              });
            });

            if (counter == currentBrowseProductsIndex+10 && counter < size ) {
              const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef2.set({
                "chatFlowMapID": "D4",
                "currentProductCategoryID": productCategory,
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "currentBrowseProductsIndex": counter,
              }, {merge: true});

              responseButtons = [
                {
                  "type": "reply",
                  "reply": {
                    "id": "CC",
                    "title": "Change category",
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
            } else if (counter == currentBrowseProductsIndex+10 || counter == size) {
              const docRef2 = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef2.set({
                "chatFlowMapID": "D4",
                "currentProductCategoryID": productCategory,
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "currentBrowseProductsIndex": counter,
              }, {merge: true});

              responseButtons = [
                {
                  "type": "reply",
                  "reply": {
                    "id": "CC",
                    "title": "Change category",
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
                    "mapJerror": "axios error for sendFiveBrowseResults2 is:" + error.message,
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
      const docRef = fs.collection("sendFiveBrowseResultsTest").doc("test2");
      docRef.set({
        error,
      }, {merge: true});
    });

    return resolve();
  });
}

exports.sendTenTrendingResults = sendTenTrendingResults;
