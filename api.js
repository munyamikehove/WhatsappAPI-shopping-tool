require("dotenv").config();
const authyAPIKEY = process.env.AUTHY_API_KEY;
const stripeSecretAPIKEY = process.env.SK_LIVE;
const stripe = require("stripe")(stripeSecretAPIKEY);
const authy = require("authy")(authyAPIKEY);
const axios = require("axios");
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const phone = require("awesome-phonenumber");
const algoliasearch = require("algoliasearch");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const aMap = require("./aMap");
const bMap = require("./bMap");
const bxMap = require("./bxMap");
const bzMap = require("./bzMap");
const cMap = require("./cMap");
const dMap = require("./dMap");
const eMap = require("./eMap");
const fMap = require("./fMap");
const gMap = require("./gMap");
const jMap = require("./jMap");
const oMap = require("./oMap");
const ooMap = require("./ooMap");
const srr = require("./sendReadReceipt");
const srpdf = require("./saveReviewsPDF");
const sumt = require("./sendUnsupportedMessageTypeResponse");
const gup = require("./getUserProfile");
const gcs = require("./getCartStatus");
const sucr = require("./sendUnsupportedCountryResponse");
const swlr = require("./sendWaitlistedResponse");
const serviceAccount = require("./serviceAccountKey.json");
const client = algoliasearch(process.env.ALGOLIA_SEARCH_APP_ID, process.env.ALGOLIA_SEARCH_ADMIN_API_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tapfuma-12ab6-default-rtdb.firebaseio.com",
  storageBucket: "gs://tapfuma-12ab6.appspot.com/",
});


const fs = admin.firestore();
fs.settings({ignoreUndefinedProperties: true});
const FieldValue = admin.firestore.FieldValue;
const bucket = admin.storage().bucket();

