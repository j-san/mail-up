var Message = require('../js/models/Message.js');

require('chai').should();

describe('message', function () {
    it('should query body from structure', function () {
        var msg = new Message({
            bodystructure: {
                childNodes: [{
                    part: '1',
                    type: 'text/plain'
                }, {
                    part: '2',
                    type: 'text/html'
                }],
                type: 'multipart/alternative'
            }
        });
        var query = msg.getBodyQuery();
        query.should.deep.equal(['body[1]', 'body[2]']);
    });
    it('should query body from embedded structure', function () {
        var msg = new Message({
            bodystructure: {
                childNodes: [{
                    part: '1',
                    type: 'multipart/alternative',
                    childNodes: [{
                        part: '1.1',
                        type: 'text/plain'
                    }, {
                        part: '1.2',
                        type: 'text/html'
                    }]
                }, {
                    part: '2',
                    type: 'text/html'
                }],
                type: 'multipart/alternative'
            }
        });
        var query = msg.getBodyQuery();
        query.should.deep.equal(['body[1.1]', 'body[1.2]', 'body[2]']);
    });
});
