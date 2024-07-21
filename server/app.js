// const dotenv = require('dotenv')
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require("cors");
require('dotenv').config();

// console.log(process.env.MONGODB_URI)

const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
// const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

// const store = new MongoDBStore({
//   uri: MONGODB_URI,
//   collection: 'sessions'
// });

// const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const whitelist = [
  "http://localhost:3000",
  "https://ecommerce-website-fe.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// app.use(
//   session({
//     secret: 'my secret',
//     resave: false,
//     saveUninitialized: false,
//     store: store
//   })
// );

// app.use(csrfProtection);

app.use(flash());

// app.use((req, res, next) => {
//   res.locals.isCustomer = req.session.isCustomer;
//   res.locals.isAuthenticated = req.session.isLoggedIn;
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

// app.use((req, res, next) => {
//   if (!req.session.user) {
//     return next();
//   }
//   User.findById(req.session.user._id)
//     .then(user => {
//       if (!user) {
//         return next();
//       }
//       req.user = user;
//       next();
//     })
//     .catch(err => {
//       next(new Error(err));
//     });
// });

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");


app.use('/',authRoutes);
app.use('/admin', adminRoutes);
app.use('/',shopRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode;
  const message = error.message || 'An internal server error occured!';
  const data = error.data;
  res.status(status).json({
    responseCode: 0,
    message: message,
    data: data
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  })
  .catch(err => {
    console.log(err);
  });
