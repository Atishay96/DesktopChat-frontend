angular.module('imageZoomApp',[]);

angular
  .module('imageZoomApp')
  .directive('zoom', function(){
    function link(scope, element, attrs){
      var $ = angular.element;
      var original = $(element[0].querySelector('.original'));
      var originalImg = original.find('img');
      var zoomed = $(element[0].querySelector('.zoomed'));
      var zoomedImg = zoomed.find('img');

      var mark = $('<div></div>')
        .addClass('mark')
        .css('position', 'absolute')
        .css('height', scope.markHeight +'px')
        .css('width', scope.markWidth +'px')

      $(element).append(mark);

      element
        .on('mouseenter', function(evt){
          mark.removeClass('hide');

          var offset = calculateOffset(evt);
          moveMark(offset.X, offset.Y);
        })
        .on('mouseleave', function(evt){
          mark.addClass('hide');
        })
        .on('mousemove', function(evt){
          var offset = calculateOffset(evt);
          moveMark(offset.X, offset.Y);
        });

      scope.$on('mark:moved', function(event, data){
        updateZoomed.apply(this, data);
      });

      function moveMark(offsetX, offsetY){
        var dx = scope.markWidth, 
            dy = scope.markHeight, 
            x = offsetX - dx/2, 
            y = offsetY - dy/2;

        mark
          .css('left', x + 'px')
          .css('top',  y + 'px');

        scope.$broadcast('mark:moved', [
          x, y, dx, dy, originalImg[0].height, originalImg[0].width
        ]);
      }

      function updateZoomed(originalX, originalY, originalDx, originalDy, originalHeight, originalWidth){
        var zoomLvl = scope.zoomLvl;
        scope.$apply(function(){
          zoomed
            .css('height', zoomLvl*originalDy+'px')
            .css('width', zoomLvl*originalDx+'px');
          zoomedImg
            .attr('src', scope.src)
            .css('height', zoomLvl*originalHeight+'px')
            .css('width', zoomLvl*originalWidth+'px')
            .css('left',-zoomLvl*originalX +'px')
            .css('top',-zoomLvl*originalY +'px');
        });
      }

      var rect;
      function calculateOffset(mouseEvent){
        rect = rect || mouseEvent.target.getBoundingClientRect();
        var offsetX = mouseEvent.clientX - rect.left;
        var offsetY = mouseEvent.clientY - rect.top;  

        return { 
          X: offsetX, 
          Y: offsetY
        }
      }

      attrs.$observe('ngSrc', function(data) {
        scope.src = attrs.ngSrc;
      }, true);


      attrs.$observe('zoomLvl', function(data) {
        scope.zoomLvl =  data;;
      }, true);
    }

    return {
      restrict: 'EA',
      scope: {
        markHeight: '@markHeight',
        markWidth: '@markWidth',
        src: '@src', 
        zoomLvl: "@zoomLvl"
      },
      template: [
        '<div class="original">',
          '<img ng-src="{{src}}"/>',
        '</div>',
        '<div class="zoomed">',
          '<img/>',
        '</div>'
      ].join(''),
      link: link
    };
  });

angular
  .module('imageZoomApp')
  .controller('ImageZoomController', ['$sce', function($sce){
    this.zoomLvl = 4;

    this.images = [{
      name: "Duck.jpg",
      url: './img/duck.jpg'
    },{
      name: "Moon.jpg",
      url: "./img/moon.jpg"
    }];

    this.addImage = function(){
      this.url = $sce.trustAsResourceUrl(this.url);
      
      this.images.push({
        name: this.name,
        url: this.url
      });

      this.name = '';
      this.url = '';
    }
  }]);
