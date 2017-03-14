
var React = require('react');
var fs = require('fs');
var path = require('path');
var marked = require('marked');

var renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
    return `<a href="${href}" title="${title}" target="_blank">${text}</a>`;
}


module.exports = class About extends React.Component {
    componentWillMount() {
        fs.readFile(
            path.join(__dirname, '..', '..', 'README.md'),
            {encoding: 'utf-8'},
            (err, content)=> {
                this.content = marked(content, { renderer: renderer });
                this.forceUpdate();
            }
        );
    }
    render() {
        if (this.content) {
            return <pre dangerouslySetInnerHTML={{__html: this.content}} />
        }
        return null;
    }
}
