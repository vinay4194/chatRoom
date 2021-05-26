const mongoose = require("mongoose");

mongoose
	.connect("mongodb+srv://vinay4194:vinay4194@chatroom.t5yuy.mongodb.net/chatRoom?retryWrites=true&w=majority", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log("connected to DB");
	})
	.catch((err) => {
		console.log(err);
	});