// const currentDate = moment().format("YYYY/MMM/DD");
const mapAIDs = {"A0": "A0", "A1": "A1", "A2": "A2", "A3": "A3", "A4": "A4", "A5": "A5", "A6": "A6", "A7": "A7"};
const mapBIDs = {"B0": "B0", "B1": "B1", "B2": "B2", "B3": "B3", "B4": "B4", "B5": "B5", "B6": "B6", "B7": "B7", "B8": "B8", "B9": "B9"};
const mapBXIDs = {"BX0": "BX0", "BX1": "BX1", "BX2": "BX2", "BX3": "BX3", "BX4": "BX4", "BX5": "BX5", "BX6": "BX6", "BX7": "BX7", "BX8": "BX8", "BX9": "BX9", "BX10": "BX10", "BX11": "BX11"};
const mapBZIDs = {"BZ0": "BZ0", "BZ1": "BZ1", "BZ2": "BZ2", "BZ3": "BZ3", "BZ4": "BZ4", "BZ5": "BZ5", "BZ6": "BZ6", "BZ7": "BZ7"};
const mapCIDs = {"C1": "C1", "C2": "C2", "C3": "C3", "C4": "C4", "C5": "C5", "C6": "C6", "C7": "C7", "C8": "C8", "C9": "C9"};
const mapDIDs = {"D1": "D1", "D2": "D2", "D3": "D3", "D4": "D4", "D5": "D5", "D6": "D6", "D7": "D7", "D8": "D8", "D9": "D9"};
const mapEIDs = {"E1": "E1", "E2": "E2", "E3": "E3", "E4": "E4", "E5": "E5", "E6": "E6", "E7": "E7", "E8": "E8", "E9": "E9", "E10": "E10", "E11": "E11", "E12": "E12"};
const mapFIDs = {"F1": "F1", "F2": "F2", "F3": "F3"};
const mapGIDs = {"G1": "G1", "G2": "G2", "G3": "G3"};
const mapIIDs = {};
const mapJIDs = {"J1": "J1", "J2": "J2", "J3": "J3", "J4": "J4", "J5": "J5", "J6": "J6", "J7": "J7", "J8": "J8", "J9": "J9", "J10": "J10", "J11": "J11", "J12": "J12", "J13": "J13"};
const mapKIDs = {};
const mapLIDs = {};
const mapMIDs = {};
const mapOIDs = {"O1": "O1", "O2": "O2", "O3": "O3"};
const map00IDs = {"00": "00", "G0": "G0"};
// const supportedCountryCodes = {"DE": "DE", "GY": "GY", "PG": "PG", "SB": "SB", "VU": "VU", "FJ": "FJ", "AG": "AG", "DM": "DM", "LC": "LC", "VC": "VC", "GD": "GD", "BB": "BB", "TT": "TT", "LK": "LK", "IN": "IN", "BD": "BD", "PR": "PR", "BS": "BS", "JM": "JM", "BZ": "BZ", "HK": "HK", "SG": "SG", "SL": "SL", "MU": "MU", "PH": "PH", "CA": "CA", "ZA": "ZA", "LS": "LS", "SZ": "SZ", "ZW": "ZW", "BW": "BW", "ZM": "ZM", "NA": "NA", "MW": "MW", "TZ": "TZ", "KE": "KE", "BI": "BI", "RW": "RW", "UG": "UG", "US": "US", "GB": "GB", "AU": "AU", "NZ": "NZ", "IE": "IE", "NG": "NG", "LB": "LB", "AE": "AE", "QA": "QA"};
// const supportedCurrencyCodes = {"GY": "gyd", "PG": "pgk", "SB": "sbd", "VU": "vuv", "FJ": "fjd", "AG": "xcd", "DM": "xcd", "LC": "xcd", "VC": "xcd", "GD": "xcd", "BB": "bbd", "TT": "ttd", "LK": "lkr", "IN": "inr", "BD": "bdt", "PR": "usd", "BS": "bsd", "JM": "jmd", "BZ": "bzd", "HK": "hkd", "SG": "sgd", "SL": "sll", "MU": "mur", "PH": "php", "CA": "cad", "ZA": "zar", "LS": "lsl", "SZ": "szl", "ZW": "usd", "BW": "bwp", "ZM": "zmw", "NA": "nad", "MW": "mwk", "TZ": "tzs", "KE": "kes", "BI": "bif", "RW": "rwf", "UG": "ugx", "US": "usd", "GB": "gbp", "AU": "aud", "NZ": "nzd", "IE": "eur", "NG": "ngn", "LB": "usd", "AE": "aed", "QA": "qar"};
// const initialBalanceTransaction = {"GY": -2098, "PG": -35, "SB": -82, "VU": -122, "FJ": -23, "AG": -27, "DM": -27, "LC": -27, "VC": -27, "GD": -27, "BB": -20, "TT": -68, "LK": -3686, "IN": -817, "BD": -1060, "PR": -10, "BS": -10, "JM": -1543, "BZ": -20, "HK": -78, "SG": -14, "SL": -176500, "MU": -438, "PH": -581, "CA": -14, "ZA": -178, "LS": -177, "SZ": -179, "ZW": -10, "BW": -133, "ZM": -164, "NA": -177, "MW": -10271, "TZ": -23300, "KE": -1218, "BI": -207, "RW": -107, "UG": -378, "US": -10, "GB": -8, "AU": -16, "NZ": -17, "IE": -10, "NG": -4403, "LB": -10, "AE": -37, "QA": -36};
const supportedCountryCodes = {"FR": "FR", "SG": "SG", "DE": "DE", "CA": "CA", "ZA": "ZA", "LS": "LS", "SZ": "SZ", "ZW": "ZW", "BW": "BW", "ZM": "ZM", "NA": "NA", "MW": "MW", "TZ": "TZ", "KE": "KE", "RW": "RW", "UG": "UG", "US": "US", "GB": "GB", "AU": "AU", "NZ": "NZ", "IE": "IE", "NG": "NG", "AE": "AE", "QA": "QA", "GH": "GH", "MZ": "MZ"};
const supportedCurrencyCodes = {"FR": "eur", "SG": "sgd", "DE": "eur", "CA": "cad", "ZA": "zar", "LS": "lsl", "SZ": "szl", "ZW": "usd", "BW": "bwp", "ZM": "zmw", "NA": "nad", "MW": "mwk", "TZ": "tzs", "KE": "kes", "RW": "rwf", "UG": "ugx", "US": "usd", "GB": "gbp", "AU": "aud", "NZ": "nzd", "IE": "eur", "NG": "ngn", "AE": "aed", "QA": "qar", "GH": "ghs", "MZ": "mzn"};
const currencyPrefix = {"FR": "€", "SG": "SGD", "DE": "€", "CA": "CA$", "ZA": "ZAR", "LS": "LSL", "SZ": "SZL", "ZW": "US$", "BW": "BWP", "ZM": "ZMW", "NA": "NAD", "MW": "MWK", "TZ": "TZS", "KE": "KES", "RW": "RWF", "UG": "UGX", "US": "US$", "GB": "£", "AU": "A$", "NZ": "NZ$", "IE": "€", "NG": "NGN", "AE": "AED", "QA": "QAR", "GH": "GHS", "MZ": "MZN"};
const initialBalanceTransaction = {"FR": -10, "SG": -10, "DE": -10, "CA": -10, "ZA": -178, "LS": -177, "SZ": -179, "ZW": -10, "BW": -133, "ZM": -164, "NA": -177, "MW": -10271, "TZ": -23300, "KE": -1218, "RW": -107, "UG": -378, "US": -10, "GB": -10, "AU": -10, "NZ": -10, "IE": -10, "NG": -700, "AE": -37, "QA": -36, "GH": -620, "MZ": -35};
// currentUSDExchangeRates UPDATED 21 MARCH 2023
const currentUSDExchangeRates = {"FR": 0.95, "SG": 1.40, "DE": 0.95, "CA": 1.40, "ZA": 19, "LS": 19, "SZ": 19, "ZW": 1, "BW": 14, "ZM": 22, "NA": 19, "MW": 1035, "TZ": 2365, "KE": 135, "RW": 1100, "UG": 3800, "US": 1, "GB": 0.85, "AU": 1.6, "NZ": 1.7, "IE": 0.95, "NG": 470, "AE": 3.7, "QA": 3.65, "GH": 13.5, "MZ": 65};
const minimumWithdrawalThreshold = {"FR": 90, "SG": 130, "DE": 90, "CA": 130, "ZA": 1700, "LS": 1700, "SZ": 1700, "ZW": 99, "BW": 1300, "ZM": 2000, "NA": 1700, "MW": 100000, "TZ": 230000, "KE": 13000, "RW": 108000, "UG": 370000, "US": 99, "GB": 80, "AU": 140, "NZ": 150, "IE": 90, "NG": 45500, "AE": 360, "QA": 360, "GH": 1200, "MZ": 6200};
const categoryListReplyIDs = {"1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10"};
const keyResponseList = {"x": "x", "s": "s", "m": "m", "b": "b", "i'd like an invitation to tapfuma": "i'd like an invitation to tapfuma"};
const cityLimits = {"CA": "Toronto.", "ZA": "Johannesburg, Pretoria, Durban, Gqeberha, and Cape Town.", "ZW": "Harare and Bulawayo.", "ZM": "Lusaka."};
const permittedMerchants = {"16475577272": "16475577272", "263715526121": "263715526121", "16474741834": "16474741834"};
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
    "id": "O0",
    "title": "🛍️ Checkout",
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
    "title": "🏷️ Add Product",
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
  {
    "id": "0",
    "title": "🔥 Hot Deals",
  },
  // {
  //   "id": "1",
  //   "title": "🥻 Clothing",
  // },
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
const jCategoryListMenu = [

  // {
  //   "id": "1",
  //   "title": "🥻 Clothing",
  // },
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
const automotiveSubCategoryListMenu = [
  {
    "id": "10.1",
    "title": "Tires and Wheels",
  },
  {
    "id": "10.2",
    "title": "Batteries",
  },
  {
    "id": "10.3",
    "title": "Wiper blades and parts",
  },
  {
    "id": "10.4",
    "title": "Transmission fluids",
  },
  {
    "id": "10.5",
    "title": "Engine oils ",
  },
  {
    "id": "10.6",
    "title": "Gear oils & Grease",
  },
  {
    "id": "10.7",
    "title": "Filters & PCV Valves",
  },
  {
    "id": "10.8",
    "title": "Headlights & Bulbs",
  },
  {
    "id": "10.9",
    "title": "Floor mats & Liners",
  },
  {
    "id": "10.10",
    "title": "Seat covers & Cushions",
  },
];

let userMessageBody = {};


// REST operations start here

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
  let authyID = "";
  let userTextMessage = "";
  let addressLatitude = "";
  let addressLongitude = "";
  let addressFull = "";
  let addressName = "";
  let stripeCustomerID = "";
  let currentMessageID = "";
  let userName = "";
  let userBirthDate = "";
  let userPhoneNumber = "";
  let currentMessageTimeStamp = "";
  let countryCode = "";
  let officialUserName = "";
  let currentProductID = "";
  let currentSearchResultsID = "";
  let currentBrowseProductsIndex = 0;
  let itemsInCart = 0;
  let currentProductCategoryID = "";
  let govIssuedPhotoID = "";
  let govIssuedIDType = "";
  let MTRAddress = "";
  let registeredMerchant = false;
  let registeredUser = false;
  let stripeCustomer = {};
  let cartSnapshot = {};


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
        await srr.sendReadReceipt(currentMessageID, fs);

        const parsedNumber = phone(`+${userPhoneNumber}`);
        countryCode = parsedNumber.getRegionCode();

        // Check if user is from a supported country
        if (supportedCountryCodes[countryCode]) {
          const docRef = fs.collection(`${countryCode}`).doc("Messages").collection(`${userPhoneNumber}`);
          docRef.add({
            userMessageBody,
          });

          const userProfile = await gup.getUserProfile(userPhoneNumber, countryCode, fs);

          if (userProfile["exists"]) {
            const userData = userProfile["userDataObj"];
            chatFlowMapID = userData["chatFlowMapID"];
            authyID = userData["authyID"];
            previousChatFlowMapID = userData["previousChatFlowMapID"];
            stripeCustomerID = userData["stripeCustomerID"];
            currentProductCategoryID = userData["currentProductCategoryID"];
            lastMessageTimeStamp = userData["lastMessageTimeStamp"];
            currentProductID = userData["currentProductID"];
            officialUserName = userData["userName"];
            MTRAddress = userData["MTRAddress"];
            addressFull = userData["addressFull"];
            govIssuedPhotoID = userData["govIssuedPhotoID"];
            govIssuedIDType = userData["govIssuedIDType"];
            registeredMerchant = userData["registeredMerchant"];
            registeredUser = userData["registeredUser"];
            currentSearchResultsID = userData["currentSearchResultsID"];
            currentBrowseProductsIndex = userData["currentBrowseProductsIndex"];
            userBirthDate = userData["userBirthDate"];


            if (registeredMerchant || registeredUser) {
              stripeCustomer = await stripe.customers.retrieve(
                  `${stripeCustomerID}`,
              );
            }

            // Reset user chat onEscape
            if (keyResponseList[userTextMessage.toLowerCase()] != undefined) {
              const key = userTextMessage.toLowerCase();
              switch (key) {
                case "b":
                  chatFlowMapID = "A6";
                  messageType = "buttonReply";
                  buttonReplyID = "A6.BP";
                  break;
                case "m":
                  chatFlowMapID = "A6";
                  messageType = "buttonReply";
                  buttonReplyID = "A6.VM";
                  break;
                case "s":
                  chatFlowMapID = "C1";
                  break;
                case "x":
                  chatFlowMapID = "A0";
                  break;
                case "i'd like an invitation to tapfuma":
                  await swlr.sendWaitlistedResponse(userPhoneNumber, countryCode, currentMessageTimeStamp, fs);
                  break;
              }
            }

            // Create stripe customer account
            // Create authy user account
            if ((chatFlowMapID == "B8" && messageType == "buttonReply" && buttonReplyID == "B8.NEXT") || (chatFlowMapID == "BX10" && messageType == "buttonReply" && buttonReplyID == "BX10.NEXT")) {
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

            // Get the number of items in a shopping cart
            if ((chatFlowMapID == "C3" && messageType == "buttonReply") || (chatFlowMapID == "D4" && messageType == "buttonReply") || (chatFlowMapID == "O1" && messageType == "buttonReply") || (chatFlowMapID == "00" && listReplyID == "O0")) {
              const cartResult = await gcs.getCartStatus(userPhoneNumber, countryCode, fs);
              itemsInCart = cartResult["itemsInCart"];
              cartSnapshot = cartResult["cartSnapshot"];
            }

            // Set registered user state in profile
            if (chatFlowMapID == "B8" && messageType == "buttonReply" && buttonReplyID == "B8.NEXT") {
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

            // Scrap webpage using puppeteer

            const scrape = false;
            if (scrape) {
              const pdfURL = `https://reviws.web.app/${countryCode}::${currentProductID}`;
              const pdfFileName = `${countryCode}${currentProductID}`;
              srpdf.saveReviewsPDF(countryCode, userPhoneNumber, currentBrowseProductsIndex, currentMessageTimeStamp, fs, client, pdfURL, pdfFileName, bucket);
            }

            //  Route user to appropriate chatFlow
            switch (true) {
              case mapAIDs[chatFlowMapID] != undefined:
                await aMap.mapA(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, countryCode, fs, consumerListMenu, categoryListMenu);
                break;
              case mapBIDs[chatFlowMapID] != undefined:
                await bMap.mapB(userPhoneNumber, previousChatFlowMapID, chatFlowMapID, messageType, buttonReplyID, userTextMessage, currentMessageTimeStamp, countryCode, fs, consumerListMenu, categoryListMenu, cityLimits);
                break;
              case mapBXIDs[chatFlowMapID] != undefined:
                await bxMap.mapBX(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, countryCode, previousChatFlowMapID, userTextMessage, addressLatitude, addressLongitude, addressFull, addressName, fs, merchantListMenu, consumerListMenu, categoryListMenu);
                break;
              case mapBZIDs[chatFlowMapID] != undefined:
                await bzMap.mapBZ(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, countryCode, previousChatFlowMapID, userTextMessage, addressLatitude, addressLongitude, addressFull, addressName, fs, merchantListMenu, consumerListMenu, categoryListMenu);
                break;
              case mapCIDs[chatFlowMapID] != undefined:
                await cMap.mapC(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, listReplyID, countryCode, currentBrowseProductsIndex, previousChatFlowMapID, userTextMessage, currentSearchResultsID, itemsInCart, cartSnapshot, fs, client, currencyPrefix, categoryListMenu, supportedCurrencyCodes, registeredUser);
                break;
              case mapDIDs[chatFlowMapID] != undefined:
                await dMap.mapD(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, messageType, buttonReplyID, listReplyID, countryCode, currentBrowseProductsIndex, currentProductCategoryID, itemsInCart, cartSnapshot, fs, client, currencyPrefix, categoryListMenu, shoesSubCategoryListMenu, watchesnJewelrySubCategoryListMenu, beautySubCategoryListMenu, fragrancesSubCategoryListMenu, homenGardenSubCategoryListMenu, toysnGamesSubCategoryListMenu, sportsSubCategoryListMenu, electronicsSubCategoryListMenu, clothingSubCategoryListMenu, categoryListReplyIDs, supportedCurrencyCodes, registeredUser);
                break;
              case mapEIDs[chatFlowMapID] != undefined:
                await eMap.mapE(chatFlowMapID, fs, countryCode, userPhoneNumber, currentMessageTimeStamp, buttonReplyID, currencyPrefix, currentUSDExchangeRates, messageType, stripeCustomer, govIssuedIDType, govIssuedPhotoID, officialUserName, userBirthDate, MTRAddress, minimumWithdrawalThreshold, userTextMessage, supportedCurrencyCodes, stripe, stripeCustomerID, authyID);
                break;
              case mapFIDs[chatFlowMapID] != undefined:
                await fMap.mapF(chatFlowMapID, fs, countryCode, userPhoneNumber, currentMessageTimeStamp);
                break;
              case mapGIDs[chatFlowMapID] != undefined:
                await gMap.mapG(chatFlowMapID, fs, countryCode, userPhoneNumber, currentMessageTimeStamp, addressFull, messageType, stripeCustomer, govIssuedIDType, govIssuedPhotoID, officialUserName, userBirthDate, MTRAddress, userTextMessage, authyID);
                break;
              case mapIIDs[chatFlowMapID] != undefined:
                await mapI();
                break;
              case mapJIDs[chatFlowMapID] != undefined:
                await jMap.mapJ(fs, chatFlowMapID, countryCode, userPhoneNumber, currentMessageTimeStamp, buttonReplyID, messageType, client, consumerListMenu, currentProductID, listReplyID, categoryListMenu, userTextMessage, FieldValue, userName, merchantListMenu, categoryListReplyIDs, clothingSubCategoryListMenu, shoesSubCategoryListMenu, watchesnJewelrySubCategoryListMenu, beautySubCategoryListMenu, fragrancesSubCategoryListMenu, homenGardenSubCategoryListMenu, toysnGamesSubCategoryListMenu, sportsSubCategoryListMenu, electronicsSubCategoryListMenu, automotiveSubCategoryListMenu, lastMessageTimeStamp, currentUSDExchangeRates, jCategoryListMenu, supportedCurrencyCodes);
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
              case mapOIDs[chatFlowMapID] != undefined:
                await oMap.mapO(fs, chatFlowMapID, messageType, buttonReplyID, cartSnapshot, userPhoneNumber, countryCode, listReplyID, currentMessageTimeStamp, supportedCurrencyCodes, stripeCustomerID, stripe, stripeCustomer, currentUSDExchangeRates, FieldValue, MTRAddress, cityLimits);
                break;
              case map00IDs[chatFlowMapID] != undefined:
                await ooMap.map00(userPhoneNumber, messageType, listReplyID, currentMessageTimeStamp, countryCode, registeredUser, registeredMerchant, buttonReplyID, fs, permittedMerchants, consumerListMenu, merchantListMenu, categoryListMenu, stripeCustomer, govIssuedIDType, govIssuedPhotoID, userBirthDate, MTRAddress, officialUserName, addressFull, supportedCurrencyCodes, cartSnapshot);
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
            await aMap.mapA(chatFlowMapID, currentMessageTimeStamp, userPhoneNumber, userName, messageType, buttonReplyID, countryCode, fs, consumerListMenu, categoryListMenu);
          }
        } else {
          // Send the user a "country not supported" message
          await sucr.sendUnsupportedCountryResponse(userPhoneNumber, userName, countryCode, currentMessageTimeStamp, fs);
        }
      } else {
        await sumt.sendUnsupportedMessageTypeResponse(userPhoneNumber, userName, fs);
      }


      res.sendStatus(200);
    } else {
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(200);
  }
});

