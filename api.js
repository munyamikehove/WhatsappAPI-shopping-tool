require("dotenv").config();
const authyAPIKEY = process.env.AUTHY_API_KEY;
const stripeSecretAPIKEY = process.env.SK_LIVE;
const stripe = require("stripe")(stripeSecretAPIKEY);
const authy = require("authy")(authyAPIKEY);
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const axios = require("axios");
const phone = require("awesome-phonenumber");
const moment = require("moment");
const extractUrls = require("extract-urls");
const algoliasearch = require("algoliasearch");
const {parser} = require("html-metadata-parser");

const serviceAccount = require("./serviceAccountKey.json");
const client = algoliasearch(process.env.ALGOLIA_SEARCH_APP_ID, process.env.ALGOLIA_SEARCH_ADMIN_API_KEY);
const index = client.initIndex("tapfuma_product_keywords");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tapfuma-12ab6-default-rtdb.firebaseio.com",
});

const fs = admin.firestore();
fs.settings({ignoreUndefinedProperties: true});
const FieldValue = admin.firestore.FieldValue;


// const currentDate = moment().format("YYYY/MMM/DD");
const mapAIDs = {"A0": "A0", "A1": "A1", "A2": "A2", "A3": "A3", "A4": "A4", "A5": "A5", "A6": "A6", "A7": "A7"};
const mapBIDs = {"B0": "B0", "B1": "B1", "B2": "B2", "B3": "B3", "B4": "B4", "B5": "B5", "B6": "B6", "B7": "B7"};
const mapBXIDs = {"BX0": "BX0", "BX1": "BX1", "BX2": "BX2", "BX3": "BX3", "BX4": "BX4", "BX5": "BX5", "BX6": "BX6", "BX7": "BX7", "BX8": "BX8", "BX9": "BX9", "BX10": "BX10", "BX11": "BX11"};
const mapBZIDs = {"BZ0": "BZ0", "BZ1": "BZ1", "BZ2": "BZ2", "BZ3": "BZ3", "BZ4": "BZ4", "BZ5": "BZ5", "BZ6": "BZ6", "BZ7": "BZ7"};
const mapCIDs = {"C1": "C1", "C2": "C2", "C3": "C3", "C4": "C4", "C5": "C5", "C6": "C6", "C7": "C7", "C8": "C8", "C9": "C9"};
const mapDIDs = {"D1": "D1", "D2": "D2", "D3": "D3", "D4": "D4", "D5": "D5", "D6": "D6", "D7": "D7", "D8": "D8", "D9": "D9"};
const mapEIDs = {};
const mapFIDs = {};
const mapGIDs = {};
const mapIIDs = {};
const mapJIDs = {"J1": "J1", "J2": "J2", "J3": "J3", "J4": "J4", "J5": "J5", "J6": "J6", "J7": "J7", "J8": "J8", "J9": "J9", "J10": "J10", "J11": "J11", "J12": "J12", "J13": "J13"};
const mapKIDs = {};
const mapLIDs = {};
const mapMIDs = {};
const map00IDs = {"00": "00"};
const supportedCountryCodes = {"DE": "DE", "GY": "GY", "PG": "PG", "SB": "SB", "VU": "VU", "FJ": "FJ", "AG": "AG", "DM": "DM", "LC": "LC", "VC": "VC", "GD": "GD", "BB": "BB", "TT": "TT", "LK": "LK", "IN": "IN", "BD": "BD", "PR": "PR", "BS": "BS", "JM": "JM", "BZ": "BZ", "HK": "HK", "SG": "SG", "SL": "SL", "MU": "MU", "PH": "PH", "CA": "CA", "ZA": "ZA", "LS": "LS", "SZ": "SZ", "ZW": "ZW", "BW": "BW", "ZM": "ZM", "NA": "NA", "MW": "MW", "TZ": "TZ", "KE": "KE", "BI": "BI", "RW": "RW", "UG": "UG", "US": "US", "GB": "GB", "AU": "AU", "NZ": "NZ", "IE": "IE", "NG": "NG", "LB": "LB", "AE": "AE", "QA": "QA"};
const supportedCurrencyCodes = {"GY": "gyd", "PG": "pgk", "SB": "sbd", "VU": "vuv", "FJ": "fjd", "AG": "xcd", "DM": "xcd", "LC": "xcd", "VC": "xcd", "GD": "xcd", "BB": "bbd", "TT": "ttd", "LK": "lkr", "IN": "inr", "BD": "bdt", "PR": "usd", "BS": "bsd", "JM": "jmd", "BZ": "bzd", "HK": "hkd", "SG": "sgd", "SL": "sll", "MU": "mur", "PH": "php", "CA": "cad", "ZA": "zar", "LS": "lsl", "SZ": "szl", "ZW": "usd", "BW": "bwp", "ZM": "zmw", "NA": "nad", "MW": "mwk", "TZ": "tzs", "KE": "kes", "BI": "bif", "RW": "rwf", "UG": "ugx", "US": "usd", "GB": "gbp", "AU": "aud", "NZ": "nzd", "IE": "eur", "NG": "ngn", "LB": "usd", "AE": "aed", "QA": "qar"};
const initialBalanceTransaction = {"GY": -2098, "PG": -35, "SB": -82, "VU": -122, "FJ": -23, "AG": -27, "DM": -27, "LC": -27, "VC": -27, "GD": -27, "BB": -20, "TT": -68, "LK": -3686, "IN": -817, "BD": -1060, "PR": -10, "BS": -10, "JM": -1543, "BZ": -20, "HK": -78, "SG": -14, "SL": -176500, "MU": -438, "PH": -581, "CA": -14, "ZA": -178, "LS": -177, "SZ": -179, "ZW": -10, "BW": -133, "ZM": -164, "NA": -177, "MW": -10271, "TZ": -23300, "KE": -1218, "BI": -207, "RW": -107, "UG": -378, "US": -10, "GB": -8, "AU": -16, "NZ": -17, "IE": -10, "NG": -4403, "LB": -10, "AE": -37, "QA": -36};
const categoryListReplyIDs = {"0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10"};
const keyResponseList = {"end": "end", "stop": "stop", "back": "back", "home": "home", "menu": "menu", "esc": "esc", "x": "x"};
const consumerListMenu = [
  {
    "id": "C0",
    "title": "🔎 Search Tapfuma",
  },
  {
    "id": "D0",
    "title": "⭐️ Browse Products",
  },
  {
    "id": "E0",
    "title": "💰 Account Balance",
  },
  {
    "id": "F0",
    "title": "🎁 Chakata",
  },
  {
    "id": "G0",
    "title": "👑 Your Profile",
  },
  {
    "id": "H0",
    "title": "🔑 Seller Services",
  },
  {
    "id": "I0",
    "title": "👋🏾 Tapfuma FAQs",
  },
  {
    "id": "K0",
    "title": "❤️‍🩹 Get Support",
  },
];
const merchantListMenu = [
  {
    "id": "J0",
    "title": "🏷️ List Products",
  },
  {
    "id": "L0",
    "title": "🗂️ View Products",
  },
  {
    "id": "M0",
    "title": "📦 Manage Orders",
  },
  {
    "id": "N0",
    "title": "👈🏾 Back Home",
  },
];
const categoryListMenu = [
  // {
  //   "id": "0",
  //   "title": "🔥 Trending",
  // },
  {
    "id": "1",
    "title": "🥻 Clothing",
  },
  {
    "id": "2",
    "title": "🥾 Shoes",
  },
  {
    "id": "3",
    "title": "💎 Watches & Jewelry",
  },
  {
    "id": "4",
    "title": "💋 Beauty",
  },
  {
    "id": "5",
    "title": "🌹 Fragrances",
  },
  {
    "id": "6",
    "title": "🏡 Home & Garden",
  },
  {
    "id": "7",
    "title": "🪁 Toys and Games",
  },
  {
    "id": "8",
    "title": "⚽️ Sports",
  },
  {
    "id": "9",
    "title": "💻 Electronics",
  },
];
const clothingSubCategoryListMenu = [
  {
    "id": "1.1",
    "title": "Women's clothing",
  },
  {
    "id": "1.2",
    "title": "Men's clothing",
  },
  {
    "id": "1.3",
    "title": "Girls's clothing",
  },
  {
    "id": "1.4",
    "title": "Boys's clothing",
  },
];
const shoesSubCategoryListMenu = [
  {
    "id": "2.1",
    "title": "Women's shoes",
  },
  {
    "id": "2.2",
    "title": "Men's shoes",
  },
  {
    "id": "2.3",
    "title": "Girls's shoes",
  },
  {
    "id": "2.4",
    "title": "Boys's shoes",
  },
  {
    "id": "2.5",
    "title": "Sporting shoes",
  },
];
const watchesnJewelrySubCategoryListMenu = [
  {
    "id": "3.1",
    "title": "Women's watches",
  },
  {
    "id": "3.2",
    "title": "Men's watches",
  },
  {
    "id": "3.3",
    "title": "Women's jewelry",
  },
  {
    "id": "3.4",
    "title": "Men's jewelry",
  },
];
const beautySubCategoryListMenu = [
  {
    "id": "4.1",
    "title": "Skincare",
  },
  {
    "id": "4.2",
    "title": "Nails",
  },
  {
    "id": "4.3",
    "title": "Haircare",
  },
  {
    "id": "4.4",
    "title": "Makeup",
  },
  {
    "id": "4.5",
    "title": "Tools & Accessories",
  },
];
const fragrancesSubCategoryListMenu = [
  {
    "id": "5.1",
    "title": "Women's fragrances",
  },
  {
    "id": "5.2",
    "title": "Men's fragrances",
  },
];
const homenGardenSubCategoryListMenu = [
  {
    "id": "6.1",
    "title": "Kitchen",
  },
  {
    "id": "6.2",
    "title": "Bedroom",
  },
  {
    "id": "6.3",
    "title": "Livingroom",
  },
  {
    "id": "6.4",
    "title": "Bathroom",
  },
  {
    "id": "6.5",
    "title": "Pantry & Storage",
  },
  {
    "id": "6.6",
    "title": "Garden",
  },
  {
    "id": "6.7",
    "title": "Maid Service",
  },
  {
    "id": "6.8",
    "title": "Gardener Service",
  },
  {
    "id": "6.9",
    "title": "Handyman Service",
  },
];
const toysnGamesSubCategoryListMenu = [
  {
    "id": "7.1",
    "title": "0 to 6 months",
  },
  {
    "id": "7.2",
    "title": "7 to 12 months",
  },
  {
    "id": "7.3",
    "title": "1 to 2 years",
  },
  {
    "id": "7.4",
    "title": "3 to 6 years",
  },
  {
    "id": "7.5",
    "title": "7 to 13 years",
  },
  {
    "id": "7.6",
    "title": "14 years & older",
  },
];
const sportsSubCategoryListMenu = [
  {
    "id": "8.1",
    "title": "Soccer",
  },
  {
    "id": "8.2",
    "title": "Cricket",
  },
  {
    "id": "8.3",
    "title": "Tennis",
  },
  {
    "id": "8.4",
    "title": "Golf",
  },
  {
    "id": "8.5",
    "title": "Rugby",
  },
  {
    "id": "8.6",
    "title": "Cycling",
  },
  {
    "id": "8.7",
    "title": "Hockey",
  },
  {
    "id": "8.8",
    "title": "Running",
  },
  {
    "id": "8.9",
    "title": "Basketball",
  },
  {
    "id": "8.10",
    "title": "Volleyball",
  },
];
const electronicsSubCategoryListMenu = [
  {
    "id": "9.1",
    "title": "Cellphones & Tablets",
  },
  {
    "id": "9.2",
    "title": "Headphones & Speakers",
  },
  {
    "id": "9.3",
    "title": "Cameras",
  },
  {
    "id": "9.4",
    "title": "Televisions",
  },
  {
    "id": "9.5",
    "title": "Musical Instruments",
  },
  {
    "id": "9.6",
    "title": "Laptop & Desktop",
  },
  {
    "id": "9.7",
    "title": "Video Gaming",
  },
  {
    "id": "9.8",
    "title": "Monitors",
  },
  {
    "id": "9.9",
    "title": "Cables & Accessories",
  },
  {
    "id": "9.10",
    "title": "Batteries",
  },
];
// Defer automotive until later on in the growth cycle.
// const automotiveSubCategoryListMenu = [
//   {
//     "id": "10.1",
//     "title": "Tires and Wheels",
//   },
//   {
//     "id": "10.2",
//     "title": "Batteries",
//   },
//   {
//     "id": "10.3",
//     "title": "Wiper blades and parts",
//   },
//   {
//     "id": "10.4",
//     "title": "Transmission fluids",
//   },
//   {
//     "id": "10.5",
//     "title": "Engine oils ",
//   },
//   {
//     "id": "10.6",
//     "title": "Gear oils & Grease",
//   },
//   {
//     "id": "10.7",
//     "title": "Filters & PCV Valves",
//   },
//   {
//     "id": "10.8",
//     "title": "Headlights & Bulbs",
//   },
//   {
//     "id": "10.9",
//     "title": "Floor mats & Liners",
//   },
//   {
//     "id": "10.10",
//     "title": "Seat covers & Cushions",
//   },
// ];
let userMessageBody = {};
let responseMenu = [];


