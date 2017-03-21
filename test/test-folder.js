
var Account = require('../js/models/MailAccount');
// var MailFolderCollection = require('../js/models/MailFolder');

describe('folder', function () {
    var sampleMailboxFolders = {
        'root': true,
        'children': [{
            'name': 'INBOX',
            'delimiter': '/',
            'path': 'INBOX',
            'children': [],
            'flags': ['\\HasNoChildren'],
            'listed': true,
            'subscribed': true
        }, {
            'name': '[Gmail]',
            'delimiter': '/',
            'path': '[Gmail]',
            'children': [{
                'name': 'Brouillons',
                'delimiter': '/',
                'path': '[Gmail]/Brouillons',
                'children': [],
                'flags': [
                    '\\HasNoChildren',
                    '\\Drafts'

                ],
                'listed': true,
                'specialUse': '\\Drafts',
                'subscribed': true
            }, {
                'name': 'Corbeille',
                'delimiter': '/',
                'path': '[Gmail]/Corbeille',
                'children': [],
                'flags': [
                    '\\Trash',
                    '\\HasNoChildren'
                ],
                'listed': true,
                'specialUse': '\\Trash',
                'subscribed': true
            }]
        }]
    };

    it('should initialize recurcively with account', function () {
        var account = new Account();
        account._parseMailbox(sampleMailboxFolders);

        account.mailfolders[0].name.should.equal('INBOX');
        account.mailfolders[1].name.should.equal('[Gmail]');
        account.mailfolders[1].children[0].name.should.equal('Brouillons');
        account.mailfolders[1].children[1].name.should.equal('Corbeille');
    });
});
