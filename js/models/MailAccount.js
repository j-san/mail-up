var {extendObservable} = require('mobx');
var ImapClient = require('emailjs-imap-client');
var SmtpClient = require('emailjs-smtp-client');

var Message = require('./Message');
var pkg = require('../../package');


class MailAccount {

    constructor(config) {
        this.config = config;
        extendObservable(this, {
            status: 'close',
            error: '',
            messages: [],
            mailfolders: []
        });
        this.loadOffset = 0;
    }

    get id() {
        return this.config.user;
    }

    connect() {
        this.error = '';
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
                    },
                    useSecureTransport: this.config.useSecureTransport,
                    ignoreTLS: this.config.ignoreTLS,
                    requireTLS: this.config.requireTLS,
                }
            );

            // this.client.logLevel = this.client.LOG_LEVEL_DEBUG;
            this.client.logLevel = this.client.LOG_LEVEL_INFO;
            this.client.onerror = this._error.bind(this);
            this.client.onupdate = this._updated.bind(this);

            // console.log('connect');
            this.client.connect().then(()=> {
                this._authenticated();
            }, this._error.bind(this));
        }

        if (this.config.smtp) {
            this.smtp = new SmtpClient(
                this.config.smtp.host,
                this.config.smtp.port,
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
            this.smtp.logLevel = this.smtp.LOG_LEVEL_INFO;
        }
    }
    disconnect() {
        this.client.logout().then(()=> {
            this.client.close().then(()=> {
                this.status = 'close';
            });
        });
        this.smtp.close();
    }

    _error(err) {
        this.status = 'error';
        this.error = err.message;
        console.error(err);
    }

    _updated(type, value) {
        if (type === 'exists') {
            console.log('new message(s) ' + value);
        } else if(type === 'expunge') {
            console.log('expunge... ' + value);
        } else if (type === 'fetch') {
            // if (notjunk)
            this.notif = new Notification('New Message');
            this._loadMessageList(value['#']);
        }
    }

    _authenticated() {
        this.status = 'connected';
        this.client.listMailboxes().then((mailboxes)=> {
            this._parseMailbox(mailboxes);
        });

        this.client.selectMailbox('INBOX').then((mailboxInfo)=> {
            this.mailboxInfo = mailboxInfo;
            return this._loadMessageList();
        });
    }
    _parseMailbox(mailboxes) {
        if (mailboxes.root && !mailboxes.name && !mailboxes.length) {
            this.mailfolders.replace(mailboxes.children);
        } else {
            this.mailfolders.replace(mailboxes);
        }
        // console.log('mailfolders loaded', this.mailfolders);
    }
    _loadMessageList(sequence) {
        if (!sequence) {
            var start = this.loadOffset ? this.mailboxInfo.exists - this.loadOffset - 1 : '*';
            this.loadOffset += 40;
            var end = this.mailboxInfo.exists - this.loadOffset;
            if (this.mailboxInfo.exists) {
                sequence = end + ':' + start;
            }
        }
        return this.client.listMessages(
            'INBOX',
            sequence,
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
                message.id,
                ['flags'/*, 'BODY[]'*/].concat(query)
                // {byUid: true}
            ).then((messages)=> {
                console.log('body loaded', messages);
                message.parseBody(messages[0]);
                message.flags.replace(messages[0].flags);
            });
        }
    }
    loadMore() {
        this._loadMessageList();
    }
    orderMessages() {
        this.messages.replace(this.messages.sort((m1, m2)=> {
            return new Date(m2.envelope.date).getTime() - new Date(m1.envelope.date).getTime();
        }));
    }
    findMessageById(id) {
        return this.messages.find((msg)=> msg.id == id);
    }
    findMessageIndexById(id) {
        return this.messages.findIndex((msg)=> msg.id == id);
    }
    send(message) {
        return new Promise((resolve, reject)=> {
            console.log('sending');
            function noop() {}

            this.smtp.onready = ()=> {
                console.log('sending mail body');
                this.smtp.send(`Subject: ${message.envelope.subject}\r\n`);
                this.smtp.send('\r\n');
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

module.exports = MailAccount;