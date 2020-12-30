var express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var path = require('path');
const fs = require('fs');

var app = express();

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	var isCaptcha = true;
	var requireCaptcha = request.headers['captcharequire'];

	// Check the header if captcha is required
	if (requireCaptcha == 'no') {
		isCaptcha = false;
	} 
	
	if (isCaptcha) {
		response.sendFile(path.join(__dirname + '/login_captcha.html'));
	} else {
		response.sendFile(path.join(__dirname + '/login.html'));
	}
});

var isLogin = "";

const users = [
	{
		name: 'mary',
		pw: 'password1'
	},
	{
		name: 'john',
		pw: 'password2'
	},
	{
		name: 'david',
		pw: 'password3'

	}
]

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;

	const foundUser = users.find(({name}) => name === username);
	var dir = './app_log';
	console.log(foundUser);

	if (foundUser) {
		if (users.find(({pw}) => pw === password)) {
			request.session.loggedin = true;
			request.session.username = username;
			isLogin = true;
			request.session.save(function(err) {});
			
			// -- Start Print Coookies
			try {
				const cookies = request.headers.cookie;
				console.log(cookies);
				const cookieAry = cookies.split(' ');
				const current = new Date();
				let outputString = `${current} userid=${username} ${cookies}\n`;
				if (!fs.existsSync(dir)){
					fs.mkdirSync(dir);
				}
				/*for (let cookie of cookieAry) {
					console.log(cookie);
					outputString += `${cookie}\n`;
				}*/
				//const writeFileResult = fs.writeFileSync(`app.log`, outputString); 
				const writeFileResult = fs.appendFileSync('/var/log/app.log', outputString); 
				//const writeFileResult = fs.createWriteStream('app.log', outputString); 
			} catch (err) {
				console.log(err);
				return err;
			}
			// --- End Print Cookies
			response.set('userid', username);
			//console.log("Before Redirection Check -->" + request.session.loggedin + " UserName Check --> " + request.session.username);
			response.redirect('/landing');
		} else {
			response.send('Incorrect Username and/or Password!');
		}			
		response.end();
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
		response.set('userid', request.session.username);
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/landing', function(request, response) {
	console.log(request.session.loggedin);
	if (isLogin) {
		response.sendFile(path.join(__dirname + '/landing.html'));
		response.set('userid', request.session.username);
	} else {
		response.send('Please login to view this page!' + request.session.loggedin);
	}
});


app.listen(3000);