// CRUD operations start here

router.get("/", async (req, res) =>{
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];


  if (mode && token) {
    if (mode==="subscribe" && token===process.env.TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  } else {
    res.status(403);
  }
});

router.post("/", async (req, res) => {
  const bodyParam = req.body;
  let messageType = "";
  let chatFlowMapID = "";
  let previousChatFlowMapID = "";
  let lastMessageTimeStamp = "";
  let listReplyID = "";
  let buttonReplyID = "";
  let userTextMessage = "";
  let addressLatitude = "";
  let addressLongitude = "";
  let addressFull = "";
  let addressName = "";
  // let userEmail = "";
  let currentMessageID = "";
  let userName = "";
  let userPhoneNumber = "";
  let currentMessageTimeStamp = "";
  let countryCode = "";
  let officialUserName = "";
  let currentProductID = "";
  let currentBrowseProductsIndex = 0;
  let currentProductCategoryID = "";
  let registeredMerchant = false;
  let registeredUser = false;
  let stripeCustomer = {};


  if (bodyParam != null) {
    // Filter messages to remove delivery/read status posts
    if (bodyParam.entry && bodyParam.entry[0].changes && bodyParam.entry[0].changes[0].value.messages && bodyParam.entry[0].changes[0].value.messages[0]) {
      const requestData = bodyParam.entry[0].changes[0].value.messages[0];
      const requestData2 = bodyParam.entry[0].changes[0].value.contacts[0];
      currentMessageID = requestData["id"];
      userName = requestData2.profile["name"];
      userPhoneNumber = requestData["from"];
      currentMessageTimeStamp = requestData["timestamp"];
      messageType = requestData["type"];


      // Limit inbound message types to text, interactive and location messages
      if (messageType == "text" || messageType == "location" || messageType == "interactive") {
        if (messageType == "interactive") {
          if (`${requestData["interactive"]["type"]}` == "list_reply") {
            messageType = "listReply";
            listReplyID = requestData["interactive"]["list_reply"]["id"];

            userMessageBody = {currentMessageID,
              userName,
              userPhoneNumber,
              "lastMessageTimeStamp": currentMessageTimeStamp,
              messageType,
              listReplyID};
          } else if (`${requestData["interactive"]["type"]}` == "button_reply") {
            messageType = "buttonReply";
            buttonReplyID = requestData["interactive"]["button_reply"]["id"];

            userMessageBody = {currentMessageID,
              userName,
              userPhoneNumber,
              "lastMessageTimeStamp": currentMessageTimeStamp,
              messageType,
              buttonReplyID};
          }
        } else if (messageType == "text") {
          userTextMessage = requestData.text["body"];

          userMessageBody = {currentMessageID,
            userName,
            userPhoneNumber,
            "lastMessageTimeStamp": currentMessageTimeStamp,
            messageType,
            userTextMessage};
        } else if (messageType == "location") {
          addressLatitude = requestData["location"]["latitude"];
          addressLongitude = requestData["location"]["longitude"];
          addressFull = requestData["location"]["address"];
          addressName = requestData["location"]["name"];

          userMessageBody = {currentMessageID,
            userName,
            userPhoneNumber,
            "lastMessageTimeStamp": currentMessageTimeStamp,
            messageType,
            addressName,
            addressFull,
            addressLongitude,
            addressLatitude};
        }

        // Send read receipt upon message reception
        await sendReadReceipt(currentMessageID);

        const parsedNumber = phone(`+${userPhoneNumber}`);
        countryCode = parsedNumber.getRegionCode();

        // Check if user is from a supported country
        if (supportedCountryCodes[countryCode]) {
          const docRef = fs.collection(`${countryCode}`).doc("Messages").collection(`${userPhoneNumber}`);
          docRef.add({
            userMessageBody,
          });

          const userProfile = await getUserProfile(userPhoneNumber, countryCode);

          if (userProfile["exists"]) {
            const userData = userProfile["userDataObj"];
            chatFlowMapID = userData["chatFlowMapID"];
            previousChatFlowMapID = userData["previousChatFlowMapID"];
            // userEmail = userData["userEmail"];
            currentProductCategoryID = userData["currentProductCategoryID"];
            lastMessageTimeStamp = userData["lastMessageTimeStamp"];
            currentProductID = userData["currentProductID"];
            officialUserName = userData["userName"];
            registeredMerchant = userData["registeredMerchant"];
            registeredUser = userData["registeredUser"];
            currentBrowseProductsIndex = userData["currentBrowseProductsIndex"];

            // Reset user chat onEscape
            if (keyResponseList[userTextMessage.toLowerCase()] != undefined) {
              chatFlowMapID = "A0";
            }

            // Create stripe customer account
            // Create authy user account
            if ((chatFlowMapID == "B6" && messageType == "buttonReply" && buttonReplyID == "B6.NEXT") || (chatFlowMapID == "BX10" && messageType == "buttonReply" && buttonReplyID == "BX10.NEXT")) {
              authy.register_user(`${userPhoneNumber}@tapfuma.com`, userPhoneNumber, true, function(err, res) {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "authyID": `${res.user.id}`,
                  "authySetupStatus": `${res["success"]}`,
                  "authySetupMessage": `${res["message"]}`,
                  // "authyOnboardingError": `${err.message}`,
                }, {merge: true});
              });

              stripeCustomer = await stripe.customers.create({
                "phone": `${userPhoneNumber}`,
                "name": `${officialUserName}`,
              });

              await stripe.customers.createBalanceTransaction(
                  `${stripeCustomer["id"]}`,
                  {
                    "amount": initialBalanceTransaction[countryCode],
                    "currency": `${supportedCurrencyCodes[countryCode]}`,
                    "description": "initial account setup balanceTransaction",
                  },
              );

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "stripeCustomerID": `${stripeCustomer["id"]}`,
              }, {merge: true});
            }

            // Set registered user state in profile
            if (chatFlowMapID == "B6" && messageType == "buttonReply" && buttonReplyID == "B6.NEXT") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "registeredUser": true,
              }, {merge: true});
            } else if (chatFlowMapID == "BX10" && messageType == "buttonReply" && buttonReplyID == "BX10.NEXT") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "registeredMerchant": true,
                "registeredUser": true,
              }, {merge: true});
            } else if (chatFlowMapID == "BZ5" && messageType == "buttonReply" && buttonReplyID == "BZ5.YES") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "registeredMerchant": true,
              }, {merge: true});
            }


            //  Route user to appropriate chatFlow
            switch (true) {
              case mapAIDs[chatFlowMapID] != undefined:
                await mapA(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, countryCode);
                break;
              case mapBIDs[chatFlowMapID] != undefined:
                await mapB(userPhoneNumber, previousChatFlowMapID, chatFlowMapID, messageType, buttonReplyID, userTextMessage, currentMessageTimeStamp, countryCode);
                break;
              case mapBXIDs[chatFlowMapID] != undefined:
                await mapBX(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, countryCode, previousChatFlowMapID, userTextMessage, addressLatitude, addressLongitude, addressFull, addressName);
                break;
              case mapBZIDs[chatFlowMapID] != undefined:
                await mapBZ(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, countryCode, previousChatFlowMapID, userTextMessage, addressLatitude, addressLongitude, addressFull, addressName);
                break;
              case mapCIDs[chatFlowMapID] != undefined:
                await mapC(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, countryCode);
                break;
              case mapDIDs[chatFlowMapID] != undefined:
                await mapD(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, listReplyID, countryCode, currentBrowseProductsIndex, currentProductCategoryID);
                break;
              case mapEIDs[chatFlowMapID] != undefined:
                await mapE();
                break;
              case mapFIDs[chatFlowMapID] != undefined:
                await mapF();
                break;
              case mapGIDs[chatFlowMapID] != undefined:
                await mapG();
                break;
              case mapIIDs[chatFlowMapID] != undefined:
                await mapI();
                break;
              case mapJIDs[chatFlowMapID] != undefined:
                await mapJ(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, listReplyID, countryCode, userTextMessage, currentProductID, lastMessageTimeStamp);
                break;
              case mapKIDs[chatFlowMapID] != undefined:
                await mapK();
                break;
              case mapLIDs[chatFlowMapID] != undefined:
                await mapL();
                break;
              case mapMIDs[chatFlowMapID] != undefined:
                await mapM();
                break;
              case map00IDs[chatFlowMapID] != undefined:
                await map00(userPhoneNumber, messageType, listReplyID, currentMessageTimeStamp, countryCode, registeredUser, registeredMerchant, buttonReplyID);
                break;
              default:
              {
                const docRef5 = fs.collection("errors");
                docRef5.add({
                  "errorMessage": "switch statement error: "+chatFlowMapID,
                });
              }
                // code block
            }
          } else {
            chatFlowMapID = "A1";
            await mapA(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, countryCode);
          }
        } else {
          // Send the user a "country not supported" message
          await sendUnsupportedCountryResponse(userPhoneNumber, userName, countryCode, currentMessageTimeStamp);
        }
      } else {
        await sendUnsupportedMessageTypeResponse(userPhoneNumber, userName);
      }


      res.sendStatus(200);
    } else {
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(200);
  }
});

