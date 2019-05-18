(function($app) {
    angular.module('custom.controllers', []);

    // refresh token
    var  refreshToken = function(Notification, $http, success, err) {
        if(window.hostApp) {
            $http({
                method: 'GET',
                url: window.hostApp + 'auth/refresh'
            }).success(function (data, status, headers, config) {
                // Store data response on local storage
                console.log('revive :', new Date(data.expires));
                localStorage.setItem("_u", JSON.stringify(data));
                // Recussive
                setTimeout(function () {
                    $scope.refreshToken(Notification, $http, success, err);
                    // refres time
                }, (1800 * 1000));
                success();
            }).error(function () {
                err();
            });
        }else{
            Notification.error("HostApp is required to refresh token!");
        }
    };

    app.controller('LoginController', [
        '$scope',
        '$http',
        '$location',
        '$rootScope',
        '$window',
        '$state',
        '$translate',
        'Notification',
        '$ionicLoading',
        '$timeout',
        '$stateParams',
        '$ionicModal',
        function($scope, $http, $location, $rootScope, $window, $state, $translate, Notification, $ionicLoading, $timeout, $stateParams, $ionicModal) {

            app.registerEventsCronapi($scope, $translate,$ionicModal, $ionicLoading);
            $rootScope.http = $http;
            $scope.Notification = Notification;
            // save state params into scope
            $scope.params = $stateParams;

            // Query string params
            var queryStringParams = $location.search();
            for (var key in queryStringParams) {
              if (queryStringParams.hasOwnProperty(key)) {
                $scope.params[key] = queryStringParams[key];
              }
            }

            for(var x in app.userEvents)
                $scope[x]= app.userEvents[x].bind($scope);

            $scope.autoLogin = function(){
                if(localStorage.getItem('_u')){
                    refreshToken(Notification, $http, function(){
                        $state.go('app.home');
                    }, function(){
                        localStorage.removeItem('_u');
                    })
                }
            }
            $scope.autoLogin();

            $scope.user = { username : "" , password : "" };
            $scope.message = {};

            $scope.login = function() {
                $scope.message.error = undefined;

                if(window.hostApp) {
                    this.cronapi.screen.showLoading();
                    $http({
                        method : 'POST',
                        url : window.hostApp + 'auth',
                        data: $.param($scope.user),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(handleSuccess).error(handleError);

                }
                else {
                    Notification.error("HostApp is required!");
                }

            }

            $rootScope.infiniteReached = function() {
                //
            }

            function handleSuccess(data, status, headers, config) {
                // Store data response on session storage
                // The session storage will be cleaned when the browser window is closed
                if(typeof (Storage) !== "undefined") {
                    // save the user data on localStorage
                    localStorage.setItem('_u', JSON.stringify(data));
                }
                else {
                    // Sorry! No Web Storage support.
                    // The home page may not work if it depends
                    // on the logged user data
                }
                // Redirect to home page
                $state.go("app.home");

                $timeout(function() {
                    $ionicLoading.hide();
                },500);
            }

            function handleError(data, status, headers, config) {
                var error = status == 401 ? $translate.instant('Login.view.invalidPassword') : data;
                if (!error) {
                    error = $translate.instant('General.ErrorNotSpecified');
                }
                console.log(error);
                $ionicLoading.hide();
                Notification.error(error);
            }

            try {
                var contextAfterLoginController = $controller('AfterLoginController', { $scope: $scope });
                app.copyContext(contextAfterLoginController, this, 'AfterLoginController');
            } catch(e) {};
            try { if ($scope.blockly.events.afterLoginRender) $scope.blockly.events.afterLoginRender(); } catch(e) {};

        } ]);

    app.controller('HomeController', [
        '$scope',
        '$http',
        '$rootScope',
        '$state',
        '$timeout',
        '$translate',
        'Notification',
        '$ionicHistory',
        '$ionicModal',
        '$ionicLoading',
        '$stateParams',
        '$location',
        function($scope, $http, $rootScope, $state, $timeout, $translate, Notification, $ionicHistory, $ionicModal, $ionicLoading, $stateParams, $location) {

            app.registerEventsCronapi($scope, $translate,$ionicModal,$ionicLoading);
            $rootScope.http = $http;
            $scope.Notification = Notification;

            // save state params into scope
            $scope.params = $stateParams;

            // Query string params
            var queryStringParams = $location.search();
            for (var key in queryStringParams) {
                if (queryStringParams.hasOwnProperty(key)) {
                  $scope.params[key] = queryStringParams[key];
                }
              }

            for(var x in app.userEvents)
                $scope[x]= app.userEvents[x].bind($scope);

            // When access home page we have to check
            // if the user is authenticated and the userData
            // was saved on the browser's sessionStorage
            $rootScope.session = (localStorage._u) ? JSON.parse(localStorage._u) : null;

            if(!$rootScope.session) {

                if(!$scope.ignoreAuth){
                    if(typeof (Storage) !== "undefined") {
                        // save the user data on localStorage
                        sessionStorage.removeItem("_u");
                    }
                    $state.go("login");
                }
                // If there isn't a user registered on the sessionStorage
                // we must send back to login page
                // TODO - REVISAR login oauth2
            }else {
                if ($rootScope.session.token) refreshToken(Notification, $http, function(){},  $rootScope.logout);
            }

        } ]);

    app.controller('PublicController', function($controller, $scope) {
        $scope.ignoreAuth = true;
        angular.extend(this, $controller('HomeController', {
            $scope: $scope
        }));
    });

    app.controller('MenuController', [
        '$scope',
        '$http',
        '$rootScope',
        '$state',
        '$timeout',
        '$translate',
        'Notification',
        '$ionicHistory',
        '$ionicModal',
        '$ionicLoading',
        function($scope, $http, $rootScope, $state, $timeout, $translate, Notification, $ionicHistory, $ionicModal, $ionicLoading) {

            app.registerEventsCronapi($scope, $translate,$ionicModal,$ionicLoading);
            $rootScope.http = $http;
            $scope.Notification = Notification;
            $scope.folder= 'logged';

            for(var x in app.userEvents)
                $scope[x]= app.userEvents[x].bind($scope);

            if(!$scope.ignoreAuth){

                $ionicModal.fromTemplateUrl('views/logged/_changepassword.view.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $scope.modal = modal;
                });

                $scope.openChangePassword = function() {
                    if($scope.modal.modelEl){
                        $scope.modal.show();
                    }else{
                        $http({url:'views/logged/_changepassword.view.html'}).then(function(data){
                            $scope.modal = $ionicModal.fromTemplate($(data.data).last().text(), {
                                scope: $scope,
                                animation: 'slide-in-up'
                            });
                            $scope.modal.show();
                        });
                    }
                };

                $scope.closeChangePassword = function() {
                    $scope.modal.hide();
                };

                $scope.logout = function logout() {
                    $rootScope.session = null;
                    localStorage.removeItem("_u");
                    $state.go("login");
                }
            }


            $scope.http({
                method:'GET',
                url:'views/'+$scope.folder+'/menu.view.html'
            }).then(function onsuccess(response){
                if($(response.data).find("ion-nav-bar").length > 0){
                    $scope.isOldMenu = true;
                      if($(document).find("ion-header-bar").length > 0){
                        $(document).find("ion-nav-bar").show();
                      }
                }else{
                    $scope.isOldMenu = false;
                }
            });
        }]);

    app.controller('PublicMenuController', function($controller, $scope) {
        $scope.folder = 'public';
        angular.extend(this, $controller('MenuController', {
            $scope: $scope
        }));
    });

    app.controller('InitialController', [
        "$scope",
        "$stateParams",
        "$http",
        "Notification",
        "$location",
        "$rootScope",
        "$translate",
        "$ionicModal",
        "$ionicLoading",
        "$ionicPlatform",
        function($scope, $stateParams, $http, Notification, $location, $rootScope, $translate, $ionicModal, $ionicLoading,$ionicPlatform) {

            $ionicPlatform.registerBackButtonAction(function (event) {
                event.preventDefault();
                event.stopPropagation();
                navigator.app.exitApp();
            },101);


            app.registerEventsCronapi($scope, $translate, $ionicModal, $ionicLoading);
            $rootScope.http = $http;
            $scope.Notification = Notification;

            // save state params into scope
            $scope.params = $stateParams;
            $scope.$http = $http;

            $scope.blockly.js.blockly.auth.Home.change();

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
        function chatController($scope, $state,$ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicModal,$translate,$rootScope,$http,Notification ) {

            app.registerEventsCronapi($scope, $translate,$ionicModal,$ionicLoading);
            $rootScope.http = $http;
            $scope.Notification = Notification;
            for(var x in app.userEvents)
                $scope[x]= app.userEvents[x].bind($scope);

            var user = JSON.parse(localStorage._u).user.username;
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

    // General controller
    app.controller('PageController', [
        "$scope",
        "$stateParams",
        "Notification",
        "$location",
        "$http",
        "$rootScope",
        "$translate",
        "$ionicModal",
        "$ionicLoading",
        function($scope, $stateParams, Notification, $location, $http, $rootScope, $translate, $ionicModal, $ionicLoading) {

            app.registerEventsCronapi($scope, $translate,$ionicModal, $ionicLoading);
            $rootScope.http = $http;
            $scope.Notification = Notification;

            // save state params into scope
            $scope.params = $stateParams;
            $scope.$http = $http;
            $scope.listCanSwipe = true;

            // Query string params
            var queryStringParams = $location.search();
            for (var key in queryStringParams) {
                if (queryStringParams.hasOwnProperty(key)) {
                    $scope.params[key] = queryStringParams[key];
                }
            }

            $rootScope.session = (localStorage.getItem('_u') != undefined) ? JSON.parse(localStorage.getItem('_u')) : null;

            //Components personalization jquery
            $scope.registerComponentScripts = function() {
                //carousel slider
                $('.carousel-indicators li').on('click', function() {
                    var currentCarousel = '#' + $(this).parent().parent().parent().attr('id');
                    var index = $(currentCarousel + ' .carousel-indicators li').index(this);
                    $(currentCarousel + ' #carousel-example-generic').carousel(index);
                });
            }

            $scope.registerComponentScripts();

            if ($scope.isOldMenu) {
                var name = $scope.params.name ||'home';
                $scope.http({
                  method: 'GET',
                  url: 'views/logged/' + name + '.view.html'
                }).then(function onsuccess(response) {
                  if ($(response.data).find("ion-header-bar").length > 0) {
                    $(document).find("ion-nav-bar").hide();
                  }
                  else {
                    if ($(document).find("ion-header-bar").length > 0) {
                      $(document).find("ion-nav-bar").show();
                    }
                  }
                });
            }

            try {
                var contextAfterPageController = $controller('AfterPageController', { $scope: $scope });
                app.copyContext(contextAfterPageController, this, 'AfterPageController');
            } catch(e) {};
        }]);

    // General controller
    app.controller('InitialController', [
        "$scope",
        "$stateParams",
        "$http",
        "Notification",
        "$location",
        "$rootScope",
        "$translate",
        "$ionicModal",
        "$ionicLoading",
        "$ionicPlatform",
        function($scope, $stateParams, $http, Notification, $location, $rootScope, $translate, $ionicModal, $ionicLoading,$ionicPlatform) {

            $ionicPlatform.registerBackButtonAction(function (event) {
                event.preventDefault();
                event.stopPropagation();
                navigator.app.exitApp();
            },101);

            app.registerEventsCronapi($scope, $translate, $ionicModal, $ionicLoading);
            $rootScope.http = $http;
            $scope.Notification = Notification;

            // save state params into scope
            $scope.params = $stateParams;
            $scope.$http = $http;

            // Query string params
            var queryStringParams = $location.search();
            for (var key in queryStringParams) {
                if (queryStringParams.hasOwnProperty(key)) {
                    $scope.params[key] = queryStringParams[key];
                }
            }
            $scope.blockly.js.blockly.auth.Home.change();

        }]);

}(app));

window.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
        if (fn && (typeof(fn) === 'function')) {
            fn();
        }
    } else {
        this.$apply(fn);
    }
};
