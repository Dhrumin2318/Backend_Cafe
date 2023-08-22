/// Tryit

var express = require("express");
const connection = require("../connection");
const router = express.Router();
let ejs = require("ejs");
let puppeteer = require("puppeteer");
let path = require("path");
var fs = require("fs");
var uuid = require("uuid");
var auth = require("../services/authentication");
var cheerio = require("cheerio");
const { log } = require("console");

router.post("/generateReport", auth.authenticateToken, async (req, res) => {
  const generateUuid = uuid.v1();
  const orderDetails = req.body;
  var productDetailsReport = JSON.parse(orderDetails.productDetails);

  query =
    "insert into bill (name,email,contactNumber,paymentMethod,total,productDetails,createdBy) values (?,?,?,?,?,?,?)";

  connection.query(
    query,
    [
      orderDetails.name,
      // generateUuid,
      orderDetails.email,
      orderDetails.contactNumber,
      orderDetails.paymentMethod,
      orderDetails.totalAmount,
      orderDetails.productDetails,
      res.locals.email,
    ],
    async (err, result) => {
      if (!err) {
        return res.status(200).json({ uuid: generateUuid ,  orderDetails});
      }else{
        res.status(500).json(err);

      }
       
  })

  });

router.post("/getPdf", auth.authenticateToken, function (req, resp) {
  const orderDetails = req.body;
  const pdfPath = path.join(__dirname , 
    "../generated_pdf/" + orderDetails.uuid+ ".pdf");
  if (fs.existsSync(pdfPath)) {
    resp.contentType("application/pdf");
    fs.createReadStream(pdfPath).pipe(resp);
  } else {
    var productDetailsReport = JSON.parse(orderDetails.productDetails);

    ejs.renderFile(
      path.join(__dirname, "", "report.ejs"),
      {
        productDetails: productDetailsReport,
        name: orderDetails.name,
        email: orderDetails.email,
        contactNumber: orderDetails.contactNumber,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: orderDetails.totalAmount,
      },
      async (err, renderedHtml) => {
        if (err) {
          resp.status(500).json(err);
        } else {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();

          const receiptWidth = 40; // mm
          const receiptHeight = 80; // mm
          await page.setViewport({
            width: receiptWidth,
            height: receiptHeight,
          });

          // Set the content of the page to the rendered HTML
          await page.setContent(renderedHtml, { waitUntil: "networkidle0" });

          // Generate PDF
          const outputPath = path.join(
            __dirname,
            "../generated_pdf/"+
            orderDetails.uuid+ ".pdf"
          );
          console.log(__dirname);
          await page.pdf({ path: outputPath });

          await browser.close();
          

          resp.contentType("application/pdf");
          fs.createReadStream(pdfPath).pipe(resp);
        }
      }
    );
  } 
});

router.get('/allBill' , (req,res) => {
  query = 'select * from bill'
  
  connection.query(query, (err,result) => {
    if(!err){
      return res.status(200).json(result);
    }
    else{
      return res.status(500).json(err)
    }
  })
  
})

module.exports = router;







// var express = require("express");
// const connection = require("../connection");
// const router = express.Router();
// let ejs = require("ejs");
// let puppeteer = require("puppeteer");
// let path = require("path");
// var fs = require("fs");
// var uuid = require("uuid");
// var auth = require("../services/authentication");
// var cheerio = require("cheerio");
// const { log } = require("console");

// // const generateUuid = uuid.v1();


// router.post("/generateReport", auth.authenticateToken, async (req, res) => {
//   try {
//     const generateUuid = uuid.v1();
//     const orderDetails = req.body;
//     var productDetailsReport = JSON.parse(orderDetails.productDetails);

//     query =
//       "insert into bill (name,uuid,email,contactNumber,paymentMethod,total,productDetails,createdBy) values (?,?,?,?,?,?,?,?)";

//     connection.query(
//       query,
//       [
//         orderDetails.name,
//         generateUuid,
//         orderDetails.email,
//         orderDetails.contactNumber,
//         orderDetails.paymentMethod,
//         orderDetails.totalAmount,
//         orderDetails.productDetails,
//         res.locals.email,
//       ],
//       async (err, result) => {
//         if (!err) {
//           ejs.renderFile(
//             path.join(__dirname, "", "report.ejs"),
//             {
//               productDetails: productDetailsReport,
//               name: orderDetails.name,
//               email: orderDetails.email,
//               contactNumber: orderDetails.contactNumber,
//               paymentMethod: orderDetails.paymentMethod,
//               totalAmount: orderDetails.totalAmount,
//             },
//             async (err, renderedHtml) => {
//               if (err) {
//                 res.status(500).json(err);
//               } else {
//                 const browser = await puppeteer.launch();
//                 const page = await browser.newPage();

//                 const receiptWidth = 40; // mm
//                 const receiptHeight = 80; // mm
//                 await page.setViewport({
//                   width: receiptWidth,
//                   height: receiptHeight,
//                 });

//                 // Set the content of the page to the rendered HTML
//                 await page.setContent(renderedHtml, {
//                   waitUntil: "networkidle0",
//                 });

//                 // Generate PDF
//                 const outputPath = path.join(
//                   __dirname,
//                   "../generated_pdf/",
//                   generateUuid + ".pdf"
//                 );
//                 console.log(__dirname);
//                 await page.pdf({ path: outputPath });
//                 // console.log(outputPath);

//                 await browser.close();

//                 return res.status(200).json({ uuid: generateUuid });
//               }
//             }
//           );
//         } else {
//           res.status(500).json(err);
//         }
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// router.post("/getPdf", auth.authenticateToken, async (req, resp) => {
//   try {
//     const orderDetails = req.body;
//     const pdfPath = path.join(
//       __dirname,
//       "../generated_pdf/" + orderDetails.uuid + ".pdf"
//     );

//     if (fs.existsSync(pdfPath)) {
//       resp.contentType("application/pdf");
//       fs.createReadStream(pdfPath).pipe(resp);
//     } else {
//       var productDetailsReport = JSON.parse(orderDetails.productDetails);

//       const renderedHtml = await ejs.renderFile(
//         path.join(__dirname, "", "report.ejs"),
//         {
//           productDetails: productDetailsReport,
//           name: orderDetails.name,
//           email: orderDetails.email,
//           contactNumber: orderDetails.contactNumber,
//           paymentMethod: orderDetails.paymentMethod,
//           totalAmount: orderDetails.totalAmount,
//         }
//       );

//       const browser = await puppeteer.launch();
//       const page = await browser.newPage();

//       const receiptWidth = 40; // mm
//       const receiptHeight = 80; // mm
//       await page.setViewport({
//         width: receiptWidth,
//         height: receiptHeight,
//       });

//       // Set the content of the page to the rendered HTML
//       await page.setContent(renderedHtml, { waitUntil: "networkidle0" });

//       // Generate PDF
//       const outputPath = path.join(
//         __dirname,
//         "../generated_pdf/" + generateUuid + ".pdf"
//       );

//       await page.pdf({ path: outputPath });

//       await browser.close();

//       // Serve the generated PDF for download
//       resp.contentType("application/pdf");
//       fs.createReadStream(outputPath).pipe(resp);

//     }
//   } catch (error) {
//     console.error(error);
//     resp.status(500).json({ error: "An error occurred" });

//   }
// });



// module.exports = router;



