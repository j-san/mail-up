

// var $ = require('jquery');
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
var Header = require('./components/Header.jsx');
var About = require('./components/About.jsx');
var Help = require('./components/Help.jsx');


var store = {};

store.configuration = new Configuration();
store.configuration.fetch();

store.accounts = store.configuration.accounts.map((config)=> {
    var store = new MailStore(config);
    store.connect();
    return store;
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
                <Route path="/about" render={()=> {
                    return <About />;
                }}>
                </Route>
                <Route path="/help" render={()=> {
                    return <Help />;
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
                <Route path="/messages/:id" render={({match: {params}})=> {
                    var selected = store.accounts[0].findMessageById(params.id);

                    if (selected) {
                        store.accounts[0].loadMessage(selected);
                    }
                    return <Mailbox accounts={store.accounts} selected={selected} />;
                }}>
                </Route>
                <Route path="/messages" render={()=> {
                    return <Mailbox accounts={store.accounts} />;
                }}>
                </Route>
                <Route path="/configure" render={()=> {
                    return <Configure model={store.configuration} />;
                }}>
                </Route>
                <Route render={()=> {
                    console.log('not found')
                    location.assign('#/messages');
                    return null;
                }}>
                </Route>
            </Switch>
        </div>
    </div>
</HashRouter>, document.getElementById('main'));
