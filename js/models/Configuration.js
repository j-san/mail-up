
var LocalStorageModel = require('./LocalStorageModel');
var {extendObservable} = require('mobx');


module.exports = class Configuration extends LocalStorageModel {
    constructor() {
        super();
        extendObservable(this, {
            accounts: []
        });
    }

    parse(data) {
        if (data && data.accounts) {
            this.accounts.replace(data.accounts);
        }
    }
}
