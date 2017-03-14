
var Mousetrap = require('mousetrap');

module.exports = {

    init: function (commands) {

        commands.forEach((cmd)=> {
            var callback = cmd.run;
            if (typeof cmd.navigate === 'string') {
                callback = document.location.assign.bind(document.location, '#/' + cmd.navigate);
            }
            // console.log(cmd.bind, callback)
            Mousetrap.bind(cmd.bind, callback);
        });
    }
};
