
var React = require('react');
var {extendObservable} = require('mobx');
var {observer} = require('mobx-react');


module.exports = observer(class Configure extends React.Component {
    constructor() {
        super();
        extendObservable(this, {
            config: ''
        });
    }
    componentDidMount() {
        this.config = JSON.stringify(this.props.model.toJSON(), null, 2);
    }
    onChange(evt) {
        this.config = evt.target.value;
        try {
            var content = JSON.parse(this.config);
            this.props.model.parse(content);
        } catch (e) {
            // console.log(e.message);
        }
    }
    render() {
        return <form onSubmit={(evt)=> {
            evt.preventDefault();
            this.props.model.save();
        }}>
            <textarea ref="config" rows={30} className="form-control"
                onChange={this.onChange.bind(this)}
                value={this.config} />
            <button type="submit" className="btn btn-default">Save</button>
        </form>;
    }
});
