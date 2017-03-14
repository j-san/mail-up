
var React = require('react');

module.exports = class Help extends React.Component {
    render() {
        return <div className="page-content">
{String.raw`
  _  _         _
 | || |  ___  | |  _ __
 | __ | / -_) | | | '_ \
 |_||_| \___| |_| | .__/
                  |_|


Commands
--------

h: Help
b: About
w: Write message
esc: Back to messages
ctrl+p: Open run commands panel
`}
        </div>;
    }
}