router.put("/:id", async (req, res) => {
  res.send({"Hello": "PUT"});
});

router.delete("/:id", async (req, res) => {
  res.send({"Hello": "DELETE"});
});

// Regular functions begin here

function sendUnsupportedMessageTypeResponse(userPhoneNumber, userName) {
  return new Promise((resolve, reject) => {
    // Send a coming soon message to the user
    const textResponse = {
      "messaging_product": "whatsapp",
      "to": userPhoneNumber,
      "text": {
        "body": `Hi ${userName}. Please send us a text message or a whatsapp location message. We currently do not support messages containing documents, contacts or images.`,
      },
    };

    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: textResponse,
      headers: {"Content-Type": "application/json"},
    }).catch(function(error) {
      const docRef5 = fs.collection("errors");
      docRef5.add({
        "errorMessage": "axios error unsupportedMessage is:" + error.message,
      });
    });

    resolve();
  });
}

function sendUnsupportedCountryResponse(userPhoneNumber, userName, countryCode, currentMessageTimestamp) {
  return new Promise((resolve, reject) => {
    // Send a coming soon message to the user
    const textResponse = {
      "messaging_product": "whatsapp",
      "to": userPhoneNumber,
      "text": {
        "body": `Hi ${userName}. We do not yet provide service to users in your country. Please check back with us soon.`,
      },
    };

    const docRef = fs.collection("stats").doc("unservedUserInterest").collection(`${countryCode}`);
    docRef.add({
      countryCode: `${currentMessageTimestamp}`,
    });

    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: textResponse,
      headers: {"Content-Type": "application/json"},
    }).catch(function(error) {
      const docRef5 = fs.collection("errors");
      docRef5.add({
        "errorMessage": "axios error for unsupportedCountry is:" + error.message,
      });
    });

    resolve();
  });
}

function sendReadReceipt(currentMessageID) {
  return new Promise((resolve, reject) => {
    // Send a read receipt
    const messageReadResponse = {
      "messaging_product": "whatsapp",
      "status": "read",
      "message_id": `${currentMessageID}`,
    };

    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: messageReadResponse,
      headers: {"Content-Type": "application/json"},
    }).catch(function(error) {
      const docRef5 = fs.collection("errors");
      docRef5.add({
        "errorMessage": "axios error readReceipt is:" + error.message,
      });
    });

    resolve();
  });
}