router.post("/stripe", async (req, res) => {
  const endpointSecret = "whsec_0TPBwiaAoI2IyB4FXMfJwG3XIFP6fAK0";
  const payload = req.rawBody;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.async_payment_failed":
      {
        // Then define and call a function to handle the event checkout.session.async_payment_failed
        const checkoutSessionAsyncPaymentFailed = event.data.object;
        const docRef = fs.collection("stripeHealth");
        docRef.add({
          checkoutSessionAsyncPaymentFailed,
        });
      }


      break;
    case "checkout.session.async_payment_succeeded":
      {
        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        const checkoutSessionAsyncPaymentSucceeded = event.data.object;
        const docRef2 = fs.collection("stripeHealth");
        docRef2.add({
          checkoutSessionAsyncPaymentSucceeded,
        });
      }


      break;
    case "checkout.session.completed":
      {
        // Then define and call a function to handle the event checkout.session.completed
        const csc = event.data.object;
        const amountPaid = csc["amount_total"];
        const customerDetails = csc["customer_details"];
        const customerPhone = customerDetails["phone"];
        const customerEmail = customerDetails["email"];
        const customerNameOnCard = customerDetails["name"];
        const parsedNumber = phone(`${customerPhone}`);
        const userPhoneNumber = customerPhone.split("+")[1].trim();
        const countryCode = parsedNumber.getRegionCode();
        const paymentState = csc["status"];
        const paymentDate = csc["created"];
        const paymentStatus = csc["payment_status"];
        let displayAmountnCurrency = "";

        if (supportedCountryCodes[countryCode]) {
          if (paymentState == "complete") {
            if (paymentStatus == "paid") {
              const profileRef = fs.collection(`${countryCode}`).doc("Profiles").collection(`${userPhoneNumber}`).doc("userProfile");
              profileRef.get().then((doc) => {
                if (doc.exists) {
                  const userData = doc.data();
                  const stripeCustomerID = userData["stripeCustomerID"];
                  // Zero-decimal currencies: RWF, UGX
                  let topupAmount = 0;

                  if (countryCode != "UG" && countryCode != "RW") {
                    const amnt = (amountPaid/100)*currentUSDExchangeRates[countryCode];
                    topupAmount = -1*(amnt*100);
                    displayAmountnCurrency = `${currencyPrefix[countryCode]} ${amnt}`;
                  } else {
                    const amnt = (amountPaid/100)*currentUSDExchangeRates[countryCode];
                    topupAmount = -1*(amnt);
                    displayAmountnCurrency = `${currencyPrefix[countryCode]} ${amnt}`;
                  }


                  stripe.customers.createBalanceTransaction(
                      `${stripeCustomerID}`,
                      {
                        "amount": topupAmount,
                        "currency": `${supportedCurrencyCodes[countryCode]}`,
                        "description": `top-up of ${amountPaid} USD on ${paymentDate} @ 1USD = ${currentUSDExchangeRates[countryCode]} ${supportedCurrencyCodes[countryCode]}`,
                      }).then(()=>{
                    const responseMessage = {
                      "messaging_product": "whatsapp",
                      "to": userPhoneNumber,
                      "type": "template",
                      "template": {
                        "name": "topup_successful",
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
                                  "link": "https://tapsimagestorage.web.app/images/bank_transfer.png",
                                },
                              },
                            ],
                          },
                          {
                            "type": "body",
                            "parameters": [
                              {
                                "type": "text",
                                "text": `${displayAmountnCurrency}`,
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
                  }).catch((err) =>{
                    const docRef3 = fs.collection("stripeTopUpFollowUps");
                    docRef3.add({
                      "error": `${err.message}`,
                      countryCode,
                      customerPhone,
                      amountPaid,
                      customerEmail,
                      customerNameOnCard,
                      paymentDate,
                      paymentState,
                      paymentStatus,
                    });

                    const msg = {
                      to: `${customerEmail}`,
                      from: {
                        email: "admin@tapfuma.com",
                        name: "Tapfuma Admin",
                      },
                      subject: "Tapfuma top-up processing",
                      html: `<strong>Dear ${customerNameOnCard}</strong><p>We are processing your payment for a Tapfuma wallet top-up.<br><br>Your top-up will reflect when you check your Tapfuma account balance on whatsapp within the next 5 to 10 minutes.<br><br>Feel free to contact us if you have any questions or comments.<br><br>Kind regards,<br>Tapfuma Admin team</p>`,
                    };

                    sgMail
                        .send(msg)
                        .then(() => {}, (error) => {
                          console.error(error);

                          if (error.response) {
                            console.error(error.response.body);
                          }
                        });
                  });
                } else {
                  const docRef3 = fs.collection("stripeTopUpFollowUps");
                  docRef3.add({
                    "issue": "userNotFound",
                    countryCode,
                    customerPhone,
                    amountPaid,
                    customerEmail,
                    customerNameOnCard,
                    paymentDate,
                    paymentState,
                    paymentStatus,
                  });

                  const msg = {
                    to: `${customerEmail}`,
                    from: {
                      email: "admin@tapfuma.com",
                      name: "Tapfuma Admin",
                    },
                    subject: "Tapfuma top-up processing",
                    html: `<strong>Dear ${customerNameOnCard}</strong><p>We are processing your payment for a Tapfuma wallet top-up.<br><br>Your top-up will reflect when you check your Tapfuma account balance on whatsapp within the next 5 to 10 minutes.<br><br>Feel free to contact us if you have any questions or comments.<br><br>Kind regards,<br>Tapfuma Admin team</p>`,
                  };

                  sgMail
                      .send(msg)
                      .then(() => {}, (error) => {
                        console.error(error);

                        if (error.response) {
                          console.error(error.response.body);
                        }
                      });
                }
              }).catch((error) => {
                const docRef3 = fs.collection("stripeTopUpFollowUps");
                docRef3.add({
                  "error": `${error.message}`,
                  countryCode,
                  customerPhone,
                  amountPaid,
                  customerEmail,
                  customerNameOnCard,
                  paymentDate,
                  paymentState,
                  paymentStatus,
                });

                const msg = {
                  to: `${customerEmail}`,
                  from: {
                    email: "admin@tapfuma.com",
                    name: "Tapfuma Admin",
                  },
                  subject: "Tapfuma top-up processing",
                  html: `<strong>Dear ${customerNameOnCard}</strong><p>We are processing your payment for a Tapfuma wallet top-up.<br><br>Your top-up will reflect when you check your Tapfuma account balance on whatsapp within the next 5 to 10 minutes.<br><br>Feel free to contact us if you have any questions or comments.<br><br>Kind regards,<br>Tapfuma Admin team</p>`,
                };

                sgMail
                    .send(msg)
                    .then(() => {}, (error) => {
                      console.error(error);

                      if (error.response) {
                        console.error(error.response.body);
                      }
                    });
              });
            } else {
              const docRef3 = fs.collection("stripeTopUpFollowUps");
              docRef3.add({
                countryCode,
                customerPhone,
                amountPaid,
                customerEmail,
                customerNameOnCard,
                paymentDate,
                paymentState,
                paymentStatus,
              });

              const msg = {
                to: `${customerEmail}`,
                from: {
                  email: "admin@tapfuma.com",
                  name: "Tapfuma Admin",
                },
                subject: "Tapfuma top-up processing",
                html: `<strong>Dear ${customerNameOnCard}</strong><p>We are processing your payment for a Tapfuma wallet top-up.<br><br>Your top-up will reflect when you check your Tapfuma account balance on whatsapp within the next 5 to 10 minutes.<br><br>Feel free to contact us if you have any questions or comments.<br><br>Kind regards,<br>Tapfuma Admin team</p>`,
              };

              sgMail
                  .send(msg)
                  .then(() => {}, (error) => {
                    console.error(error);

                    if (error.response) {
                      console.error(error.response.body);
                    }
                  });
            }
          } else {
            const docRef3 = fs.collection("stripeTopUpFollowUps");
            docRef3.add({
              countryCode,
              customerPhone,
              amountPaid,
              customerEmail,
              customerNameOnCard,
              paymentDate,
              paymentState,
              paymentStatus,
            });

            const msg = {
              to: `${customerEmail}`,
              from: {
                email: "admin@tapfuma.com",
                name: "Tapfuma Admin",
              },
              subject: "Tapfuma top-up processing",
              html: `<strong>Dear ${customerNameOnCard}</strong><p>We are processing your payment for a Tapfuma wallet top-up.<br><br>Your top-up will reflect when you check your Tapfuma account balance on whatsapp within the next 5 to 10 minutes.<br><br>Feel free to contact us if you have any questions or comments.<br><br>Kind regards,<br>Tapfuma Admin team</p>`,
            };

            sgMail
                .send(msg)
                .then(() => {}, (error) => {
                  console.error(error);

                  if (error.response) {
                    console.error(error.response.body);
                  }
                });
          }
        } else {
          const docRef3 = fs.collection("unsupportedCountryTopUp");
          docRef3.add({
            customerPhone,
            amountPaid,
            customerEmail,
            customerNameOnCard,
            paymentDate,
            paymentState,
            paymentStatus,
          });

          const msg = {
            to: `${customerEmail}`,
            from: {
              email: "admin@tapfuma.com",
              name: "Tapfuma Admin",
            },
            subject: "Tapfuma top-up unsupported",
            html: `<strong>Dear ${customerNameOnCard}</strong><p>We have received your payment for a Tapfuma wallet top-up.<br><br>Unfortunately, we are unable to add the funds you have paid to your Tapfuma wallet because the phone number you provided (${customerPhone}) is not associated with an active tapfuma account.<br>A refund has been issued to your method of payment and will take between 5 and 7 business days to process.<br><br>Feel free to reach out to us with any questions or comments you may have.<br><br>Kind regards,<br>Tapfuma Admin team</p>`,
          };

          sgMail
              .send(msg)
              .then(() => {}, (error) => {
                console.error(error);

                if (error.response) {
                  console.error(error.response.body);
                }
              });
        }
      }


      break;
    case "checkout.session.expired":
      {
        // Then define and call a function to handle the event checkout.session.expired
        const checkoutSessionExpired = event.data.object;
        const docRef4 = fs.collection("stripeHealth");
        docRef4.add({
          checkoutSessionExpired,
        });
      }


      break;
      // ... handle other event types
    default:
    {
      const docRef4 = fs.collection("stripeHealth");
      docRef4.add({
        "Unhandled event type": `${event.type}`,
      });
    }
  }

  res.sendStatus(200);
});

router.put("/:id", async (req, res) => {
  res.send({"Hello": "PUT"});
});

router.delete("/:id", async (req, res) => {
  res.send({"Hello": "DELETE"});
});


function mapI() {
  return new Promise((resolve, reject) => {
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


// END API - EXPORT ONLY AFTER THIS
module.exports = router;
