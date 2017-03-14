
var React = require('react');

class Header extends React.Component {
    render() {
        return <div className="page-header">
            <div className="dropdown pull-right">
                <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">...</button>
                <ul className="dropdown-menu">
                    <li><a href="#/messages">Messages</a></li>
                    <li><a href="#/write">Write message</a></li>
                    <li><a href="#/configure">Configuration</a></li>
                    <li><a href="#/about">About</a></li>
                    <li><a href="#/help">Help</a></li>
                </ul>
            </div>
            <span>
{String.raw`
  _____     __  __          _   _
 ,\   /|   |  \/  |  __ _  (_) | |    _  _   _ __
 | \ / |   | |\/| | / _' | | | | |   | || | | '_ \
 |/ v \|   |_|  |_| \__,_| |_| |_|    \_,_| | .__/
 '_____'                                    |_|
`}
            </span>
        </div>;
    }
}

module.exports = Header;