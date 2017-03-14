
var React = require('react');

var MessageList = require('./MessageList.jsx');
var MailFolderList = require('./MailFolderList.jsx');


module.exports = class Mailbox extends React.Component {
    componentWillMount() {
        if (this.props.accounts[0]) {
            this.account = this.props.accounts[0];
        }
    }
    render() {
        return <section>
            <div className="side-content">
                <MailFolderList collection={this.props.accounts} />
            </div>
            {this.account &&
                <MessageList collection={this.account.messages} selected={this.props.selected} />
            }
        </section>;
    }
}