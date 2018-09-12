const functions = require('firebase-functions');
const api_key   = 'key-636579972a725f67a7e107f47220906a';
const domain    = 'mg.omniscent.com';
const mailgun   = require('mailgun-js')({apiKey: api_key, domain: domain});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

function sendMail(title, content, mailTo) {
	var data = {
		from: 'no-reply@test.com',
		subject: title,
		html: content,
		to: mailTo
	};

	return new Promise((resolve, reject) => {
		mailgun.messages().send(data, function(error, body) {
			if (error) {
				return reject(error);
			}

			return resolve();
		});
	});
}

exports.detectHistory = functions.database.ref('/histories/{userId}').onWrite((event, context) => {
  console.log('--start--');
  console.log(event.before.val());
  console.log(event.after.val());
  var mailTo = ['technic.workjoao@gmail.com', 'upworktest2@itnetsys.com'];
  var title = 'Notification';
  var content = 'testing';
  return sendMail(title, content, mailTo);
});