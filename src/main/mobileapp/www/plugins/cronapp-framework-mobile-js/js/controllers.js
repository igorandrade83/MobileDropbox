(function ($app) {
    angular.module('custom.controllers', []);
    
    app.controller('HomeController', ['$scope', '$http', '$rootScope', '$state', '$translate', 'Notification','$ionicModal', function ($scope, $http, $rootScope, $state, $translate, Notification, $ionicModal) {
      $rootScope.http = $http;
	    app.registerEventsCronapi($scope, $translate,$ionicModal);
      $scope.Notification = Notification;

      for(var x in app.userEvents)
          $scope[x]= app.userEvents[x].bind($scope);
        $scope.message = {};

		try {
			var contextAfterHomeController = $controller('AfterHomeController', { $scope: $scope });
			app.copyContext(contextAfterHomeController, this, 'AfterHomeController');
		} catch(e) {};
		try { if ($scope.blockly.events.afterHomeRender) $scope.blockly.events.afterHomeRender(); } catch(e) {};

    }]);
	
app.controller('chatController', [
	   '$scope',
	   '$state',
		'$ionicPopup',
		'$ionicScrollDelegate',
		'$timeout',
		'$interval',
		'$ionicModal',
		'$translate',
		'$rootScope',
		'$http',
		'Notification',
	function chatController($scope, $state,$ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicModal,$translate,$rootScope,$http, Notification) {
      
    app.registerEventsCronapi($scope, $translate);
    $rootScope.http = $http;
    $scope.Notification = Notification;
    for(var x in app.userEvents)
      $scope[x]= app.userEvents[x].bind($scope);

		var user = JSON.parse(sessionStorage._u).user.username;
		var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
		var footerBar; // gets set in $ionicView.enter
		var scroller;
		var txtInput; // ^^^
		$scope.enter =  function () {
			$timeout(function () {
				footerBar = document.body.querySelector('.homeView .bar-footer');
				scroller = document.body.querySelector('.homeView .scroll-content');
				txtInput = angular.element(footerBar.querySelector('textarea'));
			}, 0);
		};
	  $scope.isEnter = function(e){
	    (e.keyCode == 13) ?  $timeout(function(){
	      e.stopPropagation();
	      $('#sendButton').trigger('click') 
	      },0): null;
	  }
		$scope.refreshScroll = function (scrollBottom, timeout) {
			$timeout(function () {
				scrollBottom = scrollBottom || $scope.scrollDown;
				viewScroll.resize();
				if (scrollBottom) {
					viewScroll.scrollBottom(true);
				}
				$scope.checkScroll();
			}, timeout || 1000);
		};
		$scope.scrollDown = true;
		$scope.checkScroll = function () {
			$timeout(function () {
				var currentTop = viewScroll.getScrollPosition().top;
				var maxScrollableDistanceFromTop = viewScroll.getScrollView().__maxScrollTop;
				$scope.scrollDown = (currentTop >= maxScrollableDistanceFromTop);
				$scope.$apply();
			}, 0);
			return true;
		};
	}
	  ]);	  
} (app));