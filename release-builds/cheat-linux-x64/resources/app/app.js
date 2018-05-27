var app = angular.module('chat',['ngFileUpload']);
const {ipcRenderer} = electron;
// app.config(function($routeProvider) {
//     $routeProvider
//         .when('/login', {
//             templateUrl: 'view1.html',
//             controller: 'FirstController'
//         })
//         .when('/view2', {
//             templateUrl: 'view2.html',
//             controller: 'SecondController'
//         })
//         .otherwise({
//             redirectTo: '/view1'
//         });
// });
// var __appurl = "http://localhost:8080/";
var __appurl = 'http://www.atishay.tk/'

//variables for api's
var api = __appurl + "api/";
var phoneNumber = api +'verifyPhoneNumber';
var login = api + 'login';
var signup = api + 'register';
var sendMess = api + 'sendMessage';
var me = api + 'me';
var searchURL = api + 'searchUsers';
// local
// Dev server
// var __appurl = "http://180.151.69.138:2023/"
// var __appurl = 'http://192.168.10.145:5000/'



function checkError(err, status){    
    if(err && err.message){
        return alert(err.message);
    }else{
        return alert('Please check your internet connection');
    }
    if(status == 401){
        window.location.href = 'login.html';
    }   
}

function message(message){
    return alert(message);
}

function storeId(id){
    if(!id){
        return;
    }
    // localStorage.setItem('userId', id);
    return;
}
function deleteId(id){
    if(!id){
        return;
    }
    // localStorage.removeItem('id');
    return;
}

function getId(){
    // var userId = localStorage.getItem('id');
    return userId;
}

function storeToken(token){
    if(!token){
        return;
    }
    // localStorage.setItem('token', token);
    return;
}
function deleteToken(token){
    if(!token){
        return;
    }
    // localStorage.removeItem('token');
    return;
}

function getUser(){
    ipcRenderer.send('getUser', {});
}
