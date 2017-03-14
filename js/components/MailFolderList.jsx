
var React = require('react');
var {observer} = require('mobx-react');


module.exports = observer(class MailFolderList extends React.Component {

    render() {
        return <div>
            {this.props.collection.map(function (account) {
                return <Account model={account} key={account.id} />;
            })}
        </div>;
    }
})

var Account = observer(class Account extends React.Component {

    // componentWillMount() {
    //     if (!this.props.model.client) {
    //         this.props.model.connect();
    //     }
    // }

    render() {
        var account = this.props.model;
        return <div>
            <h3>{account.id}</h3>
            <FolderList collection={account.mailfolders} account={account} />
            <i>{account.status}</i>
            {account.error &&
                <p className="text-danger">{account.error}</p>
            }
        </div>;
    }
})


var FolderList = observer(class FolderList extends React.Component {

    render() {
        if (!this.props.collection.length) {
            return <div className="loading">Loading...</div>;
        }
        return <ul>
            {this.props.collection.map((folder)=> {
                return <Folder account={this.props.account} model={folder} key={folder.path} />;
            })}
        </ul>;
    }
})


class Folder extends React.Component {

    render() {
        var children = this.props.model.children;
        if (children && children.length) {
            return <li>
                <h4>{this.props.model.name}</h4>
                <FolderList account={this.props.account} collection={children}/>
            </li>;
        }
        var href = `#/account/${this.props.account.id}/folder/${this.props.model.path}`;
        return <li>
            <a href={href}>{this.props.model.name}</a>
        </li>;
    }
}

