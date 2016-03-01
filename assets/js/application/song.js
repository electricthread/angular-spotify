(function() {
  var app = angular.module('song', [ ]);

  app.directive('addSong', function() {
    return {
      restrict: 'E',
      templateUrl: 'add-song.html'
    };
  });

})();