function getUserProfile(userPhoneNumber, countryCode) {
  return new Promise((resolve, reject) => {
    // check if user is new or exisits

    const userDataRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");

    const userData = userDataRef.get().then((doc) => {
      if (doc.exists) {
        const udt = {"userDataObj": doc.data(), "exists": true};
        return udt;
      } else {
        const udt = {"exists": false};
        return udt;
      }
    }).catch((error) => {
      const udt = {"exists": false};
      return udt;
    });


    return resolve(userData);
  });
}

function sendFiveSearchResults(userPhoneNumber, countryCode) {
  return new Promise((resolve, reject) => {
    // check if user is new or exisits

    const userDataRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");

    const userData = userDataRef.get().then((doc) => {
      if (doc.exists) {
        const udt = {"userDataObj": doc.data(), "exists": true};
        return udt;
      } else {
        const udt = {"exists": false};
        return udt;
      }
    }).catch((error) => {
      const udt = {"exists": false};
      return udt;
    });


    return resolve(userData);
  });
}

function sendFiveBrowseResults(countryCode, userPhoneNumber, productCategory, currentBrowseProductsIndex, currentMessageTimeStamp) {
  return new Promise((resolve, reject) => {
    // send 5 browse results

    let responseToUserText = {};


    let productTitle = "";
    let productDescription = "";
    let productPrice = "";
    let productLink = "";
    let productID = "";
    let productReviews = "";
    let productStars = "";
    let imageRefreshedOn = "0";
    let responseButtons = [];

    // First response while fetching products
    responseToUserText = {
      "messaging_product": "whatsapp",
      "to": userPhoneNumber,
      "text": {
        "body": "Give us a second to find your products......",
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

    // Category 0 is the trending category
    if (productCategory == "0") {
      // sendFiveTrendingResults(countryCode, userPhoneNumber, productCategory, currentBrowseProductsIndex);
      return;
    } else {
      const query = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").where("productCategory", "==", productCategory).where("live", "==", true);
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
                "text": "We couldn't find any products in this category.\n\nPlease try a different category or, you could make money by selling the product on Tapfuma💡.",
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
                  {
                    "type": "reply",
                    "reply": {
                      "id": "BS",
                      "title": "Become a seller",
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
            // doc.data() is never undefined for query doc snapshots
            const productData = doc.data();
            let shortenedProductLink = "";
            imageRefreshedOn = productData["imageRefreshedOn"];
            productTitle = productData["productTitle"];
            productDescription = productData["productDescription"];
            productPrice = productData["productPrice"];
            productLink = productData["productLink"];
            productStars = productData["productStars"];
            productReviews = productData["productReviews"];
            productID = doc.id;

            counter = counter+1;

            if (counter <= (currentBrowseProductsIndex+5) && counter > currentBrowseProductsIndex) {
              // const docRefErr = fs.collection("test").doc(doc.id);
              // docRefErr.set({
              //   "id": doc.id,
              //   currentBrowseProductsIndex,
              // });

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
                          "id": `ATC::${productID}`,
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
                  "mapJerror": "axios error for sendFiveBrowseResults1 is:" + error.message,
                  "isResolved": false,
                  "saver": `*${productTitle}*\n${productDescription}\n\n${productPrice}\n\nView product👇🏾\n${shortenedProductLink}${productID}${productReviews}${productStars}`,
                });
              });

              if (counter == (currentBrowseProductsIndex+5) && (currentBrowseProductsIndex+1) < size ) {
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
              } else if (counter == currentBrowseProductsIndex+5 || counter == size) {
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
                    }, {merge: true});
                  } else {
                    const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                    productRef.set({
                      "live": false,
                    }, {merge: true});
                  }
                } else {
                  const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                  productRef.set({
                    "live": false,
                  }, {merge: true});
                }
              }).catch((error)=>{
                const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
                productRef.set({
                  "live": false,
                }, {merge: true});
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
    }


    return resolve();
  });
}

// function sendFiveBrowseResultsExtension(countryCode, userPhoneNumber, productCategory, currentBrowseProductsIndex) {
//   return new Promise((resolve, reject) => {


//     return resolve();
//   });
// }

// function sendFiveTrendingResults(countryCode, userPhoneNumber, productCategory, currentBrowseProductsIndex) {
//   return new Promise((resolve, reject) => {
//     let responseToUserText = {};
//     let productImage = "";
//     let productTitle = "";
//     let productDescription = "";
//     let productPrice = "";
//     let productLink = "";
//     let productID = "";
//     let productReviews = "";
//     let productStars = "";
//     let responseButtons = [];

//     const query = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").where("trending", "==", true).where("live", "==", true);
//     query.get().then((snapShot) => {
//       let counter = 0;
//       const size = snapShot.size;

//       if (size <= 0) {
//         responseToUserText = {
//           "messaging_product": "whatsapp",
//           "recipient_type": "individual",
//           "to": userPhoneNumber,
//           "type": "interactive",
//           "interactive": {
//             "type": "button",
//             "body": {
//               "text": "We couldn't find any products in this category.\n\nPlease try a different category or, you could make money by selling the product on Tapfuma💡.",
//             },
//             "action": {
//               "buttons": [
//                 {
//                   "type": "reply",
//                   "reply": {
//                     "id": "VOC",
//                     "title": "Change categories",
//                   },
//                 },
//                 {
//                   "type": "reply",
//                   "reply": {
//                     "id": "BAS",
//                     "title": "Become a seller",
//                   },
//                 },
//               ],
//             },
//           },
//         };

//         axios({
//           method: "POST",
//           url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
//           data: responseToUserText,
//           headers: {"Content-Type": "application/json"},
//         }).catch(function(error) {
//           const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
//           docRef.add({
//             "mapJerror": "axios error for sendFiveBrowseResults4 is:" + error.message,
//             "isResolved": false,
//           });
//         });
//       } else {
//         snapShot.forEach((doc) => {
//           // doc.data() is never undefined for query doc snapshots
//           const productData = doc.data();
//           let shortenedProductLink = "";
//           productImage = productData["productImage"];
//           productTitle = productData["productTitle"];
//           productDescription = productData["productDescription"];
//           productPrice = productData["productPrice"];
//           productLink = productData["productLink"];
//           productStars = productData["productStars"];
//           productReviews = productData["productReviews"];
//           productID = doc.id;

//           if ((counter >= currentBrowseProductsIndex) && (counter <= currentBrowseProductsIndex+5)) {
//             shortenedProductLink = productLink.split("https://")[1].trim();
//             responseToUserText = {
//               "messaging_product": "whatsapp",
//               "recipient_type": "individual",
//               "to": userPhoneNumber,
//               "type": "interactive",
//               "interactive": {
//                 "type": "button",
//                 "header": {
//                   "type": "image",
//                   "image": {
//                     "link": productImage,
//                   },
//                 },
//                 "body": {
//                   "text": `*${productTitle}*\n\n${productDescription}\n\n${productPrice}\n\nView product👇🏾\n${shortenedProductLink}`,
//                 },
//                 "footer": {
//                   "text": `${productStars} ${productReviews}`,
//                 },
//                 "action": {
//                   "buttons": [
//                     {
//                       "type": "reply",
//                       "reply": {
//                         "id": `ATC::${productID}`,
//                         "title": "Add to cart",
//                       },
//                     },
//                   ],
//                 },
//               },
//             };

//             axios({
//               method: "POST",
//               url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
//               data: responseToUserText,
//               headers: {"Content-Type": "application/json"},
//             }).then(()=>{
//               counter++;

//               if (counter == (currentBrowseProductsIndex+size) || counter == (currentBrowseProductsIndex+5)) {
//                 const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
//                 docRef.set({
//                   "currentBrowseProductsIndex": (currentBrowseProductsIndex+5),
//                 }, {merge: true});

//                 if (currentBrowseProductsIndex+5 >= size) {
//                   responseButtons = [
//                     {
//                       "type": "reply",
//                       "reply": {
//                         "id": "CC",
//                         "title": "Change category",
//                       },
//                     },
//                     {
//                       "type": "reply",
//                       "reply": {
//                         "id": "CO",
//                         "title": "Checkout",
//                       },
//                     },
//                   ];
//                 } else {
//                   responseButtons = [
//                     {
//                       "type": "reply",
//                       "reply": {
//                         "id": "CC",
//                         "title": "Change category",
//                       },
//                     },
//                     {
//                       "type": "reply",
//                       "reply": {
//                         "id": "CO",
//                         "title": "Checkout",
//                       },
//                     },
//                     {
//                       "type": "reply",
//                       "reply": {
//                         "id": "VM",
//                         "title": "View More",
//                       },
//                     },
//                   ];
//                 }

