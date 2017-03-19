
var React = require('react');
var ReactDOM = require('react-dom');
var {extendObservable} = require('mobx');
var {observer} = require('mobx-react');
var moment = require('moment');


module.exports = observer(class MessageView extends React.Component {

    constructor(props) {
        super();
        this.outputFormats = ['standard', 'json', 'raw'];
        extendObservable(this, {
            output: 'standard'
        });
    }
    showFormat(format) {
        this.output = format;
    }
    render() {
        var envelope = this.props.model.envelope;
        var body = this.props.model.body;
        var content;

        if (this.output == 'json') {
            content = <pre>
                {JSON.stringify(this.props.model, null, 2)}
            </pre>;
        } else if (this.output == 'raw') {
            content = <pre>
                {this.props.model.raw}
            </pre>;
        } else {
            content = <div className="message-content">
                <div className="message-envelope">
                    <Envelope model={envelope} />
                    <div className="pull-right">
                        <a href={`#/messages/${this.props.model.id}/reply`} title="reply">&lt;</a>
                        {'  '}
                        <a href={`#/messages/${this.props.model.id}/reply-all`} title="reply all">&laquo;</a>
                        {'  '}
                        <a href={`#/messages/${this.props.model.id}/forward`} title="forward">&raquo;</a>
                    </div>
                </div>
                <Body body={body} />
            </div>;
        }

        return <div>
            <div className="message-header">
                <div className="btn-group-vertical pull-right" role="group" aria-label="Output Format">
                    {this.outputFormats.map((format)=> {
                        var handler = this.showFormat.bind(this, format);
                        var classNames = ['btn', 'btn-default'];
                        if (format === this.output) {
                            classNames.push('active');
                        }

                        return <button onClick={handler} key={format} className={classNames.join(' ')}>{format}</button>;
                    })}
                </div>
                <h2>{envelope.subject}</h2>
            </div>
            {content}
        </div>;
    }
})

class Envelope extends React.Component {
    render() {
        return <div className="message-headers">
            <p>{moment(new Date(this.props.model.date)).format('LLL')}</p>
            <HeaderField name="From" values={this.props.model.from} />
            <HeaderField name="To" values={this.props.model.to} />
            <HeaderField name="CC" values={this.props.model.cc} />
        </div>;
    }
}

var Body = observer(class Body extends React.Component {
    constructor() {
        super();
        extendObservable(this, {
            alternative: null
        });
    }
    // componentWillReceiveProps() {
    //     this.alternative = this.getPreferredAlternative();
    // }
    showAlternative(alternative) {
        this.alternative = alternative;
    }
    getPreferredAlternative() {
        var preferredAlt;
        var body = this.props.body;
        if (this.alternative) {
            return this.alternative;
        }
        if (!this.alternative && body && body.length) {
            body.forEach(function (alt) {
                if (alt.type == 'text/html') {
                    preferredAlt = alt;
                    return false;
                }
            })
            return preferredAlt || body[0];
        }
    }
    render() {
        var content;
        var alternative = this.getPreferredAlternative();

        if (alternative) {
            if (alternative.type == 'text/html') {
                content = <iframe src={"data:text/html;charset=utf-8," + alternative.content} 
                    width="100%" allowTransparency="true" 
                    frameBorder="0" 
                    onLoad={(evt)=> {
                        evt.target.style.height = evt.target.contentDocument.body.scrollHeight + 'px';
                    }}>
                </iframe>;
            } else if (alternative.type.indexOf('image/') === 0) {
                content = <div><img src={['data:', alternative.type, ';base64,', alternative.content].join('')}/></div>;
            } else {
                content = <pre>
                    {alternative.content}
                </pre>;
            }
        } else {
            content = <div className="loading">
                    Loading...
            </div>;
        }

        return <div className="message-body">
            <div className="alternatives">
                <div className="btn-group" role="group" aria-label="Format">
                    {this.props.body && this.props.body.map((alt)=> {
                        var handler = this.showAlternative.bind(this, alt);
                        var classNames = ['btn', 'btn-default'];
                        if (alt === alternative) {
                            classNames.push('active');
                        }

                        return <button onClick={handler} key={alt.id} className={classNames.join(' ')}>{alt.id + ' - ' + alt.type}</button>;
                    })}
                </div>
            </div>
            {content}
        </div>;
    }
})

class HeaderField extends React.Component {
    render() {
        if (!this.props.values || !this.props.values.length) {
            return null;
        }

        return <div>
            <strong>{this.props.name}: </strong>
            {this.props.values.map(function (address, index) {
                return <span key={index}>{address.name} ({address.address})</span>
            })}
        </div>;
    }
}
