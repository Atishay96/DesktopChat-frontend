app.controller('ChatController',function($scope,$http){
	const {ipcRenderer} = electron;
	// ipcRenderer.on('userDetails', function(e, row){
 //    	$scope.token = row.authToken;
 //    	$scope.userId = row.userId;
	// })
	$scope.checkFlag = function(){
		if($scope.phoneNumber){
			$scope.flag = true;
		}else{
			$scope.flag = false;
		}
	}
	$scope.submit = function(){
		// console.log('submit');
		if($scope.signUpFlag){
			return $scope.signmeup();
		}
		if(!$scope.password && !$scope.phoneNumber){
			return;
		}
		if(!$scope.password){
			return $scope.checkPhoneNumber();
		}
		return $scope.login();
	}
	$scope.checkPhoneNumber = function(){
		if(!$scope.phoneNumber){
			return message('Please Enter the Phone Number');
		}
		$http({
            url: phoneNumber,
            method: 'POST',
            data:{
                'phoneNumber': $scope.phoneNumber
            }
        }).success(function(data, status){
	        if(status == 202){
	        	return $scope.signup();
	        	//handle sign up also
	        	// return message('please sign up');
	        }
        	message('please enter password');      
            $scope.flag = true;
            $("#inputPassword").animate()
        }).error(function(err, status){
            checkError(err, status);
        })
	}
	$scope.login = function(){
		if(!$scope.phoneNumber){
			return message('Please Enter the phone number');
		}
		if(!$scope.password){
			return message('Please Enter the password');
		}
		$http({
            url: login,
            method: 'POST',
            data:{
                phoneNumber: $scope.phoneNumber,
                password: $scope.password
            }
        }).success(function(data, status){
        	if(status == 202){
        		return $scope.signup();
	        	//handle sign up also
	        	// return message('please sign up');
	        }
	        // window.open('./chatScreen.html','_self')
	        window.location.href = 'chatScreen.html';
	        // console.log('success');
	        // console.log(data);
	        // storeToken(data.data.authToken);
	        // storeId(data.data._id);
	        ipcRenderer.send('storeToken', data.data.authToken, data.data._id);
	        //store his local creds in sql db;
	        //send him to chat screen;
        }).error(function(err, status){
            checkError(err, status);
        })
	}
	$scope.signup = function(){
		$("#countryCode").intlTelInput();
		var countryData = $.fn.intlTelInput.getCountryData();
		$scope.countryData = countryData.map((v,i)=>{
			return '+' + v.dialCode;
		})
		document.getElementById('card').style.marginTop ='2vh';
		$scope.signUpFlag = true;
	}
	$scope.signmeup = function(){
		if(!$scope.countryData.includes($scope.countryCode)){
			return message('Wrong Country code');
		}
		if(!$scope.countryCode || !$scope.phoneNumber || !$scope.password || !$scope.confirmPassword || !$scope.name || !$scope.email){
			return message('Please Enter all the details');
		}
		if(!$scope.profilePicture){
			return message('Please upload your profile picture');
		}
		if($scope.confirmPassword != $scope.password){
			return message('password didn\'t match');
		}
		$http({
            url: signup,
            method: 'POST',
            headers:{
                'Content-Type':undefined,
            },
            data:{
                phoneNumber: $scope.phoneNumber,
                password: $scope.password,
                name: $scope.name,
                email: $scope.email,
                countryCode: $scope.countryCode,
                profilePicture: $scope.profilePicture
            },
            transformRequest: function(data, headersGetter) {                
                var formData = new FormData();
                angular.forEach(data, function(value, key) {
                    formData.append(key, value);
                });
                var headers = headersGetter();
                delete headers['Content-Type'];
                return formData;
            }
        }).success(function(data, status){
	        console.log('success');
	        // window.open('./chatScreen.html')
	        // storeToken(data.data.authToken);
	        // storeId(data.data._id);
	        console.log(data.data.constructor);
	        console.log(data.data);
	        console.log(data.data.profilePicture);
	        console.log(data.data.authToken);
	        ipcRenderer.send('storeToken', data.data.authToken, data.data._id);
	        ipcRenderer.on('chatScreen', function(e, data){
	        	if(data.status == 200){
	        		window.location.href = 'chatScreen.html';
	        	}
	        })
	        //store his local creds in sql db;
	        //send him to chat screen;
        }).error(function(err, status){
            checkError(err, status);
        })
	}
});