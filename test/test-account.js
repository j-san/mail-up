
var Configuration = require('../js/models/Configuration.js');
var MailAccount = require('../js/models/MailAccount.js');

require('chai').should();

describe('account', function () {
    var mockConf = {
        accounts: [{
            imap: {
                host: 'imap.mail.me.com',
                port: 993
            },
            auth: {
                user: '',
                pass: ''
            }
        }]
    };

    it('should init from config', function () {
        var configuration = new Configuration();
        configuration.parse(mockConf);

        var account = new MailAccount(configuration.accounts[0]);
        account.config.imap.host.should.equal(mockConf.accounts[0].imap.host);
    });
});
