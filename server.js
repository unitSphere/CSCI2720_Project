// Authors: Alejandro Elizondo 1155123257, Ubaydullo Rustami 1155102622, Andres Tamez 1155123046

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcryptjs');
const passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

app.use(session({
	secret: '2C44-4D44-WppQ38S',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://root:qzGcp12kichIAMY9@cluster0-ckslr.gcp.mongodb.net/finalProjectDB', {useNewUrlParser: true});
var db = mongoose.connection;

// Upon connection failure
db.on('error', console.error.bind(console,
	'Connection error:'));
// Upon opening the database successfully
db.once('open', function () {
	console.log("Connection is open...");
});

var ActivitySchema = mongoose.Schema ({
	name: { type: String, required: true },
	schedule: { type: String, required: true },
	organizationName: { type: String },
	locationName: { type: String },
	charitable: { type: Boolean },
	comments: [{ type: String}]

});

var UserSchema = mongoose.Schema ({
	name: { type: String, required: true, unique: true },
	password: { type: String, required: true},
	favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
	admin: { type: Boolean}
});

const Activity = mongoose.model('Activity', ActivitySchema);
const User = mongoose.model('User', UserSchema);

var activities = [];
var favorites = [];

var auth = function(req, res, next) {
	if (req.session && req.session.user === "amy" && req.session.admin)
		return next();
	else
		return res.sendStatus(401);
};

//register
var user = "";
var activityId = -1;
var flushed = false;

app.post('/register', function(req, res) {
var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(req.body.psw, salt);

	var newUser = new User({
		name: req.body.usr,
		password: hash,
		favorites: undefined,
		admin: false
	});
	newUser.save(function(err) {
		if (err) {
			if (err.name === 'MongoError' && err.code === 11000) {
			 // Duplicate username
			 return res.send('User with the given username already exist! Please choose another one.');
			}

		 // Some other error
		 return res.send(err);
		}
		res.send('Success');
	});
});

//login functionality

app.get('/login', function(req,res) {
	user = req.query.uname;
	var pass = req.query.psw;
	User.findOne(
		{name: req.query.uname},
		function(err, e) {
			if(!e){
				res.send("The user was not found.");
			}
			else if (err){ res.send(err);}
			else {
				var pass2 = e.password;
				var result = bcrypt.compareSync(pass, pass2);

				if (result){
				if(e.admin !=true){
					req.session.user = "amy";
					req.session.admin = true;
					res.redirect('/home');

				}
				else{
					req.session.user = "amy";
					req.session.admin = true;
					res.redirect('/admin');
				}
			}
			else{
				res.send("Incorrect Password. Please try again!");
			}
		}

		});
});


// Logout functionality
app.get('/logout', function(req, res) {
	req.session.destroy();
	activities = [];
	favorites = [];
	res.redirect('/');
});

//When the admin link is pressed, render admin view
app.get('/admin', function(req, res) {
	res.render('admin');
});

//this code is responsible for creating new events
app.post('/activity', function(req,res) {
	var newEvent = new Activity({
		name: req.body['aName'],
		schedule: req.body['schedule'],
		organizationName: req.body['oName'],
		locationName: req.body['lName'],
		charitable: req.body['charity']
	});

	newEvent.save(function(err) {
		if (err) {
			if ((err.name === 'MongoError' && err.code === 11000) || (err.schedule === 'MongoError' && err.code === 11000)) {
		 // Duplicate username
		 return res.status(500).send('Event with the given name or schedule already exist! Please change the schedule or name.');
		}
	 // Some other error
	 return res.status(500).send(err);
	}
	res.send("Success! Activity: " + newEvent.name + " was successfully created.");
});
})

app.post('/user', function(req,res) {

	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(req.body['upsw'], salt);

	var newUser = new User({
		name: req.body['uName'],
		password: hash,
		admin: req.body['adm']
	});

	newUser.save(function(err) {
		if (err) {
			if (err.name === 'MongoError' && err.code === 11000) {
		 // Duplicate username
		 return res.status(500).send('User with the given name  already exist! Please change the name.');
		}

	 // Some other error
	 return res.status(500).send(err);
	}
	res.send('Success');
});
})

app.post('/aUpdate', function(req,res) {

	var myquery = { name: req.body['upEvent'],
	schedule: req.body['upSchedule'], organizationName: req.body['upOName'], locationName: req.body['upLName']};

	var newvalues = { $set: {name: req.body['aChangeName'], schedule: req.body['changeSchedule'],
	organizationName: req.body['changeOName'], locationName: req.body['changeLName'], charitable: req.body['changeCharity']} };

	Activity.findOne(
		{name: req.body['upEvent'],
		schedule: req.body['upSchedule'], organizationName: req.body['upOName'], locationName: req.body['upLName']},
		function(err, e) {
			if(!e){
				res.send("The event ID was not found. Run the Code again to retry.");
			}
			else if (err) res.send(err);

			else{
				Activity.updateOne(myquery, newvalues, function(err, obj){

					if (err) throw err;

				});
				res.send('Success');

			}
		});
});

app.post('/uUpdate', function(req,res) {

	var myquery = { name: req.body['upUser']};

	var newvalues = { $set: {name: req.body['uChangeName'], password: req.body['uChangePassword'], admin: req.body['uUpdateAdm']} };

	User.findOne(
		{name: req.body['upUser']},
		function(err, e) {
			if(!e){
				res.send("The User with the given username was not found. Please pay attention to the spelling.");
			}
			else	if (err) res.send(err);

			else{
				User.updateOne(myquery, newvalues, function(err, obj){

					if (err) throw err;

					res.redirect('/admin');

				});
			}
		});
});

app.post('/aDelete', function(req,res) {

	var myquery = { name: req.body['dEvent'],
	schedule: req.body['dSchedule']};
	Activity.findOne(
		{name: req.body['dEvent'],
		schedule: req.body['dSchedule']},
		function(err, e) {
			if(!e){
				res.send("The event ID was not found. Run the Code again to retry.");
			}
			else	if (err) res.send(err);

			else{
				Activity.deleteOne(myquery, function(err, obj){
					if (err) throw err;

					res.redirect("/admin");

				});
			}
		});
});

app.post('/uDelete', function(req,res) {

	var myquery = { name: req.body['dUser']};
	User.findOne(
		{name: req.body['dUser']},
		function(err, e){
			if(!e){
				res.send("The User with the given username was not found. Please check the spelling.");
			}
			else	if (err) res.send(err);

			else{
				User.deleteOne(myquery, function(err, obj){

					if (err) throw err;

					res.redirect('/admin');

				});
			}
		});
});

//Read all events and list them

app.get('/eventlist', function(req,res) {
	Activity.find({}).exec(function(err, e) {
		if(!e){
			res.send("No activities found.");
		}
		if (err) console.log(err);
		else{
			let n = "";
			for (let element of e)
			{
				n = n + ("Activity name: " + element.name + "<br>\n" +
					"Activity schedule: " + element.schedule + "<br>\n" +
					"Organization Name: " + element.organizationName + "<br>\n" +
					"Address " + element.locationName + "<br>\n<br>\n" +
					"Charitable? " + element.charitable + "<br>\n<br>\n");
			}
			res.send(n);
		}
	})
});

app.post('/flush', function(req,res) {
	Activity.deleteMany({}, function(err) {
		if (err) return handleError(err);
		flushed = true;
		favorites = [];
		activities = [];
	});
	User.deleteMany({}, function(err) {
		if (err) return handleError(err);

	});
	res.send("Database flushed");
});

//Read all the users and list them
app.get('/userlist', function(req,res) {
	User.find({}).exec(function(err, e) {
		if(!e){
			res.send("No users found.");
		}
		if (err) console.log(err);
		else{
			let n = "";
			for (let element of e)
			{
				n = n + ("<br>\n<br>\n"+"User name: " + element.name + "<br>\n<br>\n" +
					"User password: " + element.password + "<br>\n<br>\n" +
					"Admin? " + element.admin + "<br>\n<br>\n");
			}
			res.send(n);
		}
	});
});

app.get('/about', function(req, res) {
	res.render('about', {user: user});
});

// When first called, initializes the favorites and activities arrays for coding ease.
app.get('/home', auth, function(req,res) {
	// Load user favorites from database.
	if (favorites.length == 0) {
		User.findOne( { name: user }, function(err, u) {
			if (err)
				res.send(err);
			for (var i = 0; i < u.favorites.length; i++) {
				Activity.findById(u.favorites[i], function(err, a) {
					if (err)
						res.send(err);
					let charitable = a.charitable ? "Yes" : "No";
					favorites.push([a.name, a.schedule, a.organizationName, a.locationName, charitable]);
				});
			}
		});
	}
	Activity.count({}, function(err, count) {
		// The database is empty
		if (count == 0 && !flushed) {
			// Check if it's the first time visiting home in this session
			if (activities.length == 0) {
				request("http://fundraising.one.gov.hk/fundraise_query/webservice/psi/json?itemperpage=100", function(error, response, body) {
					data = JSON.parse(body);
					for (var i = 0; i < 100; i++) {
						let activity = data.activities[i];
						activities[i] = [];
						activities[i][0] = activity.activityNameEnglish;
						activities[i][1] = "From: " + activity.schedule[0].dateFrom +
						" To: " + activity.schedule[0].dateTo;
						activities[i][2] = activity.organisationNameEnglish;
						activities[i][3] = activity.locationNameEnglish == "" ? "NA" : activity.locationNameEnglish;
						activities[i][4] = activity.charitable == "true" ? "Yes" : "No";
						activities[i][5] = [];

						var newActivity = new Activity ({
							name: activities[i][0],
							schedule: activities[i][1],
							organizationName: activities[i][2],
							locationName: activities[i][3],
							charitable: activities[i][4] == "Yes" ? true : false
						});
						activities[i][6] = newActivity._id;
						newActivity.save(function(err) {
							if (err)
								res.send(err);
						});
					}
					res.render('index', {activities: activities, user: user});
				});
			} else
			res.render('index', {activities: activities, user: user});
		} else {	// activities will get the activities from the database
			if (activities.length != 0)
				res.render('index', {activities: activities, user: user});
			else {
				Activity.find({}, function(err, a) {
					a.forEach(function(act) {
						let charitable = act.charitable ? "Yes" : "No";
						activities.push([
							act.name,
							act.schedule,
							act.organizationName,
							act.locationName,
							charitable,
							act.comments,
							act._id ]);
					});
					res.render('index', {activities: activities, user: user});
				});
			}
		}

	});
});

app.get('/event', function(req,res) {
	if(req.query.id == "") {
		res.end();
	}
	else {
		activityId = Number(req.query.id) - 1;
		let activity = activities[activityId];
		Activity.findOne({name: activity[0], schedule: activity[1], organizationName: activity[2] },
			function(err,a){
				if(err)
					res.send(err);
				if(!a) {
					var newActivity = new Activity ({
						name: activity[0],
						schedule: activity[1],
						organizationName: activity[2],
						locationName: activity[3],
						charitable: activity[4] == "Yes" ? true : false
					});
					newActivity.save(function(err) {
						if (err)
							res.send(err);
					});
				} else {
					activities[activityId][5] = a.comments;
					activity[5] = a.comments;
				}
				res.render('eventDetails', {
					name: activity[0],
					schedule: activity[1],
					organization: activity[2],
					location: activity[3],
					charitable: activity[4],
					comments: activity[5],
					user: user,
					activityId: activityId + 1,
					size: activity[5].length
				});
			});
	}
});

// Gets called when a comment is added to an activity.
app.post('/event', function(req,res) {
	let activity = activities[activityId];
	Activity.findOne(
		{name: activity[0], schedule: activity[1], organizationName: activity[2]},
		function(err, a) {
			if(err)
				res.send(err);
			let commentUser = user + ": " + req.body.text;
			a.comments.push(commentUser);
			activities[activityId][5].push(commentUser);
			a.save(function(err){
				if(err)
					res.send(err);
				res.send(user);
			})
		}
		);
});

app.get('/favorites', function(req, res) {
	res.render('favorites', {user: user, favorites: favorites});
});

app.post('/favorites', function(req,res) {
	let activity = activities[req.body.id-1];
	User.findOne( { name: user }, function(err, u) {
		if (err)
			res.send(err);
		else {
			var exists = false;
			for (var i = 0; i < u.favorites.length; i++)
				if (activity[6].equals(u.favorites[i]))
					exists = true;

				if (!exists) {
					u.favorites.push(activity[6]);
					var tempFav = [
					activity[0],
					activity[1],
					activity[2],
					activity[3],
					activity[4]
					];
					favorites.push(tempFav);

					u.save(function(err) {
						if (err)
							res.send(err);
						res.send("Success!");
					});
				} else {
					res.send("The activity is already on favorites!");
				}
			}
		//res.render('index', {activities: activities});
	});

});

//-------------------------------------------------
app.get('/', function (req, res) {
	activities = [];
	favorites = [];
	user = "";
	res.render('login');
});

// listen to port 3000
var server = app.listen(3000);
