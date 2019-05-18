/*
To add your route in the angular, uncomment the code and use this structure
*/
// window.customStateProvider = function($stateProvider) {
// $stateProvider
//
// .state('login', {
//   url: "",
//   cache: false,
//   controller: 'LoginController',
//   templateUrl: 'views/login.view.html'
// })
//
// .state('main', {
//   url: "/",
//   cache: false,
//   controller: 'LoginController',
//   templateUrl: 'views/login.view.html'
// })
//
// .state('publicRoot', {
//   url: "/public/{name:.*}",
//   cache: false,
//   controller: 'PageController',
//   templateUrl: function (urlattr) {
//     return 'views/public/' + urlattr.name + '.view.html';
//   }
// })
//
// .state('public', {
//   url: "/app/public",
//   cache: false,
//   controller: 'PublicController',
//   templateUrl: 'views/public/menu.view.html'
// })
//
// .state('public.home', {
//   url: "/home",
//   cache: false,
//   views: {
//     'menuContent': {
//       controller: 'PublicController',
//       templateUrl: 'views/public/home.view.html'
//     }
//   }
// })
// .state('public.pages', {
//   url: "/{name:.*}",
//   cache: false,
//   views: {
//     'menuContent': {
//       controller: 'PageController',
//       templateUrl: function (urlattr) {
//         return 'views/public/' + urlattr.name + '.view.html';
//       }
//     }
//   }
// })
//
// .state('app', {
//   url: "/app",
//   cache: false,
//   controller: 'HomeController',
//   templateUrl: 'plugins/cronapp-framework-mobile-js/dist/components/templates/menu.template.html'
// })
//
// .state('app.home', {
//   url: "/home",
//   cache: false,
//   views: {
//     'menuContent': {
//       controller: 'HomeController',
//       templateUrl: 'views/logged/home.view.html'
//     }
//   }
// })
//
// .state('app.pages', {
//   url: "/{name:.*}",
//   cache: false,
//   views: {
//     'menuContent': {
//       controller: 'PageController',
//       templateUrl: function (urlattr) {
//         return 'views/' + urlattr.name + '.view.html';
//       }
//     }
//   }
// })
//
// .state('404', {
//   url: "/error/404",
//   cache: false,
//   controller: 'PageController',
//   templateUrl: function (urlattr) {
//     return 'views/error/404.view.html';
//   }
// })
//
// .state('403', {
//   url: "/error/403",
//   cache: false,
//   controller: 'PageController',
//   templateUrl: function (urlattr) {
//     return 'views/error/403.view.html';
//   }
// });