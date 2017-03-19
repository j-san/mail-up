
var {observable, extendObservable} = require('mobx');
var ImapClient = require('emailjs-imap-client');
var SmtpClient = require('emailjs-smtp-client');
var moment = require('moment');

var Message = require('./Message');
var pkg = require('../../package');


module.exports = class MailStore {

    constructor(config) {
        this.config = config;
        extendObservable(this, {
            status: '',
            messages: [],
            mailfolders: []
        });
        this.loadOffset = 0;
    }

    get id() {
        return this.config.user;
    }

    connect() {
        this.status = 'connecting...';

        if (this.config.imap) {
            this.client = new ImapClient(
                this.config.imap.host,
                this.config.imap.port,
                {
                    auth: {
                        user: this.config.user,
                        pass: this.config.password || this.password
                    },
                    id: {
                        name: pkg.name,
                        version: pkg.version
                    }
                }
            );

            // this.client.logLevel = this.client.LOG_LEVEL_DEBUG;
            this.client.logLevel = this.client.LOG_LEVEL_INFO;
            this.client.onerror = this.error.bind(this);
            this.client.onclose = this.closed.bind(this);
            this.client.onupdate = this.updated.bind(this);

            // console.log('connect');
            this.client.connect().then(()=> {
                this.authenticated();
            });
        }

        if (this.config.smtp) {
            this.smtp = new SmtpClient(
                this.config.smtp.host,
                this.config.smtp.port,
                {
                    auth: {
                        user: this.config.user,
                        pass: this.config.password
                    },
                    id: {
                        name: pkg.name,
                        version: pkg.version
                    }
                }
            );
            this.smtp.logLevel = this.smtp.LOG_LEVEL_INFO;
        }
    }

    error(err) {
        this.status = 'error';
        this.error = err.message;
        console.error(err.stack);
    }

    closed() {
        this.status = 'closed';
        console.log('closed');
    }

    updated(type, value) {
        if (type === 'exists') {
            console.log('new message(s) ' + value);
        } else if(type === 'expunge') {
            console.log('expunge... ' + value);
        } else if (type === 'fetch') {
            // if (notjunk)
            this.notif = new Notification('New Message');
            this.loadMessageList(value['#']);
        }
    }

    authenticated() {
        this.status = 'connected';
        this.client.listMailboxes().then((mailboxes)=> {
            if (mailboxes.root && !mailboxes.name && !mailboxes.length) {
                this.mailfolders.replace(mailboxes.children);
            } else {
                this.mailfolders.replace(mailboxes);
            }
            // console.log('mailfolders loaded', this.mailfolders);
        });

        this.client.selectMailbox('INBOX').then((mailboxInfo)=> {
            this.mailboxInfo = mailboxInfo;
            return this.loadMessageList(this.sequence);
        });
    }
    loadMessageList() {
        var start = this.loadOffset ? this.mailboxInfo.exists - this.loadOffset - 1 : '*';
        this.loadOffset += 40;
        var end = this.mailboxInfo.exists - this.loadOffset;
        if (this.mailboxInfo.exists) {
            this.sequence = end + ':' + start;
        }
        return this.client.listMessages(
            'INBOX',
            this.sequence,
            ['uid', 'flags', 'envelope', 'bodystructure']
        ).then((messages)=> {
            this.messages.replace(this.messages.concat(messages.map((message)=> {
                return new Message(message);
            })));
            this.orderMessages();
            return messages;
        });
    }
    loadMessage(message) {
        if (message && !message.body) {
            var query = message.getBodyQuery();
            // query = []
            this.client.listMessages(
                'INBOX',
                message.uid,
                query,
                {byUid: true}
            ).then((messages)=> {
                console.log('body loaded', messages);
                message.parseBody(messages[0]);
            });
        }
    }
    loadMore() {
        this.loadMessageList();
    }
    orderMessages() {
        this.messages.replace(this.messages.sort((m1, m2)=> {
            return new Date(m2.envelope.date).getTime() - new Date(m1.envelope.date).getTime();
        }));
        console.log(this.messages[0].envelope.date)
        console.log(this.messages[1].envelope.date)
    }
    findMessageById(id) {
        return this.messages.find((msg)=> msg.id == id);
    }
    send(message) {
        return new Promise((resolve, reject)=> {
            console.log('sending');
            function noop() {}

            this.smtp.onready = ()=> {
                console.log('sending mail body');
                this.smtp.send(`Subject: ${message.envelope.subject}\r\n`);
                this.smtp.send("\r\n");
                this.smtp.send(message.body);
                this.smtp.end();
                this.smtp.onready = noop;
            };

            this.smtp.onidle = ()=> {
                console.log('using envelope');
                this.smtp.useEnvelope(message.envelope);
                this.smtp.onidle = noop;
            };

            this.smtp.ondone = ()=> {
                console.log('done');
                this.smtp.close();
                resolve();
                this.smtp.ondone = noop;
            };
            this.smtp.onerror = (err)=> {
                console.error(err);
                reject(err);
                this.smtp.onerror = noop;
            };

            this.smtp.connect();
        });
    }
}