//                 responseToUserText = {
//                   "messaging_product": "whatsapp",
//                   "recipient_type": "individual",
//                   "to": userPhoneNumber,
//                   "type": "interactive",
//                   "interactive": {
//                     "type": "button",
//                     "body": {
//                       "text": "What would you like to do next?",
//                     },
//                     "action": {
//                       "buttons": responseButtons,
//                     },
//                   },
//                 };


//                 axios({
//                   method: "POST",
//                   url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
//                   data: responseToUserText,
//                   headers: {"Content-Type": "application/json"},
//                 }).catch(function(error) {
//                   const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
//                   docRef.add({
//                     "mapJerror": "axios error for sendFiveBrowseResults2 is:" + error.message,
//                     "isResolved": false,
//                   });
//                 });
//               }
//             }).catch(function(error) {
//               const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
//               docRef.add({
//                 "mapJerror": "axios error for sendFiveBrowseResults1 is:" + error.message,
//                 "isResolved": false,
//               });
//             });

//             parser(productLink).then((result)=>{
//               if (result.og["description"] !== undefined) {
//                 const fixedDescriptionArray = result.og["description"].split("·");
//                 if (fixedDescriptionArray[1] !== undefined) {
//                   const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
// productRef.set({
//   "productImage": result.og["image"],
// }, {merge: true});
//                 } else {
//                   const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
//                   productRef.set({
//                     "live": false,
//                   }, {merge: true});
//                 }
//               } else {
//                 const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
//                 productRef.set({
//                   "live": false,
//                 }, {merge: true});
//               }
//             }).catch((error)=>{
//               const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(`${doc.id}`);
//               productRef.set({
//                 "live": false,
//               }, {merge: true});
//             });
//           } else {
//             const docRef = fs.collection("sendFiveBrowseResultsTest").doc("test4");
//             docRef.set({
//               "error": "error",
//             }, {merge: true});
//           }
//         });
//       }
//     }).catch(function(error) {
//       const docRef = fs.collection("sendFiveBrowseResultsTest").doc("test2");
//       docRef.set({
//         error,
//       }, {merge: true});
//     });

//     return resolve();
//   });
// }

function j2Extension(countryCode, productLink, userName, userPhoneNumber, currentMessageTimeStamp) {
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
              const productPrice = fixedDescriptionArray[1].trim();


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
                      "text": "*Step 2 of 5 - Product Sizes*\n\nDo you offer different sizes for this product?",
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


// Map functions begin here

function mapA(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, countryCode) {
  let responseToUserText = {};
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "A1":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A2",
            "registeredMerchant": false,
            "registeredUser": false,
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
                  "link": "https://tapsimagestorage.web.app/images/welcome.png",
                },
              },
              "body": {
                "text": `Hello ${userName},\nand welcome to Tapfuma! 😃\n\nBefore you get started, allow us to introduce ourselves.\n\nTapfuma is a chat application you can use to buy or sell products on Whatsapp.`,
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "A2",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "A2":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A3",
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
                  "link": "https://tapsimagestorage.web.app/images/general_account.png",
                },
              },
              "body": {
                "text": "To buy products on Tapfuma, send us a Whatsapp message and we will respond with a menu. Choose the search or browse menu options to find products to buy.\n\nWhen you find a product you like, simply pay for it using your Tapfuma provided *Whatsapp Wallet*, and we will deliver the product to your door-step.",
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "A3",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "A3":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A4",
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
                  "link": "https://tapsimagestorage.web.app/images/merchant_account.jpg",
                },
              },
              "body": {
                "text": "Selling products on Tapfuma is just as easy. Simply send us a whatsapp message and we will respond with a menu. Use the list products menu options to list products to sell.\n\nWhen you make a sale, we will handle product delivery and deposit funds to your bank account. We also provide you with a Mastercard that you can use to withdraw your sales as cash at any bank ATM!",
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "A4",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "A4":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "A5",
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
                  "link": "https://tapsimagestorage.web.app/images/free_services.png",
                },
              },
              "body": {
                "text": "Tapfuma accounts are free to use for both buyers and sellers!\n\n➣ We will never charge you to list, search for or buy products on our platform.\n\n➣ We do not charge payment processing fees for transactions on Tapfuma.\n\n➣ All peer-to-peer transfers are unlimited and free.",
              },
              "footer": {
                "text": "We only charge sellers 5% to withdraw sales.",
              },
              "action": {
                "buttons": [
                  {
                    "type": "reply",
                    "reply": {
                      "id": "A5",
                      "title": "Next",
                    },
                  },

                ],
              },
            },
          };
        }
        break;
      case "A5":
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
                "text": " Now that you know about us, how can we be of assistance today?",
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
      case "A6":
        {
          if (messageType == "buttonReply" && buttonReplyID == "A6.VM") {
            responseMenu = consumerListMenu;
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set( {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "A6.BP") {
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
                        "id": "A6.VM",
                        "title": "View Menu",
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

    axios({
      method: "POST",
      url: `https://graph.facebook.com/${process.env.WABA_GRAPHAPI_VERSION}/${process.env.WABA_PHONE_NUMBER_ID}/messages?access_token=${process.env.WABA_ACCESS_TOKEN}`,
      data: responseToUserText,
      headers: {"Content-Type": "application/json"},
    }).catch(function(error) {
      const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile").collection("errors");
      docRef.add({
        "mapAerror": "axios error for map A is:" + error.message,
        "isResolved": false,
      });
    });

    resolve();
  });
}

function mapB(userPhoneNumber, previousChatFlowMapID, chatFlowMapID, messageType, buttonReplyID, userTextMessage, currentMessageTimeStamp, countryCode) {
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
                "body": "*Step 1 of 3  -  User Name*\n\nWhat is your full name as it appears on your birth certificate?",
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
              "body": "*Step 1 of 3  -  User Name*\n\nWhat is your full name as it appears on your birth certificate?",
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
                "body": "*Step 2 of 3  -  Date of Birth*\n\nWhat is your date of birth? Please enter it as M.D.YYYY\n\nE.G. A person born on October 12th, 1992 would respond 10.12.1992",
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
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "B6",
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
                  "text": "*Step 3 of 3 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "B6.NEXT",
                        "title": "Next",
                      },
                    },
                  ],
                },
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
          if (messageType == "buttonReply" && buttonReplyID == "B6.NEXT") {
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
                          "id": "B6.NEXT",
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
                "chatFlowMapID": "F2",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "🎉 Congratulations on becoming a registered user! 🎉\n\nWhat is the TID of the user you wish to transfer money to?",
                },
              };
            } else if (previousChatFlowMapID == "G0") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "G2",
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
                          "id": "B6.NEXT",
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
                  "text": "*Step 3 of 3 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "B6.NEXT",
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
      case "B7":
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

