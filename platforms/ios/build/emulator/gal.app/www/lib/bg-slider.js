console.log('background init.');

var v = angular.element('#home');

var vH = angular.element(window).height();

v.css('height',vH);

v.vegas({
  delay: 7000,
    timer: false,
    shuffle: true,
    transition: [ 'fade', 'fade2', 'swirlLeft', 'swirlRight' ],
    transitionDuration: 3000,
    slides: [
        { src: "img/bg/01.jpg" },
        { src: "img/bg/02.jpg" },
        { src: "img/bg/03.jpg" }
    ],
    overlay: true
});
