//Importing modules
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMsg = require("../utils/messages");
const { userJoin, getCurrentUser, userLeft, getRoomUsers } = require("../utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Database and Schema
require("./conn");
const Register = require("./models");

const port = process.env.PORT || 8000;

//Set the path for the Static files
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));
app.set("view engine", "hbs");

//Routes---
app.get("/", (req, res) => {
	res.render("index");
});

app.get("/user-login", (req, res) => {
	res.render("user-login");
});

app.get("/register", (req, res) => {
	res.render("register");
});
app.get("/guest-login", (req, res) => {
	res.render("guest-login");
});
app.get("/chat", (req, res) => {
	res.render("chat");
});
app.get("/guest-chat", (req, res) => {
	res.render("guest-chat");
});
app.get("/user-join", (req, res) => {
	res.render("user-join-room");
});

//Used for getting the data from the FORM in json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//Register a new user
app.post("/register", async (req, res) => {
	try {
		const registerUser = new Register({
			email: req.body.email,
			username: req.body.username,
			password: req.body.password,
		});
		const registered = await registerUser.save();
		res.status(201).render("user-join-room", {
			username: req.body.username,
		});
	} catch (err) {
		res.render("register", {
			errorMsg: `This email is already registered!`,
		});
	}
});

//Login a registered user
app.post("/loggedIn", async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		const userEmail = await Register.findOne({ email: email });
		if (password === userEmail.password) {
			res.status(201).render("user-join-room", {
				username: userEmail.username,
			});
		} else {
			// res.send("Invalid Login Details!");
			res.render("user-login", {
				errorMsg: `Invalid Login Details!`,
			});
		}
	} catch {
		res.render("user-login", {
			errorMsg: `Invalid Login Details!`,
		});
	}
});

//Run when the connection is established
io.on("connection", (socket) => {
	//(1) .emit sends to the single user that's connecting
	//(2) .broadcast.emit sends to everyone except to the user that's connecting
	//(3) io.emit will send to everybody

	socket.on("joinRoom", ({ username, room }) => {
		const user = userJoin(socket.id, username, room);
		socket.join(user.room);

		//Welcome the current user
		socket.emit("message", formatMsg("ChatRooms", "Welcome to Chat Rooms"));
		//Broadcast to others when a user connects
		socket.broadcast.to(user.room).emit("message", formatMsg("ChatRooms", `${user.username} has joined the chat`));

		//Send users and room info
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	//Listen for chatMsg from the frontend
	socket.on("chatMsg", (msg) => {
		const user = getCurrentUser(socket.id);
		io.to(user.room).emit("message", formatMsg(user.username, msg));
	});
	//Runs when user disconnects
	socket.on("disconnect", () => {
		const user = userLeft(socket.id);
		if (user) {
			io.to(user.room).emit("message", formatMsg("ChatRooms", `${user.username} has left the chat`));
			//Update users when a user as left
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
