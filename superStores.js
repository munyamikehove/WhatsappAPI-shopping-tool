require("dotenv").config();


function superStoreFunction(countryCode, currentProductID, fs, currentUSDExchangeRates) {
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


        ssExtensionZimbabwe(priceInUSD, currentProductID, doc, fs);

        ssExtensionZambia(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionSouthAfrica(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionLesotho(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionBotswana(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionNamibia(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionMalawi(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionTanzania(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionKanye(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionNigeria(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionRwanda(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionUganda(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionGhana(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);

        ssExtensionMozambique(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates);
      }
    });

    return resolve();
  });
}

function ssExtensionZimbabwe(priceInUSD, currentProductID, doc, fs) {
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

function ssExtensionZambia(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const zambiaRef = fs.collection("ZM").doc("Products").collection("allProducts").doc(currentProductID);
    const rawZMWKwacha = priceInUSD*currentUSDExchangeRates["ZM"];
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

function ssExtensionSouthAfrica(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const southAfricaRef = fs.collection("ZA").doc("Products").collection("allProducts").doc(currentProductID);
    const rawRand = priceInUSD*currentUSDExchangeRates["ZA"];
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

function ssExtensionLesotho(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const lesothoRef = fs.collection("LS").doc("Products").collection("allProducts").doc(currentProductID);
    const rawLoti = priceInUSD*currentUSDExchangeRates["LS"];
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

function ssExtensionBotswana(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const botswanaRef = fs.collection("BW").doc("Products").collection("allProducts").doc(currentProductID);
    const rawPula = priceInUSD*currentUSDExchangeRates["BW"];
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

function ssExtensionNamibia(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const namibiaRef = fs.collection("NA").doc("Products").collection("allProducts").doc(currentProductID);
    const rawNADollar = priceInUSD*currentUSDExchangeRates["NA"];
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

function ssExtensionMalawi(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const malawiRef = fs.collection("MW").doc("Products").collection("allProducts").doc(currentProductID);
    const rawMWKwacha = priceInUSD*currentUSDExchangeRates["MW"];
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

function ssExtensionTanzania(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const tanzaniaRef = fs.collection("TZ").doc("Products").collection("allProducts").doc(currentProductID);
    const rawTZShilling = priceInUSD*currentUSDExchangeRates["TZ"];
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

function ssExtensionKanye(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const kenyaRef = fs.collection("KE").doc("Products").collection("allProducts").doc(currentProductID);
    const rawKEShilling = priceInUSD*currentUSDExchangeRates["KE"];
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

function ssExtensionRwanda(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const rwandaRef = fs.collection("RW").doc("Products").collection("allProducts").doc(currentProductID);
    const rawRWFranc = priceInUSD*currentUSDExchangeRates["RW"];
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

function ssExtensionUganda(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const ugandaRef = fs.collection("UG").doc("Products").collection("allProducts").doc(currentProductID);
    const rawUGXShilling = priceInUSD*currentUSDExchangeRates["UG"];
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

function ssExtensionGhana(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const ghanaRef = fs.collection("GH").doc("Products").collection("allProducts").doc(currentProductID);
    const rawGHSCedi = priceInUSD*currentUSDExchangeRates["GH"];
    const ghanaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
    });
    const priceInGHSCedi = ghanaFormatter.format(rawGHSCedi);
    ghanaRef.set(doc.data()).then(() =>{
      ghanaRef.set({"productPrice": `${priceInGHSCedi}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionNigeria(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const nigeriaRef = fs.collection("NG").doc("Products").collection("allProducts").doc(currentProductID);
    const rawNGNaira = priceInUSD*currentUSDExchangeRates["NG"];
    const nigeriaFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
    });
    const priceInNGNaira = nigeriaFormatter.format(rawNGNaira);
    nigeriaRef.set(doc.data()).then(() =>{
      nigeriaRef.set({"productPrice": `${priceInNGNaira}`}, {merge: true});
    });
    return resolve();
  });
}

function ssExtensionMozambique(priceInUSD, currentProductID, doc, fs, currentUSDExchangeRates) {
  return new Promise((resolve, reject) => {
    const mozambiqueRef = fs.collection("MZ").doc("Products").collection("allProducts").doc(currentProductID);
    const rawMZNMetical = priceInUSD*currentUSDExchangeRates["MZ"];
    const mozambiqueFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MZN",
    });
    const priceInMZNMetical = mozambiqueFormatter.format(rawMZNMetical);
    mozambiqueRef.set(doc.data()).then(() =>{
      mozambiqueRef.set({"productPrice": `${priceInMZNMetical}`}, {merge: true});
    });
    return resolve();
  });
}

exports.superStoreFunction = superStoreFunction;
