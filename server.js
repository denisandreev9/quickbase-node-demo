const express = require('express')
const exphbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const crypto = require('crypto')
const passport = require('passport')
const GithubStrategy = require('passport-github').Strategy
const { stringify } = require('flatted')
const _ = require('underscore')
const getGitUser = require('./routes/getGitUser')
const authFresh = require('./routes/authFreshDesk')
const postFresh = require('./routes/postFreshdeskUser')

// import env variables
require('dotenv').config()

const app = express()
const port = process.env.PORT
const COOKIE = process.env.PROJECT_DOMAIN

let scopes = ['user:email']
passport.use(
	new GithubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: 'http://localhost:3000/login/github',
			scope: scopes.join(' ')
		},
		function(token, tokenSecret, profile, callback) {
			return callback(null, { profile: profile, token: token })
		}
	)
)
passport.serializeUser(function(user, done) {
	done(null, user)
})
passport.deserializeUser(function(obj, done) {
	done(null, obj)
})
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())
app.use(
    expressSession({
        secret: crypto.randomBytes(64).toString('hex')
            .toString('hex'),
        resave: true,
        saveUninitialized: true
    })
)

const hbs = exphbs.create({
	layoutsDir: __dirname + '/views'
})
app.engine('handlebars', hbs.engine)
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

app.get('/', async (req, res) => {
	let data = {
		session: req.cookies[COOKIE] && JSON.parse(req.cookies[COOKIE])
	}

	if (data.session && data.session.token) {
		try{
			const getGitUserInfo = await getGitUser();
			const postData = {};
			postData.user = getGitUserInfo.name;
			postData.email = getGitUserInfo.email;
			postData.twitter_id = getGitUserInfo.twitter_username;
			postData.address = getGitUserInfo.location;
			freshPostUserAuth = await authFresh();
			freshPostUser = await postFresh(postData);
			console.log("FreshUser res: ", freshPostUser);
		}
		catch(err){
			freshPostUser = {error: err}
		}
	}

	if (data.session) {
		data.session.token = 'alreadyLoggedSession'
	}
	data.json = stringify(data, null, 2)
	res.render('main', data)
})

app.get('/logoff', function(req, res) {
	res.clearCookie(COOKIE)
	res.redirect('/')
})

app.get('/auth/github', passport.authenticate('github'))

app.get(
	'/login/github',
	passport.authenticate('github', { successRedirect: '/setcookie', failureRedirect: '/' })
)

app.get('/setcookie', function(req, res) {
	let data = {
		user: req.session.passport.user.profile._json,
		token: req.session.passport.user.token
	}
	res.cookie(COOKIE, JSON.stringify(data))
	res.redirect('/')
})

app.listen(port, () => {
	console.log(`🌏 Server is running at http://localhost:${port}`)
})