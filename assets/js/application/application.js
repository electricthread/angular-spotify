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