function mapBX(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, countryCode, previousChatFlowMapID, userTextMessage, addressLatitude, addressLongitude, addressFull, addressName) {
  let responseToUserText = {};
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "BX0":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX0.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 1 of 5  -  User Name*\n\nWhat is your full name as it appears on your birth certificate?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX0.NO") {
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
      case "BX1":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "BX2",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "to": userPhoneNumber,
            "text": {
              "body": "*Step 1 of 5  -  User Name*\n\nWhat is your full name as it appears on your birth certificate?",
            },
          };
        }
        break;
      case "BX2":
        {
          if (messageType == "text") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX3",
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
                        "id": "BX3.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX3.NO",
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
      case "BX3":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX3.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 2 of 5  -  Date of Birth*\n\nWhat is your date of birth? Please enter it as M.D.YYYY\n\nE.G. A person born on October 12th, 1992 would respond 10.12.1992",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX3.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX2",
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
      case "BX4":
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
                  "chatFlowMapID": "BX5",
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
                            "id": "BX5.YES",
                            "title": "Yes",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BX5.NO",
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
      case "BX5":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX5.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 3 of 5 - Account Backup*\n\nWhat email address can we use to contact you if you ever lose access to this number?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX5.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX4",
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
      case "BX6":
        {
          if (messageType == "text") {
            if (userTextMessage.trim().length < 6) {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Oops! It seems you did not enter a valid email address 🥴.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
                },
              };
            } else {
              const re = /\S+@\S+\.\S+/;
              const rex = re.test(userTextMessage.toLowerCase());
              if (rex == false) {
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber.toLowerCase(),
                  "text": {
                    "body": "Oops! It seems you did not enter a valid email address.\nWhat email address can we use to reach you if we fail to reach you on this number?",
                  },
                };
              } else {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "chatFlowMapID": "BX7",
                  "userEmail": userTextMessage.trim().toLowerCase(),
                  "lastMessageTimeStamp": currentMessageTimeStamp,
                }, {merge: true});

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": `You entered *${userTextMessage.trim().toLowerCase()}* as your email address. Is this correct?`,
                    },
                    "action": {
                      "buttons": [
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BX7.YES",
                            "title": "Yes",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BX7.NO",
                            "title": "No",
                          },
                        },
                      ],
                    },
                  },
                };
              }
            }
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber.toLowerCase(),
              "text": {
                "body": "Oops! It seems you did not enter a valid email address.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          }
        }
        break;
      case "BX7":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX7.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX8",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 4 of 5 - Business Address*\n\nPlease send us your business address using the Whatsapp location feature.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX7.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX6",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. Lets try again 😀.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          }
        }
        break;
      case "BX8":
        {
          if (messageType == "location") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              addressLatitude,
              addressLongitude,
              addressFull,
              addressName,
              "chatFlowMapID": "BX9",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": `You entered ${addressFull} as your address. Is this correct?`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX9.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX9.NO",
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
                "body": "Please send us your business address using the *Whatsapp location feature*.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          }
        }
        break;
      case "BX9":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX9.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX10",
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
                  "text": "*Step 5 of 5 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX10.NEXT",
                        "title": "Next",
                      },
                    },
                  ],
                },
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BX9.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BX8",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. Lets try again 😀.\n\nPlease send us your business address using the *Whatsapp location feature*.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          }
        }
        break;
      case "BX10":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX10.NEXT") {
            // Check if user was performing gated action
            if (previousChatFlowMapID == "H0") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "00",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseMenu = merchantListMenu;

              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": `${userPhoneNumber}`,
                "type": "interactive",
                "interactive": {
                  "type": "list",
                  "body": {
                    "text": "🎉 Congratulations on becoming a registered seller! 🎉\n\nTo proceed, please choose an option from the *Seller Services* menu below.",
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
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "BX11",
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
                          "id": "BX11.VM",
                          "title": "View Menu",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "BX11.BP",
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
                  "text": "*Step 5 of 5 - Account Security*\n\nTapfuma uses Authy by Twilio to verify your identity when you make requests like peer-to-peer transfers.\n\nFollow these instructions to setup Authy:\n\n➣ Download Authy using this link 👉🏾 https://authy.com/download/ \n\n➣ After setting up the Authy app, navigate to the security section found in the Authy app settings.\n\n➣ Enable Authy app protection. If your device supports biometrics, enable biometric protection and the \"protect entire app\" features.\n\nAfter you have complete these steps, tap the \"Next\" button below.",
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX10.NEXT",
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
      case "BX11":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BX11.VM") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "BX11.BP") {
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
                        "id": "BX11.VM",
                        "title": "View Menu",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BX11.BP",
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
          "chatFlowMapID": "BX11",
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
                    "id": "BX11.VM",
                    "title": "View Menu",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "BX11.BP",
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
        "mapBXerror": "axios error for map BX is:" + error.message,
        "isResolved": false,
      });
    });

    resolve();
  });
}

function mapBZ(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, countryCode, previousChatFlowMapID, userTextMessage, addressLatitude, addressLongitude, addressFull, addressName) {
  let responseToUserText = {};
  return new Promise((resolve, reject) => {
    switch (chatFlowMapID) {
      case "BZ0":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BZ0.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BZ2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 1 of 2 - Account Backup*\n\nWhat email address can we use to contact you if you ever lose access to this number?",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ0.NO") {
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
      case "BZ1":
        {
          const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
          docRef.set({
            "chatFlowMapID": "BZ2",
            "lastMessageTimeStamp": currentMessageTimeStamp,
          }, {merge: true});

          responseToUserText = {
            "messaging_product": "whatsapp",
            "to": userPhoneNumber,
            "text": {
              "body": "*Step 1 of 2 - Account Backup*\n\nWhat email address can we use to contact you if you ever lose access to this number?",
            },
          };
        }
        break;
      case "BZ2":
        {
          if (messageType == "text") {
            if (userTextMessage.trim().length < 5) {
              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Oops! It seems you did not enter a valid email address 🥴.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
                },
              };
            } else {
              const re = /\S+@\S+\.\S+/;
              const rex = re.test(userTextMessage.toLowerCase());
              if (rex == false) {
                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber.toLowerCase(),
                  "text": {
                    "body": "Oops! It seems you did not enter a valid email address.\nWhat email address can we use to reach you if we fail to reach you on this number?",
                  },
                };
              } else {
                const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
                docRef.set({
                  "chatFlowMapID": "BZ3",
                  "userEmail": userTextMessage.trim().toLowerCase(),
                  "lastMessageTimeStamp": currentMessageTimeStamp,
                }, {merge: true});

                responseToUserText = {
                  "messaging_product": "whatsapp",
                  "to": userPhoneNumber,
                  "type": "interactive",
                  "interactive": {
                    "type": "button",
                    "body": {
                      "text": `You entered *${userTextMessage.trim().toLowerCase()}* as your email address. Is this correct?`,
                    },
                    "action": {
                      "buttons": [
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BZ3.YES",
                            "title": "Yes",
                          },
                        },
                        {
                          "type": "reply",
                          "reply": {
                            "id": "BZ3.NO",
                            "title": "No",
                          },
                        },
                      ],
                    },
                  },
                };
              }
            }
          } else {
            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber.toLowerCase(),
              "text": {
                "body": "Oops! It seems you did not enter a valid email address.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          }
        }
        break;
      case "BZ3":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BZ3.YES") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BZ4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "*Step 2 of 2 - Business Address*\n\nPlease send us your business address using the Whatsapp location feature.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ3.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BZ2",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. Lets try again 😀.\n\nWhat email address can we use to reach you if we fail to reach you on this number?",
              },
            };
          }
        }
        break;
      case "BZ4":
        {
          if (messageType == "location") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              addressLatitude,
              addressLongitude,
              addressFull,
              addressName,
              "chatFlowMapID": "BZ5",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "type": "interactive",
              "interactive": {
                "type": "button",
                "body": {
                  "text": `You entered ${addressFull} as your address. Is this correct?`,
                },
                "action": {
                  "buttons": [
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BZ5.YES",
                        "title": "Yes",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BZ5.NO",
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
                "body": "Please send us your business address using the *Whatsapp location feature*.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          }
        }
        break;
      case "BZ5":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BZ5.YES") {
            // Check if user was persorming p2pTransfer or productPuchase or accountBalanceCheck or profileCheck
            if (previousChatFlowMapID == "H0") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "00",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseMenu = merchantListMenu;

              responseToUserText = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": `${userPhoneNumber}`,
                "type": "interactive",
                "interactive": {
                  "type": "list",
                  "body": {
                    "text": "🎉 Congratulations on becoming a registered seller! 🎉\n\nTo proceed, please choose an option from the *Seller Services* menu below.",
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
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "BZ6",
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
                          "id": "BZ6.VM",
                          "title": "View Menu",
                        },
                      },
                      {
                        "type": "reply",
                        "reply": {
                          "id": "BZ6.BP",
                          "title": "Browse Products",
                        },
                      },
                    ],
                  },
                },
              };
            }
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ5.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "BZ4",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

            responseToUserText = {
              "messaging_product": "whatsapp",
              "to": userPhoneNumber,
              "text": {
                "body": "That's ok. Lets try again 😀.\n\nPlease send us your business address using the *Whatsapp location feature*.\n\nThis location must be accessible to delivery drivers for product pick-ups.",
              },
            };
          }
        }
        break;
      case "BZ6":
        {
          if (messageType == "buttonReply" && buttonReplyID == "BZ6.VM") {
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
          } else if (messageType == "buttonReply" && buttonReplyID == "BZ6.BP") {
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
                        "id": "BZ6.VM",
                        "title": "View Menu",
                      },
                    },
                    {
                      "type": "reply",
                      "reply": {
                        "id": "BZ6.BP",
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
          "chatFlowMapID": "BZ6",
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
                    "id": "BZ6.VM",
                    "title": "View Menu",
                  },
                },
                {
                  "type": "reply",
                  "reply": {
                    "id": "BZ6.BP",
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
        "mapBZerror": "axios error for map BZ is:" + error.message,
        "isResolved": false,
      });
    });

    resolve();
  });
}

