
var React = require('react');
var moment = require('moment');
var {extendObservable} = require('mobx');
var {observer} = require('mobx-react');


module.exports = observer(class WriteMessage extends React.Component {
    constructor() {
        super();
        extendObservable(this, {
            header: ''
        });
    }
    componentWillMount() {
        this.header = JSON.stringify(this.props.model.envelope, null, 2);
    }
    componentDidReceiveProps() {
        this.header = JSON.stringify(this.props.model.envelope, null, 2);
    }

    render() {
        return <form onSubmit={(evt)=> {
            evt.preventDefault();
            try {
                this.props.model.envelope = JSON.parse(this.header);
            } catch (e) {
                console.log('sending canceled', e.message);
                return;
            }
            this.props.onSend && this.props.onSend();
        }} className="form-horizontal">
            <div className="message-header">
                <label htmlFor="body">Header</label>
                <textarea name="header" className="form-control" rows={6} onChange={(evt)=> {
                    this.header = evt.target.value;
                    try {
                        this.props.model.envelope = JSON.parse(this.header);
                    } catch (e) {
                        // console.log(e.message);
                    }
                }} value={this.header} />
            </div>
            <div className="message-content">
                <label htmlFor="body">Body</label>
                <textarea name="body" className="form-control" rows={12} onChange={(evt)=> {
                    this.props.model.body = evt.target.value;
                }} value={this.props.model.body} />
            </div>
            <button type="submit" className="btn btn-default">Send</button>
        </form>;
    }
});
