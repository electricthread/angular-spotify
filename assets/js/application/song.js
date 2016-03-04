(function() {
  var app = angular.module('song', [ ]);

  app.directive('addSong', function() {
    return {
      restrict: 'E',
      templateUrl: 'add-song.html'
    };
  });

  app.controller('SongController', [ '$scope', function($scope) {
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