(function() {
  var search = angular.module('search', [ ]).config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from our assets domain.  Notice the difference between * and **.
      'https://embed.spotify.com/**'
    ]);
  });;

  search.controller('SearchController', ['$http','$scope','$sce', function ($http, $scope, $sce) {
    $scope.results = [];

    this.SongSearch = function(song) {
      var encodedSong = encodeURIComponent(song);

      return $http({
        method: 'GET',
        url: 'https://api.spotify.com/v1/search?q=' + encodedSong + '&type=track'
      }).then(function successCallback(response) {
          $scope.iframeURL = 'https://embed.spotify.com/?uri=spotify%3Atrack%3A';
          $scope.results = response.data.tracks.items;
        }, function errorCallback(response) {
          console.log(response);
        });
    };

  }]);

})();