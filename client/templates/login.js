function showLoginError(errorMessage) {
    Session.set('loginError', errorMessage);
}

Template.login.helpers({
    showSignup: function () {
        return Session.get('showSignup');
    },
    isLoginServicesConfigured: function () {
        return Accounts.loginServicesConfigured();
    },
    loginError: function () {
        return Session.get('loginError');
    },
    operationInProgress: function () {
        return Meteor.loggingIn() || Session.get('forgotPassword') ||
            Session.get('signingUp');
    }
});

Template.login.events({
    "click #goto-signup": function () {
        Session.set('showSignup', true);
        Session.set('loginError', "");
        setTimeout(function () {
            $('#create-user-username').focus();
        }, 500);
    },
    "click #goto-login": function () {
        Session.set('showSignup', false);
        Session.set('loginError', "");
    },
    "submit form": function (evt) {
        evt.preventDefault();
    },
    "click #loginButton": function () {
        var user = {
            email: $('#login-username').val().trim(),
            password: $('#login-password').val().trim()
        };

        if (isEmpty(user.email)) {
            Session.set('loginError', "Please provide email");
            return;
        }

        if (isEmpty(user.password)) {
            Session.set('loginError', "Please provide password");
            return;
        }

        Meteor.loginWithPassword(user.email, user.password, function (error) {
            if (error) {
                Session.set('loginError', error.reason);
            }
        });
    },
    "click [data-action='github-login']": function (evt) {
        evt.preventDefault();
        Meteor.loginWithGithub({requestPermissions: ['user:email']}, function (err) {
            if (err) {
                showTopLevelError("An error occurred while logging in. Please retry")
            } else {
                $("#loginModal").modal("hide");
            }
        });
    },
    "click [data-action='google-login']": function (evt) {
        evt.preventDefault();
        Meteor.loginWithGoogle({requestPermissions: ['email']}, function (err) {
            if (err) {
                showTopLevelError("An error occurred while logging in. Please retry");
            } else {
                $("#loginModal").modal("hide");
            }
        });
    },
    "click [data-action='twitter-login']": function (evt) {
        evt.preventDefault();
        Meteor.loginWithTwitter({}, function (err) {
            if (err) {
                showTopLevelError("An error occurred while logging in. Please retry");
            } else {
                $("#loginModal").modal("hide");
            }
        });
    },
    "click [data-action='facebook-login']": function (evt) {
        evt.preventDefault();
        Meteor.loginWithFacebook({requestPermissions: ['email']}, function (err) {
            if (err) {
                showTopLevelError("An error occurred while logging in. Please retry");
            } else {
                $("#loginModal").modal("hide");
            }
        });
    },
    "click #signupButton": function () {
        var user = {
            username: $('#create-user-username').val().trim(),
            email: $('#create-user-email').val().trim(),
            password: $('#create-user-password').val().trim(),
            confirmPassword: $('#create-user-password-confirm').val().trim()
        };

        if (isEmpty(user.username)) {
            showLoginError("Please provide Username");
            return;
        }

        if (isEmpty(user.email)) {
            showLoginError("Please provide Email");
            return;
        }

        if (isEmpty(user.password)) {
            showLoginError("Please provide Password");
            return;
        }

        if (isEmpty(user.confirmPassword)) {
            showLoginError("Please Confirm Password");
            return;
        }

        if (user.password !== user.confirmPassword) {
            showLoginError("Passwords don't match");
            return;
        }

        Session.set('signingUp', true);
        Meteor.call('registerUser', user, function (error) {
            Session.set('signingUp', false);
            if (error) {
                showLoginError(error.reason);
                return;
            }
            showLoginError('Sent email for verification');
        });
    },
    "click #forgot-password": function (evt) {
        evt.preventDefault();
        var email = $('#login-username').val().trim();
        if (isEmpty(email)) {
            showLoginError('Please enter Email and then click "Forgot Password"');
            return;
        }

        Session.set('forgotPassword', true);

        Accounts.forgotPassword({email: email}, function (error) {
            Session.set('forgotPassword', false);
            if (error) {
                if (error.reason === "User not found") {
                    showLoginError("No user found with email address " + email);
                } else {
                    showLoginError("Oops. Something went wrong. Please retry.");
                }
            } else {
                showLoginError("Instructions for resetting password have been sent to " + email);
            }
        });

    }
});

