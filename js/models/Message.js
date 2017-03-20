
var {extendObservable} = require('mobx');
var QuotedPrintable = require('quoted-printable');
// var Envelope = require('./envelope');

module.exports = class Message {

    constructor(attrs) {
        attrs = attrs || {};
        extendObservable(this, {
            id: attrs['#'],
            uid: attrs['uid'],
            flags: attrs['flags'],
            parts: attrs['parts'],
            envelope: attrs['envelope'] || {
                from: '',
                to: [],
                subject: '',
            },
            bodystructure: attrs['bodystructure'],
            body: ''
        });
    }
    parseBody(msg) {
        // var body = {};
        this.raw = msg['body[]'];

        this.parts.forEach(function (part) {
            // body[part.id] = msg[part.query];
            part.content = msg[part.query];
            if (part.encoding === 'quoted-printable') {
                part.content = QuotedPrintable.decode(part.content);
            }
            if (part.encoding === 'base64') {
                part.content = atob(part.content);
            }
        });
        this.body = this.parts;
    }
    getBodyParts() {
        if (this.parts) {
            return this.parts;
        }
        var struct = this.bodystructure;
        this.parts = this.bodyParts(struct);
        if (!(this.parts instanceof Array)) {
            this.parts = [this.parts];
        }
        return this.parts;
    }
    getBodyQuery() {
        var query = this.getBodyParts().map((part)=> {
            return part.query;
        });
        return query;
        // return ['body[]'].concat(query);
    }
    bodyParts(struct) {
        if (struct.type.indexOf('multipart') >= 0) {
            var parts = struct.childNodes.map((child)=> {
                return this.bodyParts(child);
            });
            parts = [].concat.apply([], parts); // flatten
            return parts;
        } else {
            var key = struct.part || struct.id || null;
            return {
                id: key,
                type: struct.type,
                query: key ? 'body[' + key + ']' : 'body[1]',
                encoding: struct.encoding,
                charset: struct.parameters && struct.parameters.charset
            };
        }
    }
}
