const electron = require('electron');
const url = require('url');
const path = require('path');
const request = require('request');
// const __appurl = "http://localhost:8080/";
const __appurl = 'http://www.atishay.tk/'
const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;

let knex = require("knex")({
	client: "sqlite3",
	connection: {
		filename: "./chat.sqlite"
	}
});


process.env.NODE_ENV = 'production';
knex.schema.createTable('Users', function (table) {
	table.increments('id');
	table.string('authToken');
	table.string('userId');
}).then();


var dir = 'login.html';
// if app is ready
app.on('ready', () => {
	var result = knex.select("authToken", "userId").from("Users")
	result.then(function (rows) {
		console.log(rows);
		if (rows.length) {
			let token = (rows[rows.length - 1]).authToken;
			console.log(token);
			request.post({ url: __appurl + 'api/isLoggedIn', "form": { "token": token } }, function (error, response, body) {
				console.log(body);
				if (error) {
					return console.log('error:', error); // Print the error if one occurred
				}
				if (response.statusCode == 200) {
					dir = 'chatScreen.html';
				}
				done();
			});
		}
		else {
			done();
		}
	}).catch(function (e) {
		console.error(e);
	});
	//create new window	
})
function done() {
	mainWindow = new BrowserWindow({
		minHeight: 500,
		minWidth: 700
	});
	// load html in window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, dir),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.on('closed', function () {
		app.quit();
	})
	//build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	//insert menu
	Menu.setApplicationMenu(mainMenu);
}
ipcMain.on("storeToken", (err, token, userId) => {
	let ins = knex('Users').insert({ authToken: token, userId: userId })
	ins.then(function (rows) {
		console.log('token stored');
		mainWindow.webContents.send("chatScreen", { status: 200 });
	}).catch(function (err) {
		console.error(err);
	});
});

ipcMain.on('getUser', (err) => {
	var result = knex.select("authToken", "userId").from("Users")
	result.then(function (rows) {
		console.log('sent');
		mainWindow.webContents.send("userDetails", rows[rows.length - 1]);
	}).catch(function (e) {
		console.error(e);
	});
})

function logout() {
	knex('Users').del().then(function(rows){
		console.log('Logged Out');
		dir = 'login.html';
		done();
	})
}
const mainMenuTemplate = [
	{
		// label: 'File',
		// submenu: [
		// 	// {
		// 	// 	label: 'Add Item',
		// 	// 	accelerator: process.platform == 'darwin' ? 'Command+D' : 'Ctrl+D',
		// 	// 	click(){
		// 	// 		createAddWindow();
		// 	// 	}
		// 	// },
		// 	// {
		// 	// 	label: 'Clear Item',
		// 	// 	click(){
		// 	// 		let del = knex('Items').del();
		// 	// 		del.then((rows)=>{
		// 	// 			console.log('deleted');
		// 	// 		})
		// 	// 		mainWindow.webContents.send('item:clear');
		// 	// 	}
		// 	// },
		// 	// {
		// 	// 	label: 'Quit',
		// 	// 	accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
		// 	// 	click(){
		// 	// 		app.quit();
		// 	// 	}
		// 	// }
		// ]
	}
]

// if mac push an extra empty object in the beginning
if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({});
}


// show developer tools
if (process.env.NODE_ENV != 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				}
			},
			{
				role: 'reload'
			}
		]
	})
}

mainMenuTemplate.push({
	label: 'File',
	submenu: [
		{
			label: 'Log out',
			// accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
			click(item, focusedWindow) {
				console.log(focusedWindow);
				logout();
			}
		},

	]
})