function mapC() {
  return new Promise((resolve, reject) => {
    sendFiveSearchResults();
    resolve();
  });
}

function mapD(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, listReplyID, countryCode, currentBrowseProductsIndex, currentProductCategoryID) {
  let responseToUserText = {};
  let axiosTrigger = true;
  return new Promise((resolve, reject) => {
    if (listReplyID && categoryListReplyIDs[listReplyID] != undefined) {
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
        // case "10":
        //   {
        //     responseMenu = automotiveSubCategoryListMenu;
        //   }
        //   break;
      }
    }

    switch (chatFlowMapID) {
      case "D1":
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
      case "D2":
        {
          if (messageType == "listReply" && categoryListReplyIDs[listReplyID] != undefined) {
            if (listReplyID != "0") {
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "D3",
                "currentBrowseProductsIndex": 0,
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
                    "text": "Please pick a sub-category from the menu below.",
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
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "currentBrowseProductsIndex": 0,
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              currentBrowseProductsIndex = 0;
              const productCategory = listReplyID;
              sendFiveBrowseResults(countryCode, userPhoneNumber, productCategory, currentBrowseProductsIndex);
            }
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
        }
        break;
      case "D3":
        {
          if (messageType == "listReply") {
            if ((listReplyID.split(".")[0] !== undefined) && (listReplyID.split(".")[0].length <= 1) && (listReplyID.split(".")[1] !== undefined) && (listReplyID.split(".")[1].length <= 1)) {
              const productCategory = listReplyID;
              sendFiveBrowseResults(countryCode, userPhoneNumber, productCategory, currentBrowseProductsIndex, currentMessageTimeStamp);
              axiosTrigger = false;
            } else {
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
          } else {
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
        }
        break;
      case "D4":
        {
          if (messageType == "buttonReply" && buttonReplyID == "CO") {
            // Check out = CO

          } else if (messageType == "buttonReply" && buttonReplyID == "VM") {
            // View More = VM
            const productCategory = currentProductCategoryID;
            sendFiveBrowseResults(countryCode, userPhoneNumber, productCategory, currentBrowseProductsIndex, currentMessageTimeStamp);
          } else if (messageType == "buttonReply" && buttonReplyID == "CC") {
            // Change category = CC
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
          } else if (messageType == "buttonReply" && buttonReplyID.includes("ATC::")) {
            // Add to cart = ATC::${productID}

          } else if (messageType == "buttonReply" && buttonReplyID.includes("BS")) {
            // Become a seller = BS


          } else {
            // Non-button response


          }
        }
        break;
        // case "D5":
        //   {}
        //   break;
        // case "D6":
        //   {}
        // break;
      default:
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

function mapE() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function mapF() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function mapG() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function mapI() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function mapJ(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, listReplyID, countryCode, userTextMessage, currentProductID, lastMessageTimeStamp) {
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

                  j2Extension(countryCode, productLink, userName, userPhoneNumber, currentMessageTimeStamp);
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
            if (productSizesArray[0] && productSizesArray.length <= 10) {
              const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
              productRef.set({
                "productSizes": productSizesArray,
              }, {merge: true});

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "J5",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              let appendedSizeList = "";
              productSizesArray.forEach((element) => appendedSizeList += "➣ " + element.trim() + "\n");

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
                  "text": "We seem to have missed your response.\n\nDo you offer different sizes for this product?",
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
                "body": "What keywords and key-phrases will users search for when looking for your product?\n\nPlease list up to 5 keywords and key-phrases, each separated by a comma.\n\nAn example of key words and phrases👇🏾\nbirthday, present, gift, birthday present for husband, birthday present ideas",
              },
            };
          }
        }
        break;
      case "J7":
        {
          if (messageType == "text") {
            const productColorArray = userTextMessage.trim().split(",");
            if (productColorArray[0] && productColorArray.length <= 10) {
              const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
              productRef.set({
                "productColors": productColorArray,
              }, {merge: true});

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "J8",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              let appendedColorList = "";
              productColorArray.forEach((element) => appendedColorList += "➣ " + element.trim() + "\n");

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
            if (productKeysArray[0] && productKeysArray.length <= 5) {
              const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
              productRef.set({
                "productKeys": productKeysArray,
              }, {merge: true});

              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "J10",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              let appendedKeysList = "";
              productKeysArray.forEach((element) => appendedKeysList += "➣ " + element.trim() + "\n");

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
          } else if (messageType == "buttonReply" && buttonReplyID == "J10.NO") {
            const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
            docRef.set({
              "chatFlowMapID": "J9",
              "lastMessageTimeStamp": currentMessageTimeStamp,
            }, {merge: true});

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
                }
                break;
              case "2":
                {
                  responseMenu = shoesSubCategoryListMenu;
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
                }
                break;
              case "3":
                {
                  responseMenu = watchesnJewelrySubCategoryListMenu;
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
                }
                break;
              case "4":
                {
                  responseMenu = beautySubCategoryListMenu;
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
                }
                break;
              case "5":
                {
                  responseMenu = fragrancesSubCategoryListMenu;
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
                }
                break;
              case "6":
                {
                  responseMenu = homenGardenSubCategoryListMenu;
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
                }
                break;
              case "7":
                {
                  responseMenu = toysnGamesSubCategoryListMenu;
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
                }
                break;
              case "8":
                {
                  responseMenu = sportsSubCategoryListMenu;
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
                }
                break;
              case "9":
                {
                  responseMenu = electronicsSubCategoryListMenu;
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
                }
                break;
                // case "10":
                //   {
                //     responseMenu = automotiveSubCategoryListMenu;
                //     responseToUserText = {
                //       "messaging_product": "whatsapp",
                //       "recipient_type": "individual",
                //       "to": `${userPhoneNumber}`,
                //       "type": "interactive",
                //       "interactive": {
                //         "type": "list",
                //         "body": {
                //           "text": "*Product Sub-Category*\n\nUse the list below to choose the sub-category your product belongs to.",
                //         },
                //         "action": {
                //           "button": "Choose a category",
                //           "sections": [
                //             {

              //               "rows": responseMenu,
              //             },
              //           ],
              //         },
              //       },
              //     };
              //   }
              //   break;
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
              "productStars": "⭐️⭐️⭐️⭐️⭐️",
            }, {merge: true}).then(()=>{
              if (userPhoneNumber == "16475577272") {
                productRef.get().then((doc) => {
                  const productDescriprion = doc.data()["productDescription"];
                  const productTitle = doc.data()["productTitle"];
                  const productKeywords = doc.data()["productKeys"];
                  const productScore = doc.data()["productScore"];
                  const productHasColors = doc.data()["productHasColors"];
                  const objectID = doc.id;
                  let data = {};

                  if (productHasColors) {
                    const productColors = doc.data()["productColors"];
                    data = {productDescriprion, productTitle, productKeywords, productColors, productScore};
                  } else {
                    data = {productDescriprion, productTitle, productKeywords, productScore};
                  }

                  index
                      .saveObjects([{objectID, data}]).then((result) =>{
                        const docRef = fs.collection("algoliaResult");
                        docRef.add({
                          "mapJerror": "algolia result is:" + result,
                        });
                      }).catch((err) => {
                        console.log(err);
                      });
                }).catch((err) => {
                  const docRef = fs.collection("algoliaErrors");
                  docRef.add({
                    "mapJerror": "algolia error is:" + err.message,
                  });
                });

                superStoreFunction(countryCode, currentProductID);
              } else {
                productRef.get().then((doc) => {
                  const productDescriprion = doc.data()["productDescription"];
                  const productTitle = doc.data()["productTitle"];
                  const productKeywords = doc.data()["productKeys"];
                  const productScore = doc.data()["productScore"];
                  const productHasColors = doc.data()["productHasColors"];
                  const objectID = doc.id;
                  let data = {};

                  if (productHasColors) {
                    const productColors = doc.data()["productColors"];
                    data = {productDescriprion, productTitle, productKeywords, productColors, productScore};
                  } else {
                    data = {productDescriprion, productTitle, productKeywords, productScore};
                  }

                  index
                      .saveObjects([{objectID, data}]).then((result) =>{
                        const docRef = fs.collection("algoliaResult");
                        docRef.add({
                          "mapJerror": "algolia result is:" + result,
                        });
                      }).catch((err) => {
                        console.log(err);
                      });
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
                        "title": "View My Products",
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

function mapK() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function mapL() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function mapM() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function map00(userPhoneNumber, messageType, listReplyID, currentMessageTimeStamp, countryCode, registeredUser, registeredMerchant, buttonReplyID) {
  let responseToUserText = {};
  let chatFlowMapID = "";
  let yesButtonID = "";
  let noButtonID = "";

  return new Promise((resolve, reject) => {
    // send response message to user
    if (messageType == "listReply") {
      switch (listReplyID) {
        // case "B0":
        //   {

        //   }
        //   break;
        // case "C0":
        //   {

        //   }
        //   break;
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
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "E2",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Placeholder text for E2 service resumption",
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
                "to": userPhoneNumber,
                "text": {
                  "body": "Placeholder text for F2 service resumption",
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
              const docRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              docRef.set({
                "chatFlowMapID": "G2",
                "lastMessageTimeStamp": currentMessageTimeStamp,
              }, {merge: true});

              responseToUserText = {
                "messaging_product": "whatsapp",
                "to": userPhoneNumber,
                "text": {
                  "body": "Placeholder text for G2 service resumption",
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
          }
          break;
          // case "I0":
          //   {


          //   }
          //   break;
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
          // case "K0":
          //   {

          //   }
          //   break;
          // case "L0":
          //   {

          //   }
          //   break;
          // case "M0":
          //   {

          //   }
          //   break;
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

    resolve();
  });
}


// SUPERSTORE FUNCTIONS
function superStoreFunction(countryCode, currentProductID) {
  return new Promise((resolve, reject) => {
    let priceInUSD = 0.0;
    const productRef = fs.collection(`${countryCode}`).doc("Products").collection("allProducts").doc(currentProductID);
    productRef.get().then((doc) => {
      if (doc.exists) {
        const price = doc.data()["productPrice"].split("$")[1];
        const checker = price.includes(",");
        if (checker) {
          priceInUSD = parseFloat(`${price.split(",")[0]}${price.split(",")[1]}`);
        } else {
          priceInUSD = parseFloat(price);
        }


        ssExtensionZimbabwe(priceInUSD, currentProductID, doc);

        ssExtensionZambia(priceInUSD, currentProductID, doc);

        ssExtensionSouthAfrica(priceInUSD, currentProductID, doc);

        ssExtensionLesotho(priceInUSD, currentProductID, doc);

        ssExtensionBotswana(priceInUSD, currentProductID, doc);

        ssExtensionNamibia(priceInUSD, currentProductID, doc);

        ssExtensionMalawi(priceInUSD, currentProductID, doc);

        ssExtensionTanzania(priceInUSD, currentProductID, doc);

        ssExtensionKanye(priceInUSD, currentProductID, doc);

        ssExtensionBurundi(priceInUSD, currentProductID, doc);

        ssExtensionRwanda(priceInUSD, currentProductID, doc);

        ssExtensionUganda(priceInUSD, currentProductID, doc);
      }
    });

    return resolve();
  });
}

function ssExtensionZimbabwe(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const zimbabweRef = fs.collection("ZW").doc("Products").collection("allProducts").doc(currentProductID);
    const rawUSDollar = priceInUSD;
    const zimbabweFormatter = new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "USD",
    });
    const priceInUSDollar = zimbabweFormatter.format(rawUSDollar);
    zimbabweRef.set(doc.data()).then(() =>{
      zimbabweRef.set({"productPrice": `${priceInUSDollar}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionZambia(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const zambiaRef = fs.collection("ZM").doc("Products").collection("allProducts").doc(currentProductID);
    const rawZMWKwacha = priceInUSD*20;
    const zambiaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZMW",
    });
    const priceInZMWKwacha = zambiaFormatter.format(rawZMWKwacha);
    zambiaRef.set(doc.data()).then(() =>{
      zambiaRef.set({"productPrice": `${priceInZMWKwacha}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionSouthAfrica(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const southAfricaRef = fs.collection("ZA").doc("Products").collection("allProducts").doc(currentProductID);
    const rawRand = priceInUSD*19;
    const southAfricaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
    });
    const priceInRand = southAfricaFormatter.format(rawRand);
    southAfricaRef.set(doc.data()).then(() =>{
      southAfricaRef.set({"productPrice": `${priceInRand}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionLesotho(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const lesothoRef = fs.collection("LS").doc("Products").collection("allProducts").doc(currentProductID);
    const rawLoti = priceInUSD*19;
    const lesothoFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LSL",
    });
    const priceInLoti = lesothoFormatter.format(rawLoti);
    lesothoRef.set(doc.data()).then(() =>{
      lesothoRef.set({"productPrice": `${priceInLoti}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionBotswana(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const botswanaRef = fs.collection("BW").doc("Products").collection("allProducts").doc(currentProductID);
    const rawPula = priceInUSD*15;
    const botswanaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BWP",
    });
    const priceInPula = botswanaFormatter.format(rawPula);
    botswanaRef.set(doc.data()).then(() =>{
      botswanaRef.set({"productPrice": `${priceInPula}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionNamibia(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const namibiaRef = fs.collection("NA").doc("Products").collection("allProducts").doc(currentProductID);
    const rawNADollar = priceInUSD*19;
    const namibiaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NAD",
    });
    const priceInNADollar = namibiaFormatter.format(rawNADollar);
    namibiaRef.set(doc.data()).then(() =>{
      namibiaRef.set({"productPrice": `${priceInNADollar}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionMalawi(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const malawiRef = fs.collection("MW").doc("Products").collection("allProducts").doc(currentProductID);
    const rawMWKwacha = priceInUSD*1100;
    const malawiFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MWK",
    });
    const priceInMWKwacha = malawiFormatter.format(rawMWKwacha);
    malawiRef.set(doc.data()).then(() =>{
      malawiRef.set({"productPrice": `${priceInMWKwacha}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionTanzania(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const tanzaniaRef = fs.collection("TZ").doc("Products").collection("allProducts").doc(currentProductID);
    const rawTZShilling = priceInUSD*2400;
    const tanzaniaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
    });
    const priceInTZShilling = tanzaniaFormatter.format(rawTZShilling);
    tanzaniaRef.set(doc.data()).then(() =>{
      tanzaniaRef.set({"productPrice": `${priceInTZShilling}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionKanye(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const kenyaRef = fs.collection("KE").doc("Products").collection("allProducts").doc(currentProductID);
    const rawKEShilling = priceInUSD*140;
    const kenyaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
    });
    const priceInKEShilling = kenyaFormatter.format(rawKEShilling);
    kenyaRef.set(doc.data()).then(() =>{
      kenyaRef.set({"productPrice": `${priceInKEShilling}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionBurundi(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const burundiRef = fs.collection("BI").doc("Products").collection("allProducts").doc(currentProductID);
    const rawBIFranc = priceInUSD*2100;
    const burundiFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BIF",
    });
    const priceInBIFranc = burundiFormatter.format(rawBIFranc);
    burundiRef.set(doc.data()).then(() =>{
      burundiRef.set({"productPrice": `${priceInBIFranc}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionRwanda(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const rwandaRef = fs.collection("RW").doc("Products").collection("allProducts").doc(currentProductID);
    const rawRWFranc = priceInUSD*1100;
    const rwandaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
    });
    const priceInRWFranc = rwandaFormatter.format(rawRWFranc);
    rwandaRef.set(doc.data()).then(() =>{
      rwandaRef.set({"productPrice": `${priceInRWFranc}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionUganda(priceInUSD, currentProductID, doc) {
  return new Promise((resolve, reject) => {
    const ugandaRef = fs.collection("UG").doc("Products").collection("allProducts").doc(currentProductID);
    const rawUGXShilling = priceInUSD*4000;
    const ugandaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "UGX",
    });
    const priceInUGXShilling = ugandaFormatter.format(rawUGXShilling);
    ugandaRef.set(doc.data()).then(() =>{
      ugandaRef.set({"productPrice": `${priceInUGXShilling}`}, {merge: true});
    });
    return resolve();
  });
}

// END API - EXPORT ONLY AFTER THIS
module.exports = router;
