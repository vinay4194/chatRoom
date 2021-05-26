const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const roomUsers = document.getElementById("users");

//Get the username and room from url
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

//Accessing the socket.io at the frontend..done with the script used in chat.html
const socket = io();

//Sending username and the room to the server
socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
	showRoomName(room);
	showUsers(users);
});

//Catching the message sent by the server
socket.on("message", (message) => {
	outputMsg(message);
	//Scroll down
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("error", (err) => {
	console.log(err);
});

//On sending a message
chatForm.addEventListener("submit", (e) => {
	e.preventDefault();
	//get the msg typed
	const msg = e.target.elements.msg.value;
	//emit the msg to server
	socket.emit("chatMsg", msg);
	e.target.elements.msg.value = "";
	e.target.elements.msg.focus();
});

//Output the message to DOM
function outputMsg(msg) {
	const div = document.createElement("div");
	div.classList.add("message");
	div.innerHTML = `<p class ="meta">${msg.username} ~ <span>${msg.time}</span></p> <p class="text">
   ${msg.text}
   </p>`;
	document.querySelector(".chat-messages").appendChild(div);
}

function showRoomName(room) {
	roomName.innerText = room;
}
function showUsers(users) {
	roomUsers.innerHTML = `${users.map((user) => `<li><i class="fas fa-user-circle"></i>  ${user.username}</li>`).join("")}`;
}
