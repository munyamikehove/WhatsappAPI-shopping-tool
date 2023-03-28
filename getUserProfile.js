require("dotenv").config();

function getUserProfile(userPhoneNumber, countryCode, fs) {
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

exports.getUserProfile = getUserProfile;
