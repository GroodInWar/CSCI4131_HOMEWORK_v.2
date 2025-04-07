function updateClocks() {
    $(".clock-card").each(function() {
        const timeZone = $(this).data("timezone");
        const $analogClock = $(this).find(".analog-clock");
        const options = {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        // Get formatted time string
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const timeString = formatter.format(new Date());
        const [timePart, period] = timeString.split(' ');
        const [hours, minutes, seconds] = timePart.split(':').map(Number);

        // Calculate angles
        const secondsAngle = seconds * 6;
        const minutesAngle = (minutes * 6) + (seconds * 0.1);
        const hoursAngle = (hours % 12 * 30) + (minutes * 0.5);

        // Update hands
        $analogClock.find('.second').css('transform', `rotate(${secondsAngle}deg)`);
        $analogClock.find('.minute').css('transform', `rotate(${minutesAngle}deg)`);
        $analogClock.find('.hour').css('transform', `rotate(${hoursAngle}deg)`);
    });
}

$(function () {
    // Toggle Gist container
    $(".toggle-btn").click(function () {
        const $container = $(this).closest('.gistcontainer');
        $container.toggleClass('expanded');
        $container.find('.show-more').toggle(!$container.hasClass('expanded'));
        $container.find('.show-less').toggle($container.hasClass('expanded'));
    });

    // Initialize clocks
    setInterval(updateClocks, 1000);
    updateClocks();
});