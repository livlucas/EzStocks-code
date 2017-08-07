"use strict";

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')();
const express = require('express');

const app = express();

admin.initializeApp(functions.config().firebase);

app.use(cors);

app.post('/forgot-password', (req, res) => {
    var email = (req.body.email || '').trim();

    admin.database().ref('/users')
        .orderByChild('email')
        .equalTo(email)
        .limitToFirst(1)
        .once('value')
        .then((dbs) => {
            var result = dbs.val(),
                key, user;

            res.setHeader('Content-Type', 'application/json');

            if (result !== null) {
                key = Object.keys(result).pop();
                user = result[key];

                if (user.email === email) {
                    let index = Math.floor((Math.random() * 3)) + 1;
                    let question = user['question' + index];

                    res.end(JSON.stringify({
                        success: true,
                        questionId: question,
                        questionIndex: index
                    }));

                    return;
                }
            }

            res.end(JSON.stringify({
                success: false,
                message: 'user not found'
            }));       
        });
});

app.post('/reset-password', (req, res) => {
    var data = {
        email: req.body.email || '',
        questionIndex: req.body.questionIndex || '',
        answer: req.body.answer || '',
        newPassword: req.body.newPassword || ''
    };

    admin.database().ref('/users')
        .orderByChild('email')
        .equalTo(data.email)
        .limitToFirst(1)
        .once('value')
        .then((dbs) => {
            var result = dbs.val(),
                uid, user;

            res.setHeader('Content-Type', 'application/json');

            if (result !== null) {
                uid = Object.keys(result).pop();
                user = result[uid];

                if (user.email === data.email) {
                    let answer = user['answer' + data.questionIndex];

                    if (answer && (answer === data.answer)) {
                        admin.auth().updateUser(uid, {
                            password: data.newPassword
                        })
                        .then(() => {
                            res.end(JSON.stringify({
                                success: true
                            }));
                        })
                        .catch(() => {
                            res.end(JSON.stringify({
                                success: false,
                                message: 'Password too short'
                            }));
                        });
                        return;
                    }
                }
            }

            res.end(JSON.stringify({
                success: false,
                message: 'Incorrect answer'
            }));       
        });
});

exports.app = functions.https.onRequest(app);

