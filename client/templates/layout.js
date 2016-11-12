Template.layout.events({
    "hidden.bs.modal #loginModal": function () {
        Session.set("loginError", false);
        Session.set("showSignup", false);
        $('#login-username').val('');
        $('#login-password').val('');
        $('#create-user-username').val('');
        $('#create-user-email').val('');
        $('#create-user-password').val('');
        $('#create-user-password-confirm').val('');
    },
    "show.bs.modal #submitModal": function () {
        setTimeout(function () {
            $('[name="inputLink"]').focus();
        }, 500);
    }
});

Template.layout.helpers({
    errorMessage: function () {
        return Session.get('internalError');
    }
});

