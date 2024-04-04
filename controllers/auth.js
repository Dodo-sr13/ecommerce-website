const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const MailGun = require('mailgun.js');
const formData = require('form-data');

const { validationResult } = require('express-validator');

const User = require('../models/user');

const API_KEY = '';
const DOMAIN = '';

const mailGun = new MailGun(formData);
const client = mailGun.client({username: 'api', key: API_KEY});


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Invalid email or password!',
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({email: email})
    .then(user => {
      if(!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.isCustomer = user.isCustomer;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password!',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login')
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req,res,next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const isCustomer = (req.body.userType === 'customer');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }

  
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []},
        isCustomer: isCustomer
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      const messageData = {
        from: 'e-commerce <roy.dodo2001@gmail.com>',
        to: email,
        subject: 'Signup succeeded!',
        html: '<h1> You have successfully signed up for our e-commerce app. Happy shopping! </h1>'
      }
      client.messages.create(DOMAIN, messageData) 
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);;
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);;
    });
};

exports.getReset = (req,res,next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req,res,next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then(user => {
        if(!user) {
          req.flash('error', 'No account with that email found!');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        const messageData = {
          from: 'e-commerce <roy.dodo2001@gmail.com>',
          to: req.body.email,
          subject: 'Reset your password',
          html: `
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password</p>
          `
        };

        client.messages.create(DOMAIN, messageData) 
          .then(res => {
            console.log(res);
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);;
          });
      })
      .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);;
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User
    .findOne({
      resetToken: token, 
      resetTokenExpiration: {$gt: Date.now()}
    })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'Update Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);;
    })
};

exports.postNewPassword = (req,res,next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);;
  })
};
