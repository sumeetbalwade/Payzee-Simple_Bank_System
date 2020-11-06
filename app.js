//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const databaseConnnection = process.env.DATABASE_CONNECTION;
const mongoDB = databaseConnnection;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const userTemplate = {
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  balance: Number,
};

const transactionTemplate = {
  name: { type: String },
  email: { type: String },
  amount: Number,
};

const user = mongoose.model('User', userTemplate);
const transaction = mongoose.model('Transaction', transactionTemplate);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/addAccount', (req, res) => {
  res.render('addaccount');
});

app.post('/addAccount', function (req, res) {
  const newUser = new user({
    name: req.body.name,
    email: req.body.email,
    balance: req.body.balance,
  });

  newUser.save();

  res.redirect('/allAccount');
});

app.get('/allAccount', (req, res) => {
  user.find({}, (err, findedList) => {
    if (!err) {
      if (findedList.length === 0) {
        res.redirect('/');
      } else {
        res.render('allAccount', {
          user: findedList,
        });
      }
    }
  });
});

app.get('/transfer/:userId', function (req, res) {
  const requestedUserID = req.params.userId;

  user.findById(requestedUserID, (err, findedUser) => {
    if (!err) {
      res.render('transfer', {
        id: findedUser._id,
        name: findedUser.name,
        email: findedUser.email,
        balance: findedUser.balance,
      });
    }
  });
});

app.post('/transfer', function (req, res) {
  var requestedUserID = req.body.id;
  const amount = Number(req.body.amount);
  const balance = Number(req.body.balance);
  const total = balance + amount;
  user.findByIdAndUpdate(
    requestedUserID,
    { balance: total },
    (err, findedUser) => {
      if (!err) {
        const newTransaction = new transaction({
          name: req.body.name,
          email: req.body.email,
          amount: req.body.amount,
        });

        newTransaction.save();

        res.redirect('/allAccount');
      } else {
        res.redirect('/');
      }
    }
  );
});

app.get('/transactions', (req, res) => {
  transaction.find({}, (err, findedList) => {
    if (!err) {
      if (findedList.length === 0) {
        res.redirect('/');
      } else {
        res.render('transactions', {
          transactions: findedList,
        });
      }
    }
  });
});

app.listen(3000, () => {
  console.log(`Server Stated at Port 3000`);
});
