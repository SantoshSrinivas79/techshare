var services = Meteor.settings.private.oAuth;
var service;
for (service in services) {
    ServiceConfiguration.configurations.upsert(
        {service: service}, {
            $set: services[service]
        }
    );
}

var getUserEmailAddress = function (user) {
    var emails = user.emails,
        services = user.services;
    var service, current;
    if (emails) {
        return emails[0].address;
    }
    if (services) {
        for (service in services) {
            current = services[service];
            return current.email;
        }
    } else {
        return user.profile.name;
    }
};

function updateProfilePic(userId, profilePicUrl) {
    Meteor.users.update({
        _id: userId
    }, {
        $set: {
            "profile.pic": profilePicUrl
        }
    });
}

function getFBProfilePic(userId) {
    return "http://graph.facebook.com/" + userId + "/picture?type=square";
}

function getGithubProfilePic(accessToken) {
    var response = HTTP.get('https://api.github.com/user', {
        params: {
            access_token: accessToken
        },
        headers: {
            "User-Agent": "TechShare"
        }
    });
    return response.data.avatar_url;
}

Accounts.validateLoginAttempt(function (attempt) {
    if (attempt.type === "password") {
        if (!attempt.user.emails[0].verified) {
            Meteor.call('sendVerificationEmail', attempt.user._id, function () {
                logger.info('sendVerificationEmail called for user : [' + attempt.user._id + "]");
            });

            throw new Meteor.Error('email-not-verified', "Your account hasn't been verified yet. Sent email for verification.");
        }
    }
    return true;
});


var sendWelcomeEmail = function (email, username) {
    logger.info('Sending Welcome Email for ' + username);
    Meteor.call('sendEmail', email, "noreply@techshare.io", "Welcome to TechShare", username);
};

Accounts.onCreateUser(function (options, user) {
    logger.info("Creating user: options = [", options, "] user = [", user, "]");
    var service = _.keys(user.services)[0];

    if (options.profile) {
        user.profile = options.profile;
    }

    if (user.services.password) {
        user.profile.name = user.username;
        var gravatarUrl = Gravatar.imageUrl(user.emails[0].address, {secure: true});
        user.profile.pic = gravatarUrl;
    } else if (user.services.twitter) {
        user.profile.pic = user.services.twitter.profile_image_url;
    } else if (user.services.facebook) {
        user.profile.pic = getFBProfilePic(user.services.facebook.id);
    } else if (user.services.github) {
        if (!user.profile.name) {
            user.profile.name = user.services.github.username;
        }
        var accessToken = user.services.github.accessToken;
        user.profile.pic = getGithubProfilePic(accessToken);
    } else if (user.services.google) {
        user.profile.pic = user.services.google.picture;
    }

    var email = getUserEmailAddress(user);
    var existingUser = Meteor.users.findOne({"emails.address": email});

    if (existingUser) {
        logger.info('User already exists:' + existingUser._id);
        if (!existingUser.services) {
            existingUser.services = {};
        }
        existingUser.services[service] = user.services[service];
        Meteor.users.remove({_id: existingUser._id});
        user = existingUser;
    } else {
        logger.info('New user : [' + user._id + ']');
        if (email && email.indexOf('@') > -1) {
            user.emails = [{address: email, verified: true}];
            sendWelcomeEmail(email, user.profile.name);
        } else {
            logger.info('Valid email not found for new user: ' + user);
        }
    }
    return user;
});

Accounts.onLogin(function (loginInfo) {
    var user = loginInfo.user;
    logger.info("login: [" + user._id + "], " + user.slug + ", loginType = " + loginInfo.type);
    if (loginInfo.type === "password") {
        var gravatarUrl = Gravatar.imageUrl(Meteor.user().emails[0].address, {secure: true});
        updateProfilePic(user._id, gravatarUrl);
    } else if (loginInfo.type === "twitter") {
        updateProfilePic(user._id, user.services.twitter.profile_image_url);
    } else if (loginInfo.type === "facebook") {
        updateProfilePic(user._id, getFBProfilePic(user.services.facebook.id));
    } else if (loginInfo.type === "github") {
        var accessToken = user.services.github.accessToken;
        updateProfilePic(user._id, getGithubProfilePic(accessToken));
    }
});

Accounts.validateNewUser(function (user) {
    if (user.services.password) {
        if (isEmpty(user.username) || user.username.length < 3) {
            logger.error("Username less than 3 characters: " + user);
            throw new Meteor.Error(403, 'Username must be at least 3 characters long');
        }

        if (isEmpty(user.emails[0].address)) {
            logger.error("Email not provided: " + user);
            throw new Meteor.Error(403, 'Please provide an email address');
        }
    }
    return true;
});

Meteor.startup(function () {
    Accounts.config({
        sendVerificationEmail: true
    });
    Accounts.emailTemplates.siteName = "TechShare";
    Accounts.emailTemplates.from = "noreply@techshare.io";

    Accounts.emailTemplates.resetPassword.subject = function (user) {
        return "Reset password";
    };
    Accounts.emailTemplates.resetPassword.html = function (html, url) {
        var token = url.substring(url.lastIndexOf('/') + 1, url.length);
        var newUrl = Meteor.absoluteUrl('reset-password/' + token);
        return "<div style='text-align:center'>" +
            "<p>You requested to reset the password for your TechShare account</p>" +
            "<p>Please click this button to reset your password</p>" +
            "<p><a style='display:inline-block;background-color:#286090;color:white;padding:10px;border-radius:5px;" +
            "font-size:15px;text-decoration:none' href='" + newUrl + "'>Reset Password</a></p>" +
            "</div>";
    };

    Accounts.emailTemplates.verifyEmail.html = function (html, url) {
        var token = url.substring(url.lastIndexOf('/') + 1, url.length);
        var newUrl = Meteor.absoluteUrl('verify-email/' + token);
        return "<div style='text-align:center'>" +
            "<p>Thank you for signing up with TechShare</p>" +
            "<p>Please click this button to verify your email address</p>" +
            "<p><a style='display:inline-block;background-color:#286090;color:white;padding:10px;border-radius:5px;" +
            "font-size:15px;text-decoration:none' href='" + newUrl + "'>Verify Email</a></p>" +
            "</div>";
    };
});
