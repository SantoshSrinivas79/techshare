Meteor.startup(function () {
    smtp = {
        username: '',
        password: '',
        server: 'smtp.mailgun.com',
        port: 587 // also tried 465 to no avail
    };
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' +
        encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

    Mailer.init({
        templates: Templates,     // Global Templates namespace, see lib/templates.js.
        helpers: TemplateHelpers, // Global template helper namespace.
        layout: {
            name: 'emailLayout',
            path: 'layout.html'  // Relative to 'private' dir.

        }
    });
});

Mailer.config({
    from: 'noreply@techshare.io',
    plainTextOpts: {
        ignoreImage: true
    }
});
