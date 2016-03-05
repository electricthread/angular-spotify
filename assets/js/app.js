(function () {
  "use strict";

  var app = angular.module('spotify', ['song', 'search']);

  app.controller('UserController', ['$http', function ($http) {
    var user = this,
        spotifyUrl = 'https://api.spotify.com/v1/users',
        mySpotifyUrl = 'https://api.spotify.com/v1/me';

    // Login (new window)
    user.login = function (callback) {
      var CLIENT_ID = 'ba2e53ebf4ec4ed2acce03ca66c83783';
      if (location.hostname === "localhost") {
        var REDIRECT_URI = window.location.href + 'callback.html';
      } else {
        var REDIRECT_URI = window.location.href + 'callback';
      }
          

      function getLoginURL(scopes) {
        return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
          '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
          '&scope=' + encodeURIComponent(scopes.join(' ')) +
          '&response_type=token';
      }

      var url = getLoginURL(['playlist-modify-public']);
          
      var width = 450,
          height = 730,
          left = (screen.width / 2) - (width / 2),
          top = (screen.height / 2) - (height / 2);

      window.addEventListener("message", function (event) {
        var hash = JSON.parse(event.data);
        if (hash.type == 'access_token') {
          callback(hash.access_token);
          user.token = hash.access_token;
        }
      }, false);
          
      var w = window.open(url,
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
       );

    }; // end Login

    user.getInfo = function (accessToken) {
      return $http({
        method: 'GET',
        url: mySpotifyUrl,
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }).then(function successCallback(response) {
          user.id = response.data.id;
        }, function errorCallback(response) {
          console.log(response);
        });
    };

    // Get Playlists
    user.getPlaylists = function(accessToken) {
      return $http({
        method: 'GET',
        url: mySpotifyUrl + '/playlists',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }).then(function successCallback(response) {
          user.playlists = response.data.items;
        }, function errorCallback(response) {
          console.log(response);
        });
    }

    // Add Playlist
    user.addPlaylist = function(accessToken, playlist) {
      return $http({
        method: 'POST',
        url: spotifyUrl + '/' + user.id + '/playlists',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        data: {
          'name': playlist
        }
      }).then(function successCallback(response) {
          user.playlistID = response.data.id;
        }, function errorCallback(response) {
          console.log(response);
        });
    };

    // Add Song
    user.addSong = function(accessToken, playlist, track) {
      return $http({
        method: 'POST',
        url: spotifyUrl + '/' + user.id + '/playlists/' + playlist + '/tracks?uris=spotify%3Atrack%3A' + track,
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        }, function errorCallback(response) {
          console.log(response);
        });
    };

  }]);

})();
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
          if (items.length = 5) {
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
          // console.log($scope.results);
        }, function errorCallback(response) {
          console.log(response);
        });
    };

  }]);

})();
(function() {
  var song = angular.module('song', [ ]);

  song.directive('addSong', function() {
    return {
      restrict: 'E',
      templateUrl: 'add-song.html'
    };
  });

  song.controller('SongController', [ '$scope', function($scope) {
    var song = this;

    song.disabled = true;
    $scope.keyup = function() {
      song.disabled = false;
      // TODO - figure out why this doesn't work when field is empty
    };

    getUserAddSong = function(track, user, playlist, accessToken) {
      user.getInfo(accessToken).then(function() {
        user.getPlaylists(accessToken).then(function() {
          var playlistnames = [];
          // add playlist names to array
          user.playlists.forEach(function(item) {
            playlistnames.push(item.name);
          });
          // If playlist exists, add song
          if (playlistnames.indexOf(playlist) >= 0) {
            var oldPlaylist = user.playlists[playlistnames.indexOf(playlist)].id;
            user.addSong(accessToken, oldPlaylist, track);
          }
          // Otherwise create playlist, add song
          else {
            user.addPlaylist(accessToken, playlist).then(function() {
              user.addSong(accessToken, user.playlistID, track);
            });
          }
        });
      });
    };

    song.addToPlaylist = function(track, user, playlist, $event) {
      $event.target.innerText = 'Added!';
      $event.target.disabled = true;
      // If user is not authenticated
      if (typeof user.token === 'undefined') {
        user.login(function(accessToken) {
          getUserAddSong(track, user, playlist, accessToken);
        });
      }
      // User has already authenticated
      else {
        getUserAddSong(track, user, playlist, user.token);
      }
    };

  }]);

})();