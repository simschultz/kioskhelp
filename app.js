const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const AD = require('ad');
const options = require('./config/options');

const app = express();
const port = 3000;

const ad = new AD({
  url: options.storageConfig.server,
  user: options.storageConfig.user,
  pass: options.storageConfig.pass
})

// view engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('home', {layout: false});
})

app.get('/contact', (req, res) => {
  res.render('contact', {layout: false});
});

app.get('/result', (req, res) => {
    res.render('result', {layout: false});
})

app.get('/unlock', (req, res) => {
  res.render('unlock', {layout: false});
})

app.post('/unlockacc', (req, res) => {
  // console.log(req.body.user);
  let userAcc = req.body.user;
  (async () => {
    try {
        await ad.user(userAcc).unlock();
        res.render('result', {layout: false, msg: 'Account Unlocked'});
    } catch(err) {
      console.log(err);
      res.render('result', {layout: false, fail: 'Account could not be unlocked. Please contact IT directly'});
    }
})();
});

app.post('/send', (req, res) => {
    const output = `
        <p>You have a new IT Helpdesk request</p>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Message: </strong>${req.body.message}</p>
        `;
    let transporter = nodemailer.createTransport({
        host: options.storageConfig.host,
        port: 25,
        secure: false, // true for 465, false for other ports
        tls: {
            rejectUnauthorized:false
        }
      });
    
      // send mail with defined transport object
      let mailoptions = {
        from: '"IT Kiosk 👻" <letmehelpyou@domainhere.com>', // sender address
        to: "whosgonnagetit@domainhere.com", // list of receivers
        subject: `IT Kiosk - Request from - ${req.body.name}`, // Subject line
        html: `${output}` // html body
      };

      transporter.sendMail(mailoptions, (error, info) => {
          if (error) {
            res.render('result', {layout: false, fail: 'Email failed to send. Please contact IT directly.'});
          } else {
            res.render('result', {layout: false, msg: 'Email has been sent. This page will redirect momentarily.'});
          }
      })

    //   console.log("Message sent: %s", info.messageId);
    //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      
})
app.get('*', (req, res) => {
  res.redirect(302, '/');
})

app.listen(port, () => console.log(`Server running on port ${port}`));
