(function(){
  var app = angular.module('spotify', ['song']);

  app.controller('UserController', [ '$http', function($http) {
    var user = this,
        mySpotifyUrl = 'https://api.spotify.com/v1/me',
        spotifyUrl = 'https://api.spotify.com/v1/users';

    // Login (new window)
    user.login = function(callback) {
      var CLIENT_ID = 'ba2e53ebf4ec4ed2acce03ca66c83783',
          REDIRECT_URI = 'http://localhost:9000/callback.html';
      
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

      window.addEventListener("message", function(event) {
        var hash = JSON.parse(event.data);
        if (hash.type == 'access_token') {
          callback(hash.access_token);
        }
      }, false);
          
      var w = window.open(url,
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
       );
          
    }; // end Login

    user.getInfo = function(accessToken) {
      return $http({
        method: 'GET',
        url: mySpotifyUrl,
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }).then(function successCallback(response) {
          user.id = response.data.id;
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    };

    // Get Playlists
    user.getUserPlaylists = function(accessToken) {
      return $http({
        method: 'GET',
        url: mySpotifyUrl + '/playlists',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }).then(function successCallback(response) {
          user.playlists = response.data.items;
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
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
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    };

    // Add Song
    user.addSong = function(accessToken, playlist, song) {
      return $http({
        method: 'POST',
        url: spotifyUrl + '/' + user.id + '/playlists/' + playlist + '/tracks?uris=spotify%3Atrack%' + song,
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    };

  }]);

  app.controller('SongController', [ '$scope', function($scope) {
    var song = this;

    song.disabled = true;
    $scope.keyup = function() {
      song.disabled = false;
      // Todo - figure out why this doesn't work when field is empty
    };

    song.addToPlaylist = function(song, user, playlist) {
      user.login(function(accessToken) {
        user.getInfo(accessToken).then(function() {
          user.addPlaylist(accessToken, playlist).then(function() {
            user.addSong(accessToken, user.playlistID, song);
          });
        })
      });
    };

  }]);

})();