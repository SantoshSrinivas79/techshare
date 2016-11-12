/**
 * Created by vaibhav1 on 3/28/16.
 */
Template.verifyEmail.onCreated(function () {
    var token = Router.current().params.token;
    Accounts.verifyEmail(token, function (error) {
        if(error) {
            showTopLevelError("An unknown error error occurred.");
            return;
        }
        Router.go('/');
    });
});