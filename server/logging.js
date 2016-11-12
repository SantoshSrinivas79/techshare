/**
 * Created by vaibhav1 on 6/7/16.
 */
var consoleOptions = {
    colorize: true,
    level: 'debug',
    levels : {debug: 0, info : 1, warn: 2, error: 3},
    colors : {debug: 'blue', info : 'green', warn: 'orange', error: 'red'},
    handleExeptions: true,
    humanReadableUnhandledException: true,
};

// Add & configure the console transport
logger.addTransport('console', consoleOptions);

var papertrailOptions = {
    host: 'logs4.papertrailapp.com', // Replace with your papertrail app URL
    port: 53141, // Replace with your papertrail app's port number
    logFormat: function(level, message) {
        return '[' + level + '] ' + message;
    },
    inlineMeta: true,
    json: true,
    colorize: true,
    handleExeptions: true
};

// Simply add the papertrail transport
logger.addTransport('papertrail', papertrailOptions);