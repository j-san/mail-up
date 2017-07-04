var React = require('react');
var ReactDOM = require('react-dom');
var {Route, Switch} = require('react-router');
var {HashRouter} = require('react-router-dom');
var Mousetrap = require('mousetrap');

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

Mousetrap.bind('b', location.assign.bind(location, '#/about'));
Mousetrap.bind('h',location.assign.bind(location, '#/help'));
Mousetrap.bind('c', location.assign.bind(location, '#/configure'));
Mousetrap.bind('esc', location.assign.bind(location, '#/messages'));

Mousetrap.bind(['w', 'ctrl+n'], ()=> {
    if (store.currentAccount) {
        location.assign(`#/messages/${encodeURIComponent(store.currentAccount.id)}/write`);
    }
});
Mousetrap.bind(['n', 'down'], ()=> {
    var index = store.currentAccount.findMessageIndexById(store.currentMessage.id);
    var newMessage = store.currentAccount.messages[index + 1];

    if (newMessage) {
        location.assign(`#/messages/${encodeURIComponent(store.currentAccount.id)}/${newMessage.id}`);
    }
});
Mousetrap.bind(['p', 'up'], ()=> {
    var index = store.currentAccount.findMessageIndexById(store.currentMessage.id);
    var newMessage = store.currentAccount.messages[index - 1];

    if (newMessage) {
        location.assign(`#/messages/${encodeURIComponent(store.currentAccount.id)}/${newMessage.id}`);
    }
});

ReactDOM.render(<HashRouter>
    <div>
        <Header />
        <div className="page-content">
            <Switch>
                <Route path="/messages" exact render={()=> {
                    // return <Mailbox accounts={store.accounts} />;
                    location.assign(`#/messages/${encodeURIComponent(store.accounts[0].id)}`);
                    return null;
                }}>
                </Route>
                <Route path="/messages/:account" render={({match})=> {
                    var account = store.currentAccount = store.accounts.find((account)=> {
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
                            var message = store.currentMessage = account.findMessageById(Number(match.params.id));

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
                        <Route render={()=> {
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
                <Route render={(props)=> {
                    console.log('not found', props.location.pathname, props);
                    location.assign('#/messages');
                    return null;
                }}>
                </Route>
            </Switch>
        </div>
    </div>
</HashRouter>, document.getElementById('main'));