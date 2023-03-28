require("dotenv").config();

function getCartStatus(userPhoneNumber, countryCode, fs) {
  return new Promise((resolve, reject) => {
    // check if user is new or exisits
    let itemsInCart = 0;

    const cartRef = fs.collection(`${countryCode}`).doc("ShoppingCarts").collection(`${userPhoneNumber}`);
    const cartCount = cartRef.get().then((snapShot) => {
      itemsInCart = snapShot.size;
      const cartSnapshot = snapShot;
      return {itemsInCart, cartSnapshot};
    });

    return resolve(cartCount);
  });
}

exports.getCartStatus = getCartStatus;
