
var React = require('react');
var ReactDOM = require('react-dom');
var {Route, Switch} = require('react-router');
var {HashRouter} = require('react-router-dom');

var RunCommandMixin = require('./mixins/run-command-mixin');

var Message = require('./models/Message');
var Configuration = require('./models/Configuration');
var MailStore = require('./models/MailStore');

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
    var mailStore = new MailStore(config);

    mailStore.password = store.configuration.passwords[config.user];
    if (!mailStore.password) {
        location.assign('#/password');
    } else {
        mailStore.connect();
    }
    return mailStore;
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
                    return <Mailbox accounts={store.accounts} />;
                }}>
                </Route>
                <Route path="/messages/previous" render={()=> {
                    store.accounts.selected.messages.selectPrevious();
                    location.assign('#/messages/' + store.accounts.selected.messages.selected.id);
                    return null;
                }}>
                </Route>
                <Route path="/messages/next" render={()=> {
                    store.accounts.selected.messages.selectNext();
                    location.assign('#/messages/' + store.accounts.selected.messages.selected.id);
                    return null;
                }}>
                </Route>
                <Route path="/messages/:id/reply" render={({match: {params}})=> {
                    var selected = store.accounts[0].findMessageById(params.id);

                    store.edit = new Message();
                    store.edit.envelope = Object.assign({}, selected.envelope);
                    delete store.edit.envelope['reply-to'];
                    delete store.edit.envelope['cc'];
                    delete store.edit.envelope.date;
                    delete store.edit.envelope.sender;
                    store.edit.envelope.to = [(selected.envelope['reply-to'] || selected.envelope.from)];
                    store.edit.envelope.from = store.accounts[0].config.user;
                    store.edit.body = selected.body;
                    location.assign('#/write');
                    return null;
                }}>
                </Route>
                <Route path="/messages/:id/forward" render={({match: {params}})=> {
                    var selected = store.accounts[0].findMessageById(params.id);

                    store.edit = new Message();
                    store.edit.envelope = Object.assign({}, selected.envelope);
                    delete store.edit.envelope['reply-to'];
                    delete store.edit.envelope.date;
                    delete store.edit.envelope.sender;
                    store.edit.envelope.from = store.accounts[0].config.user;
                    store.edit.envelope.to = '';
                    store.edit.body = selected.body;
                    location.assign('#/write');
                    return null;
                }}>
                </Route>
                <Route path="/messages/:id/reply-all" render={({match: {params}})=> {
                    var selected = store.accounts[0].findMessageById(params.id);

                    store.edit = new Message();
                    store.edit.envelope = Object.assign({}, selected.envelope);
                    delete store.edit.envelope['reply-to'];
                    delete store.edit.envelope.date;
                    delete store.edit.envelope.sender;
                    store.edit.envelope.from = store.accounts[0].config.user;
                    store.edit.envelope.to = [(selected.envelope['reply-to'] || selected.envelope.from)];
                    store.edit.body = selected.body;
                    location.assign('#/write');
                    return null;
                }}>
                </Route>
                <Route path="/messages/:id" render={({match: {params}})=> {
                    var selected = store.accounts[0].findMessageById(params.id);
                    if (selected) {
                        store.accounts[0].loadMessage(selected);
                    }
                    return <Mailbox accounts={store.accounts} selected={selected} />;
                }}>
                </Route>
                <Route path="/write" render={()=> {
                    if (!store.edit) {
                        store.edit = new Message();
                        store.edit.envelope.from = store.accounts[0].config.user;
                    }
                    return <WriteMessage model={store.edit} onSend={()=> {
                        store.accounts[0].send(store.edit).then(()=> {
                            store.edit = null;
                            location.assign('#/messages');
                        }, (e)=> {
                            console.error(e);
                        });
                    }} />;
                }}>
                </Route>
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
