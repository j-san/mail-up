
var React = require('react');

var MessageList = require('./MessageList.jsx');
var MailFolderList = require('./MailFolderList.jsx');


module.exports = class Mailbox extends React.Component {
    componentWillReceiveProps(props) {
        this.selectFolder(props);
    }
    componentWillMount() {
        this.selectFolder(this.props);
    }
    selectFolder(props) {
        this.account = props.account;
        console.log(this.account)
        if (!this.account && props.accounts[0]) {
            this.account = props.accounts[0];
        }
    }
    render() {
        return <section>
            <div className="side-content">
                <MailFolderList collection={this.props.accounts} />
            </div>
            {this.account &&
                <MessageList
                    collection={this.account.messages}
                    selected={this.props.selected}
                    loadMore={()=> {
                        this.account.loadMore();
                    }} />
            }
        </section>;
    }
}