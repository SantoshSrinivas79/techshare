var showResetPasswordError = function (message) {
    Session.set('resetPassError', message);
};

Template.resetPassword.events({
    "click #reset-password-button": function (evt, template) {
        evt.preventDefault();
        var newPassword = template.$('[name="new-password"]').val();
        var confirmNewPassword = template.$('[name="confirm-new-password"]').val();
        if (isEmpty(newPassword)) {
            showResetPasswordError("Please provide a password.");
            return;
        }

        if (isEmpty(confirmNewPassword)) {
            showResetPasswordError("Please type the password again to confirm.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showResetPasswordError("Passwords don't match. Please try again");
            return;
        }

        var token = Router.current().params._token;
        Accounts.resetPassword(token, newPassword, function (error) {
            if (error) {
                if (error.reason === "Token expired") {
                    showResetPasswordError("Sorry, the link that you clicked has expired");
                } else {
                    showResetPasswordError("Sorry, something went wrong while resetting your password");
                }
            } else {
                Router.go('/');
            }
        });
    }
});

Template.resetPassword.helpers({
    resetPassError: function () {
        return Session.get('resetPassError');
    }
});