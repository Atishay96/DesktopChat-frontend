app.controller('SocketController',async function($scope,$http){
	var socket = io.connect(__appurl , {transports:['websocket']} )
	const {ipcRenderer} = electron;
	$scope.allWindows = [];
	$scope.original = [];
	await getUser();
	ipcRenderer.on('userDetails', function(e, row){
    	$scope.token = row.authToken;
    	$scope.userId = row.userId;
    	// console.log("socket controller");
    	// console.log($scope.token);
    	$http({
			url: me,
			method: 'GET',
			headers:{
				authToken: $scope.token
			}
		}).success( function(data){
			$scope.profilePicture = __appurl + data.data.profilePicture;
			// console.log(data.data);
			$scope.name = data.data.name;
		}).error( function(err, status){
			checkError(err, status);
		})		
    	socket.on('allChats_'+$scope.userId , function(messages){
    		angular.forEach(messages, (v,i)=>{
    			if(!messages[i].done){
    				$scope.allWindows.push(v._id);
					messages[i].users[0].profilePicture = __appurl + v.users[0].profilePicture;
					messages[i].done = true;
    			}
			})
			console.log(messages);
			$scope.$apply(function () {				
				$scope.windows = messages;
				$scope.original = messages;
	        });
		});
		socket.on('error-login_'+$scope.userId,function(error){
			// console.log('5ad1f1ee146b2c73a9b01eef');
			console.log(error);
		})
		socket.on('logout_'+$scope.userId, function(err){
			checkError(err, 401);
		})
		socket.emit('getChats', { 'token' : $scope.token });
		// console.log('newMessage_'+$scope.userId);
		socket.on('newMessage_'+ $scope.userId, function(dataset){
			// console.log('new message');
			// console.log(dataset);
			// console.log($scope.allWindows);
			let index = $scope.allWindows.indexOf(dataset.message.windowId);
			if(index == -1){
				return alert("something wrong happend");
			}
			$scope.$apply(function () {
				$scope.windows[index].messages.push(dataset.message);
	        });
	        // console.log($scope.selected._id);
	        // console.log(dataset.message.windowId);
	        if($scope.selected._id == dataset.message.windowId){
	        	setTimeout(function(){
					$(".messages").animate({ scrollTop: ($(document).height() + $scope.selected.messages.length*99) }, "slow");
				},0)
	        }
		})
		socket.on('newWindow_'+ $scope.userId, function(dataset){
			// console.log('new window');
			// console.log(dataset);
			// console.log($scope.allWindows);
			let index = $scope.allWindows.indexOf(dataset.window._id);
			if(index != -1){
				$scope.$apply(function () {
					$scope.windows[index].messages.push(dataset.window);
		        });
			}
			dataset.window.users[0].profilePicture = __appurl + dataset.window.users[0].profilePicture;
			let winds = $scope.windows.reverse();
			winds.push(dataset.window);
			winds = winds.reverse();
			$scope.allWindows.unshift(dataset.window._id);
			$scope.$apply(function () {
				$scope.windows = winds;
	        });
	        // console.log('winds');
	        // console.log(winds);
		})
	})
	$scope.timeout = null;
	$scope.timer = function () {
	    // Clear the timeout if it has already been set.
	    // This will prevent the previous task from executing
	    // if it has been less than <MILLISECONDS>
	    clearTimeout($scope.timeout);

	    // Make a new timeout set to go off in 800ms
	    $scope.timeout = setTimeout(function () {
	        $scope.search();
	    }, 500);
	};
	$scope.search = function(){
		$scope.searched = false;		
		// if(!$scope.searchText){
		// 	$scope.windows = $scope.original;
		// }
		if(!$scope.searchText || $scope.searchText.length < 3 || $scope.waiting){
			$scope.windows = $scope.original;			
			return;
		}
		$scope.waiting = true;
		$http({
			url: searchURL,
			method: 'POST',
			data: {
				'text': $scope.searchText
			},
			headers:{
				authToken: $scope.token
			}
		}).success( function(data){
			$scope.waiting = false;
			console.log('searched');
			console.log(data.data)
			angular.forEach(data.data, (v,i)=>{
				data.data[i].users = [];
				data.data[i].users[0] = { _id: v._id, name : v.name, profilePicture: __appurl  + v.profilePicture };
				// data.data[i].messages = [];
				data.data[i].type = 'oneToOne'
				// data.data[i].messages[0] = {message: v.userName};
			})
			// $scope.searched = true;
			$scope.windows = data.data;
			// console.log(data.data);
			// $scope.text = '';
			// $scope.selected.messages.push(data.data);
		}).error( function(err, status){
			$scope.waiting = false;
			checkError(err, status);
		})
	}
	$scope.changeChat = function(ChatId, index){
		$scope.searchedSelected = false;		
		if($scope.searched){
		    $scope.searchedSelected = true;
		}
		$scope.selected = $scope.windows[index];
		$scope.index = index;
		setTimeout(function(){
			$(".messages").animate({ scrollTop: ($(document).height() + $scope.selected.messages.length*99) }, "slow");
		},0)
	}
	$scope.upload = function($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event){
		console.log($newFiles);
		$("#myModal").modal();
	}
	$scope.sendMessage = function(){
		if(!$scope.text || !$scope.selected || $scope.waiting){
			return;
		}
		$scope.waiting = true;				
		// console.log('$scope.selected.users[0]._id'+$scope.selected.users[0]._id);
		var data;
		data = {
			senderId: $scope.selected.users[0]._id,
			message: $scope.text,
			type: $scope.selected.type
		}
		$http({
			url: sendMess,
			method: 'POST',
			data: data,
			headers:{
				authToken: $scope.token
			}
		}).success( function(dataset){
			$scope.waiting = false;
			$scope.text = '';
			console.log(dataset.data);
			console.log('initial')
			if(dataset.data.window){
				console.log('dataset.data');
				console.log(dataset.data.window);
				console.log($scope.original);
				dataset.data.window.users[0].profilePicture = __appurl + dataset.data.window.users[0].profilePicture;
				dataset.data.window.done = true;
				var index = $scope.allWindows.indexOf(dataset.data.window._id);
				if(index == -1){
					$scope.allWindows.push(dataset.data.window._id);
					$scope.original.push(dataset.data.window);
					$scope.selected.messages.push(dataset.data.message);
				}				
				console.log('sent');
				// console.log($scope.selected);
				// console.log($scope.allWindows);
				// console.log($scope.windows);
				// console.log($scope.original);
			}else{
				var index = $scope.allWindows.indexOf(dataset.data.message.windowId);
				if(index != -1 && $scope.searched){
					$scope.original[index].messages.push(dataset.data.message);
				}
				$scope.selected.messages.push(dataset.data.message);
			}			
			setTimeout(function(){
			$(".messages").animate({ scrollTop: ($(document).height() + $scope.selected.messages.length*99) }, "slow");
		},0)
		}).error( function(err, status){
			$scope.waiting = false;
			checkError(err, status);
		})
	}
});