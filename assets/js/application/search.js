(function() {
  var search = angular.module('search', [ ]).config(function($sceDelegateProvider) {
    // Whitelist the following domains for the iframe src
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'https://embed.spotify.com/**'
    ]);
  });;

  search.controller('SearchController', ['$http','$scope','$sce', function ($http, $scope, $sce) {
    $scope.results = [];
    $scope.offset = 0;

    this.SongSearch = function(song) {
      var encodedSong = encodeURIComponent(song);

      return $http({
        method: 'GET',
        url: 'https://api.spotify.com/v1/search?q=' + encodedSong + '&type=track&limit=5'
      }).then(function successCallback(response) {
          var items = response.data.tracks.items;
          $scope.iframeURL = 'https://embed.spotify.com/?uri=spotify%3Atrack%3A';
          $scope.results = items;
          console.log(response);
          if (response.data.tracks.total > items.length) {
            $scope.loadMore = true;
            $scope.offset = 5;
          }
        }, function errorCallback(response) {
          console.log(response);
        });
    };

    this.MoreSongs = function(song) {
      var encodedSong = encodeURIComponent(song);
      var offset = $scope.offset + 5;

      return $http({
        method: 'GET',
        url: 'https://api.spotify.com/v1/search?q=' + encodedSong + '&type=track&limit=5&offset=' + offset
      }).then(function successCallback(response) {
          var items = response.data.tracks.items;
          $scope.iframeURL = 'https://embed.spotify.com/?uri=spotify%3Atrack%3A';
          $scope.results.push.apply($scope.results, items);
          $scope.offset = offset;
        }, function errorCallback(response) {
          console.log(response);
        });
    };

  }]);

})();