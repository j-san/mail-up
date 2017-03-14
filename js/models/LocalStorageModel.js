
var {isObservable} = require('mobx');


module.exports = class LocalStorageModel {
    fetch() {
        var data = JSON.parse(localStorage.getItem(this.constructor.name));
        this.parse(data);
    }
    save() {
        var data = this.toJSON();
        localStorage.setItem(this.constructor.name, JSON.stringify(data));
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
};
