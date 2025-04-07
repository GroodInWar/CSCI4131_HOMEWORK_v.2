$(function () {
    const $locations = $(".locations");
    const $pictures = $(".image-preview > img");
    const loc_dict = {
        "Walter Library B28": "walter.jpg",
        "Anderson Hall 350": "anderson.jpg",
        "Minneapolis RecWell": "recwell.jpg",
        "Home": "home.jpg",
        "Keller Hall 3-115": "keller.jpg",
        "164 E Broadway - Mall of America, Bloomington, MN 55425": "moa.jpg",
        "Online": "online.jpeg"
    };

    // Collect all locations
    const scheduleLocations = [];
    $locations.each(function() {
        scheduleLocations.push($(this).text().trim());
    });

    // Map locations to their corresponding image
    const scheduleImages = scheduleLocations.map(address => {
        const imgPath = loc_dict[address];
        return $(`.image-preview img[src="/img/${imgPath}"]`)[0];
    });

    let currentImageIndex = 0;

    // Display image at given index
    function showImage(index) {
        $pictures.hide();
        $(scheduleImages[index]).show();
        currentImageIndex = index;
    }

    // Default image
    showImage(0);

    // Next button click handler
    $(".next").click(function() {
        currentImageIndex = (currentImageIndex + 1) % scheduleImages.length;
        showImage(currentImageIndex);
    });

    // Previous button click handler
    $(".previous").click(function() {
        currentImageIndex = (currentImageIndex - 1 + scheduleImages.length) % scheduleImages.length;
        showImage(currentImageIndex);
    });

    // Handle location hover
    $locations.each(function(index) {
        const $location = $(this);
        const address = scheduleLocations[index];
        const imgPath = loc_dict[address];

        if (!imgPath) return;

        // Create thumbnail
        const $thumbnail = $("<img>", {
            class: "thumbnail",
            src: `/img/${imgPath}`,
            alt: address,
        }).hide();

        $location.hover(
            // Mouseenter: show thumbnail and update main image
            function() {
                $thumbnail.appendTo($location).show();
                showImage(index);
            },
            // Mouseleave: remove thumbnail
            function() {
                $thumbnail.hide().detach();
            }
        );
    });
});