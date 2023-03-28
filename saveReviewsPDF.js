require("dotenv").config();
const pdfshift = require("pdfshift")(process.env.PDFSHIFT_IO_API_KEY);

function saveReviewsPDF(countryCode, userPhoneNumber, currentBrowseProductsIndex, currentMessageTimeStamp, fs, client, pdfURL, pdfFileName, bucket) {
  return new Promise((resolve, reject) => {
    // const pdfURL = 'https://reviws.web.app/CA::os2Ag43aZQIdzXHvbT5O'; // URL of the mobile version of the webpage
    // const pdfFileName = 'CAos2Ag43aZQIdzXHvbT5O.pdf'; // Name of the PDF file to be saved


    pdfshift.prepare(pdfURL, {"delay": 5000}).addHTTPHeader("user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148").convert().then( (binaryFile) => {
      const file = bucket.file(pdfFileName);
      const blobStream = file.createWriteStream({
        metadata: {
          contentType: "application/pdf",
        },
      });

      const pdfBinaryData = binaryFile;

      blobStream.on("error", (error) => {
        console.log(error);
      });

      blobStream.on("finish", (res) => {
        file.getSignedUrl({
          action: "read",
          expires: "03-17-2050",
        }).then((signedUrls) => {
        // let aaa = resolve(signedUrls[0]);
          console.log(`Successfully uploaded PDF file to Firebase Storage. download URL: ${signedUrls[0]}`);
        }).catch((error) => {
          console.log("Unable to get PDF download URL.", error);
        });
      });

      blobStream.end(pdfBinaryData);
    }).catch((error) => {
      console.log(error);
    });


    return resolve();
  });
}

exports.saveReviewsPDF = saveReviewsPDF;
