require("dotenv").config();
const axios = require("axios");
const {parser} = require("html-metadata-parser");


function j2Extension(countryCode, productLink, userName, userPhoneNumber, currentMessageTimeStamp, fs, FieldValue, merchantListMenu, supportedCurrencyCodes) {
  return new Promise((resolve, reject) => {
    let responseToUserText = {};
    parser(productLink).then((result)=>{
      if (result.og["description"] !== undefined) {
        const fixedDescriptionArray = result.og["description"].split("·");
        if (fixedDescriptionArray[1] !== undefined) {
          const query = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").where("productLink", "==", productLink);
          query.get().then((snapShot) => {
            if (snapShot.empty) {
              const fixedTitleArray = result.og["title"].split(` from ${userName} `);
              const productTitle = fixedTitleArray[0].trim();
              const productDescription = fixedDescriptionArray[0].trim();
              const price = fixedDescriptionArray[1].trim();
              const productImage = result.og["image"];

              const b = `0.${price.split(".")[1].trim()}`;
              const c = price.split(".")[0].trim();
              const c2 = c.replace(/\D/g, "");
              const c3 = parseFloat(c2) + parseFloat(b);

              const formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: `${supportedCurrencyCodes[countryCode]}`,
              });

              const productPrice = formatter.format(c3);

              const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts");
              productRef.add({
                userPhoneNumber,
                "prohibited": false,
                "live": true,
                "outOfStock": false,
                "createdON": currentMessageTimeStamp,
                "productTitle": productTitle,
                "productDescription": productDescription,
                "productPrice": productPrice,
                productImage,
                productLink,
              }).then((docRefID) => {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "currentProductID": docRefID.id,
                  "chatFlowMapID": "J3",
                  "lastMessageTimeStamp": currentMessageTimeStamp,
                  "userProducts": FieldValue.arrayUnion(`${docRefID.id}`),
                }, {merge: true});

                const responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": "*Step 2 of 5 - Product Sizes*\n\nDo you offer different sizes for this product?\n\nAll sizes of this product will share the same price.",
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

                axios({
                  method: "POST",
                  url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
                  data: responseToUserText,
                  headers: {"Content-Type": "application/json"},
                }).catch(function(error) {
                  const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
                  docRef.add({
                    "mapJerror": "axios error for map J2X is:" + error.message,
                    "isResolved": false,
                  });
                });
              });
            } else {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "00",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              const responseMenu = merchantListMenu;

              const responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": `${userPhoneNumber}`,
                "type": "interactive",
                "interactive": {
                  "type": "list",
                  "body": {
                    "text": "That product already exists in your catalog. To edit this product, use the \"View products\" option.\n\nTo continue, please choose an option from the *Seller Services* menu below or respond 'X' to return home.",
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

              axios({
                method: "POST",
                url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
                data: responseToUserText,
                headers: {"Content-Type": "application/json"},
              }).catch(function(error) {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
                docRef.add({
                  "mapJerror": "axios error for map J2X is:" + error.message,
                  "isResolved": false,
                });
              });
            }
          }).catch((error) => {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "00",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            const responseMenu = merchantListMenu;

            const responseToUserText = {
              "messaging_product": "whatsapp",
              "recipient_type": "individual",
              "to": `${userPhoneNumber}`,
              "type": "interactive",
              "interactive": {
                "type": "list",
                "body": {
                  "text": "We encountered an error while listing your product. Please try again or contact support if this problem continues.\n\nTo continue, please choose an option from the *Seller Services* menu below or respond 'X' to return home.",
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

            axios({
              method: "POST",
              url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
              data: responseToUserText,
              headers: {"Content-Type": "application/json"},
            }).catch(function(error) {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
              docRef.add({
                "mapJerror": "axios error for map J2X is:" + error.message,
                "isResolved": false,
              });
            });
          });
        } else {
          const responseToUserText = {
            "messaging_product": "whatsapp",
            "to": userPhoneNumber,
            "text": {
              "body": "Your whatsapp product needs to have both a price and a description.\n\nPlease add a whatsapp product with both price and description to proceed.",
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
              "mapJerror": "axios error for map J2X is:" + error.message,
              "isResolved": false,
            });
          });
        }
      } else {
        const responseToUserText = {
          "messaging_product": "whatsapp",
          "to": userPhoneNumber,
          "text": {
            "body": "Your whatsapp product needs to have both a price and a description.\n\nPlease add a whatsapp product with both price and description to proceed.",
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
            "mapJerror": "axios error for map J2X is:" + error.message,
            "isResolved": false,
          });
        });
      }
    }).catch((error)=>{
      const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
      docRef.add({
        "mapJ2error": "firebase error for map is:" + error.message,
        "isResolved": false,
      });

      responseToUserText = {
        "messaging_product": "whatsapp",
        "to": userPhoneNumber,
        "text": {
          "body": "We ran into some issues processing your product link. Please check your product link and try again.",
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
          "mapJerror": "axios error for map J2X parser error is:" + error.message,
          "isResolved": false,
        });
      });
    });


    return resolve();
  });
}

exports.j2Extension = j2Extension;
