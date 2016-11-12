Template.registerHelper('timediff', function (inputDate) {

    var currentDate = new Date(),
        diffInMs = currentDate.getTime() - inputDate.getTime(),
        diffInSec = diffInMs / 1000;

    if (diffInSec < 60) {
        return "few seconds ago";
    }

    var diffInMinutes = Math.floor(diffInSec / 60);
    if (diffInMinutes < 60) {
        return diffInMinutes + " minutes ago";
    }

    var diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return diffInHours + " hours ago";
    }

    var diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
        return "Yesterday";
    }
    if (diffInDays < 7) {
        return diffInDays + " days ago";
    }

    var diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return diffInWeeks + " weeks ago";
    }

    var monthNames = ["Jan", "Feb", "March", "April", "May", "June",
        "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var date = inputDate.getDate(),
        month = monthNames[inputDate.getMonth()],
        year = inputDate.getFullYear();
    return month + " " + date + ", " + year;
});

Template.registerHelper('encode', function (text) {
    return encodeURIComponent(text);
});

showTopLevelError = function (errorMsg) {
    var errorBox = $('<div></div>').attr('id', 'internal-error').addClass('alert').addClass('alert-danger');
    $('<a></a>').addClass('close').attr('data-dismiss', "alert").attr('aria-label', 'close').html('&times;').appendTo(errorBox);
    $('<span>' + errorMsg + '</span>').appendTo(errorBox);
    errorBox.appendTo($('body'));
};

extractDomain = function (url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
};
