(function() {

    // Some variables to use later
    var buttonContainer = document.querySelector('.download-button-container');
    var button = buttonContainer.querySelector('.download-button');
    var ball = buttonContainer.querySelector('.button-ball');
    var circularProgress = buttonContainer.querySelector('.button-circular-progress');
    var circularProgressLength = circularProgress.getTotalLength();
    var linearProgress = buttonContainer.querySelector('.button-linear-progress-bar');
    var borderPath = buttonContainer.querySelector('.border-path');
    var iconSquarePath = buttonContainer.querySelector('.button-icon-path-square');
    var iconLinePath = buttonContainer.querySelector('.button-icon-path-line');
    var circularProgressBar = new Segment(circularProgress, 0, 0);
    var iconSquare = new Segment(iconSquarePath, '30%', '70%');
    var iconLine = new Segment(iconLinePath, 0, '100%');
    var downloading = false;
    var completed = false;
    var progressTimer = 0;
    var testUri = "https://scontent-lga3-1.cdninstagram.com/vp/0594a770e588d329ff72059390800c82/5B055637/t51.2885-15/e35/27582036_296012250925511_5216403888852172800_n.jpg?dl=1";
    // Capture click events
    button.addEventListener('click', function () {
        if (!completed) { // Don't do anything if downloading has been completed
            if (downloading) { // If it's downloading, stop the download
                stopDownload();
            } else { // Start the download
                startDownload();
            }
        }
    });

    // Start the download
    function startDownload() {
        // Update variables and CSS classes
        downloading = true;
        buttonContainer.classList.add('downloading');
        animateIcon();
        // Update progress after 1s
        // progressTimer = setTimeout(function () {
        //     buttonContainer.classList.add('progressing');
        //     animateProgress();
        // }, 1000);

        downloadImage(testUri);
    }

    // Stop the download
    function stopDownload() {
        // Update variables and CSS classes
        downloading = false;
        clearTimeout(progressTimer);
        buttonContainer.classList.remove('downloading');
        buttonContainer.classList.remove('progressing');
        // Stop progress and draw icons back to initial state
        stopProgress();
        iconLine.draw(0, '100%', 1, {easing: anime.easings['easeOutCubic']});
        iconSquare.draw('30%', '70%', 1, {easing: anime.easings['easeOutQuad']});
    }

    function animateIcon() {
        iconLine.draw(0, 0, 0.5);
        iconSquare.draw(0, '100%', 1);
    }

    function stopProgress() {
        circularProgressBar.stop();
        circularProgressBar.draw(0, 0, 0);
        updateProgress(circularProgressBar, true);
    }

    // Update the circular and linear progress bars
    function updateProgress(instance, keepBallPosition) {
        if (!keepBallPosition) {
            var point = instance.path.getPointAtLength(instance.end);
            ball.style.transform = 'translate(' + point.x + 'px, ' + point.y + 'px)';
        }
        linearProgress.style.transform = 'translateY(-'+ instance.end * 100 / circularProgressLength +'%)';
    }

    // Progress animation
    function animateProgress(progress) {
        // Fake progress animation from 0 to 100%
        // This should be replaced with real progress data (real progress percent instead '100%'), and maybe called multiple times
        // circularProgressBar.draw(0, '100%', 2.5, {easing: anime.easings['easeInQuart'], update: updateProgress, callback: completedAnimation});

        // // Another example to see a different fake progress (uncomment this and comment line above)
        // circularProgressBar.draw(0, '40%', 1.5, {easing: anime.easings['easeInOutCubic'], update: updateProgress, callback: function () {
        //     circularProgressBar.draw(0, '60%', 1, {easing: anime.easings['easeInOutCubic'], update: updateProgress, callback: function () {
        //         circularProgressBar.draw(0, '100%', 1, {delay: 0.3, easing: anime.easings.easeCircleIn, update: updateProgress, callback: completedAnimation});
        //     }});
        // }});

        buttonContainer.classList.add('progressing');

        if (progress === '100%') {
            circularProgressBar.draw(0, '100%', 1, {delay: 0.3, easing: anime.easings.easeCircleIn, update: updateProgress, callback: completedAnimation});
            return;
        }

        circularProgressBar.draw(0, progress, 1.5, {easing: anime.easings['easeInOutCubic'], update: updateProgress, callback: function () {}});
    }

    // Animation performed when download has been completed
    function completedAnimation() {
        // Update variables and CSS classes
        completed = true;
        buttonContainer.classList.add('completed');
        // Wait 1s for the ball animation
        setTimeout(function () {
            button.classList.add('button-hidden');
            ball.classList.add('hidden');
            borderPath.classList.remove('hidden');
            // Morphing the path to the second shape
            var morph = anime({
                targets: borderPath,
                d: 'M 40 3.5 a 36.5 36.5 0 0 0 -36.5 36.5 a 36.5 36.5 0 0 0 10.5 26.5 C 35 86.5 90 91.5 120 91.5 S 205 86.5 226 66.5 a 36.5 36.5 0 0 0 10.5 -26.5 a 36.5 36.5 0 0 0 -36.5 -36.5 Z',
                duration: 100,
                easing: 'linear',
                complete: function () {
                    // Morphing the path back to the original shape with elasticity
                    morph = anime({
                        targets: borderPath,
                        d: 'M 40 3.5 a 36.5 36.5 0 0 0 -36.5 36.5 a 36.5 36.5 0 0 0 36.5 36.5 C 70 76.5 90 76.5 120 76.5 S 170 76.5 200 76.5 a 36.5 36.5 0 0 0 36.5 -36.5 a 36.5 36.5 0 0 0 -36.5 -36.5 Z',
                        duration: 1000,
                        elasticity: 600,
                        complete: function () {
                            // Update variables and CSS classes, and return the button to the original state
                            completed = false;
                            setTimeout(function () {
                                buttonContainer.classList.remove('completed');
                                button.classList.remove('button-hidden');
                                ball.classList.remove('hidden');
                                borderPath.classList.add('hidden');
                                stopDownload();
                            }, 500);
                        }
                    });
                }
            });
        }, 1000);
    }

    function downloadImage(uri) {
        var client = new XMLHttpRequest();
        client.open("GET", uri);
        client.onprogress = function (pe) {
            if(pe.lengthComputable) {
                animateProgress(Math.floor((pe.loaded / pe.total) * 100) + '%');
            }
        }
        client.onloadend = function (pe) {
            animateProgress('100%');
        }
        client.send();
    }

})();
