(function(){
  var app = angular.module('spotify', ['song']);

  app.controller('UserController', [ '$http', function($http) {
    var user = this,
        mySpotifyUrl = 'https://api.spotify.com/v1/me',
        spotifyUrl = 'https://api.spotify.com/v1/users';

    // Login (new window)
    function login(callback) {
      var CLIENT_ID = 'ba2e53ebf4ec4ed2acce03ca66c83783',
          REDIRECT_URI = 'http://localhost:9000/callback.html';
      
      function getLoginURL(scopes) {
        return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
          '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
          '&scope=' + encodeURIComponent(scopes.join(' ')) +
          '&response_type=token';
      }
          
      var url = getLoginURL([]);
          
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
          
    } // end Login

    function getUser(accessToken) {
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
    }

  }]);

  app.controller('SongController', [ '$scope', function($scope) {
    var song = this;

    $scope.change = function() {
      console.log($scope);
    };

    // Get Playlists
    function getUserPlaylists(accessToken) {
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
    function addPlaylist(accessToken) {
      return $http({
        method: 'POST',
        url: spotifyUrl + '/' + user.id + '/playlists',
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
      
    // song.getPlaylists = function() {
    //   login(function(accessToken) {
    //     getUserPlaylists(accessToken);
    //   });
    // };

    song.getUser = function() {
      login(function(accessToken) {
        getUser(accessToken).then(function (argument) {
          // addPlaylist(accessToken)
          console.log(this.playlist);
        })
      });
    };

    song.addSong = function(song) {
      console.log(song);
    };

  }]);

})();