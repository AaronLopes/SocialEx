angular.module('starter.controllers-submit', [])

/**
 * Submit
 */
.controller('SubmitCtrl', function($scope, $state, 
    $ionicActionSheet, $ionicSlideBoxDelegate, $ionicHistory, 
    Profile, Auth, Codes, Utils, CordovaCamera, Timeline) {
  
  $scope.$on('$ionicView.enter', function(e) {
    initData();
    loadProfileData();
  });
  
  // Form
  // ---------------
  function initData() {
    $scope.FormData = {
        meta: {
            text: "",
            location: "",
        },
        uid: Auth.AuthData.uid,
        timestamp_create: Firebase.ServerValue.TIMESTAMP
    };
    $scope.FormImages = [];
    $scope.AuthData = Auth.AuthData;
  };
  
  // Profile data
  // ---------------
  function loadProfileData(){
    // check if in cash
    if(Profile.ProfileData.hasOwnProperty('meta')){
        $scope.ProfileData = Profile.ProfileData;
    } else {
        // otherwise load (note: AuthData.uid is resolved)
        Profile.get(Auth.AuthData.uid).then(
            function(ProfileData){
                console.log(ProfileData);
                $scope.ProfileData = ProfileData;
            },
            function(error){
                console.log(error);
                $scope.ProfileData = {};
                Utils.showMessage('Oops... profile data not loaded', 1500)
            }
        );
    };
  };
  
  // Add GPS location
  // ---------------
  
  $scope.addImage = function() {
    // Show the action sheet
    $ionicActionSheet.show({
        buttons: [
            { text: 'Take a new picture' },
            { text: 'Import from phone library' },
        ],
        titleText: 'Add an image to your post',
        cancelText: 'Cancel',
        cancel: function() {
            // add cancel code..
        },
        buttonClicked: function(sourceTypeIndex) {
            proceed(sourceTypeIndex)
            return true;
        }
    });
    function proceed(sourceTypeIndex) {
      CordovaCamera.newImage(sourceTypeIndex, 800).then(
        function(ImageData){
            if(ImageData != null) {
                $scope.FormImages.push(ImageData);
                $ionicSlideBoxDelegate.update();
            }
        }
      );
    };
  };
  
  $scope.removeImage = function(index) {
    $scope.FormImages.splice(index, 1);
    $ionicSlideBoxDelegate.slide(0);
    $ionicSlideBoxDelegate.update();
  };
  
  $scope.slideHasChanged = function () {
    $ionicSlideBoxDelegate.update();
  };
  
  // Submit
  // ----------------
  $scope.submitPost = function() {
    if($scope.returnCount()>=0){
      Timeline.addPost($scope.AuthData.uid, $scope.FormData, $scope.FormImages).then(
        function(success){
          $state.go('tab.timeline');
          initData();
        })
    } else {
      Codes.handleError({code: "POST_NEW_CHAR_EXCEEDED"})
    }
  };
  
  // Add location
  // ---------------
  $scope.addLocation = function() {
    // coming up
  };
  
  
  // Other
  // ---------------
  
  $scope.close = function() {
    $state.go('tab.timeline');
  };
  
  $scope.returnCount = function() {
    if($scope.FormData){
      return POST_MAX_CHAR - $scope.FormData.meta.text.length;
    }
  };
  
})

