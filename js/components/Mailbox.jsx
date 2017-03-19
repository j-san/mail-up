
var React = require('react');

var MessageList = require('./MessageList.jsx');
var MailFolderList = require('./MailFolderList.jsx');


module.exports = class Mailbox extends React.Component {

    render() {
        return <section>
            <div className="side-content">
                <MailFolderList collection={this.props.accounts} />
            </div>
            {this.props.account &&
                <MessageList
                    collection={this.props.account.messages}
                    selected={this.props.selected}
                     account={this.props.account}
                    loadMore={()=> {
                        this.account.loadMore();
                    }} />
            }
        </section>;
    }
}