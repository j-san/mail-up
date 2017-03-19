
var React = require('react');
var ReactDOM = require('react-dom');
var {Route, Switch} = require('react-router');
var {HashRouter} = require('react-router-dom');

var RunCommandMixin = require('./mixins/run-command-mixin');

var Message = require('./models/Message');
var Configuration = require('./models/Configuration');
var MailAccount = require('./models/MailAccount');

var Mailbox = require('./components/Mailbox.jsx');
var WriteMessage = require('./components/WriteMessage.jsx');
var Configure = require('./components/Configure.jsx');
var Password = require('./components/Password.jsx');
var Header = require('./components/Header.jsx');
var About = require('./components/About.jsx');
var Help = require('./components/Help.jsx');


var store = {};

store.configuration = new Configuration();
store.configuration.load();

store.accounts = store.configuration.accounts.map((config)=> {
    var account = new MailAccount(config);

    account.password = store.configuration.passwords[config.user];
    if (!account.password) {
        location.assign('#/password');
    } else {
        account.connect();
    }
    return account;
});

RunCommandMixin.init([{
    bind: ['w', 'ctrl+n'],
    label: 'Write message',
    navigate: 'write'
}, {
    bind: 'b',
    label: 'About',
    navigate: 'about'
}, {
    bind: 'h',
    label: 'Help',
    navigate: 'help'
}, {
    bind: 'c',
    label: 'Configure',
    navigate: 'configure'
}, {
    bind: 'esc',
    label: 'Back to messages',
    navigate: 'messages'
}, {
    bind: 'n',
    label: 'Next mail',
    navigate: 'messages/next'
}, {
    bind: 'p',
    label: 'Previous mail',
    navigate: 'messages/previous'
}]);

ReactDOM.render(<HashRouter>
    <div>
        <Header />
        <div className="page-content">
            <Switch>
                <Route path="/messages" exact render={()=> {
                    // return <Mailbox accounts={store.accounts} />;
                    location.assign(`#/messages/${store.accounts[0].id}`);
                    return null;
                }}>
                </Route>
                <Route path="/messages/:account" render={({match})=> {
                    var account = store.accounts.find((account)=> {
                        return account.id == match.params.account;
                    });

                    return <Switch>
                        <Route path={`${match.url}folder/:folder`} render={({match})=> {
                            var folder = match.params.folder;
                            return <Mailbox accounts={store.accounts} account={account} folder={folder} />;
                        }}>
                        </Route>
                        <Route path={`${match.url}/write`} render={()=> {
                            if (!store.edit) {
                                store.edit = new Message();
                                store.edit.envelope.from = account.config.user;
                            }
                            return <WriteMessage model={store.edit} onSend={()=> {
                                account.send(store.edit).then(()=> {
                                    store.edit = null;
                                    location.assign('#/messages');
                                }, (e)=> {
                                    console.error(e);
                                });
                            }} />;
                        }}>
                        </Route>
                        <Route path={`${match.url}/:id`} render={({match})=> {
                            var message = account.findMessageById(Number(match.params.id));

                            return <switch>
                                <Route path={`${match.url}/reply`} render={()=> {
                                    store.edit = new Message();
                                    store.edit.envelope = Object.assign({}, message.envelope);
                                    delete store.edit.envelope['reply-to'];
                                    delete store.edit.envelope['cc'];
                                    delete store.edit.envelope.date;
                                    delete store.edit.envelope.sender;
                                    store.edit.envelope.to = [(message.envelope['reply-to'] || message.envelope.from)];
                                    store.edit.envelope.from = account.config.user;
                                    store.edit.body = message.body;
                                    location.assign(`#/messages/${account.id}/write`);
                                    return null;
                                }}>
                                </Route>
                                <Route path={`${match.url}/forward`} render={()=> {
                                    store.edit = new Message();
                                    store.edit.envelope = Object.assign({}, message.envelope);
                                    delete store.edit.envelope['reply-to'];
                                    delete store.edit.envelope.date;
                                    delete store.edit.envelope.sender;
                                    store.edit.envelope.from = account.config.user;
                                    store.edit.envelope.to = '';
                                    store.edit.body = message.body;
                                    location.assign(`#/messages/${account.id}/write`);
                                    return null;
                                }}>
                                </Route>
                                <Route path={`${match.url}/reply-all`} render={()=> {
                                    store.edit = new Message();
                                    store.edit.envelope = Object.assign({}, message.envelope);
                                    delete store.edit.envelope['reply-to'];
                                    delete store.edit.envelope.date;
                                    delete store.edit.envelope.sender;
                                    store.edit.envelope.from = account.config.user;
                                    store.edit.envelope.to = [(message.envelope['reply-to'] || message.envelope.from)];
                                    store.edit.body = message.body;
                                    location.assign(`#/messages/${account.id}/write`);
                                    return null;
                                }}>
                                </Route>
                                <Route render={()=> {
                                    if (message) {
                                        account.loadMessage(message);
                                    }
                                    return <Mailbox accounts={store.accounts} account={account} selected={message} />;
                                }}>
                                </Route>
                            </switch>;
                        }} />
                        <Route render={({match: {params}})=> {

                            return <Mailbox accounts={store.accounts} account={account} />;
                        }}>
                        </Route>
                    </Switch>;
                }} />
                <Route path="/password" render={()=> {
                    return <Password configuration={store.configuration} onSave={()=> {
                        store.configuration.save();
                        location.assign('#/messages');
                    }} />;
                }}>
                </Route>
                <Route path="/configure" render={()=> {
                    return <Configure model={store.configuration} onSave={()=> {
                        store.configuration.save();
                        location.assign('#/messages');
                    }} />;
                }}>
                </Route>
                <Route path="/about" render={()=> {
                    return <About />;
                }}>
                </Route>
                <Route path="/help" render={()=> {
                    return <Help />;
                }}>
                </Route>
                <Route render={({location: loc})=> {
                    console.log('not found', loc.pathname);
                    location.assign('#/messages');
                    return null;
                }}>
                </Route>
            </Switch>
        </div>
    </div>
</HashRouter>, document.getElementById('main'));
