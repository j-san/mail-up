
var {extendObservable} = require('mobx');


module.exports = class Configuration {
    constructor() {
        extendObservable(this, {
            accounts: [],
            passwords: {}
        });
    }

    load() {
        var data = JSON.parse(localStorage.getItem(this.constructor.name)) || {};
        this.accounts = data.accounts || [];
        this.passwords = data.passwords || {};
    }
    save() {
        localStorage.setItem(this.constructor.name, JSON.stringify({
            accounts: this.accounts,
            passwords: this.passwords
        }));
    }
    delete() {
        localStorage.removeItem(this.constructor.name);
    }

    toJSON() {
        var data = {};
        for (var key in this) {
            // if (isObservable(this[key])) {
            data[key] = this[key];
            // }
        }
        return data;
    }

    parse(data) {
        if (data && data.accounts) {
            this.accounts.replace(data.accounts);
        }
    }
}
