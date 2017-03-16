
var React = require('react');


module.exports = class About extends React.Component {
    componentWillMount() {
    }
    render() {
        return <form onSubmit={(evt)=> {
            evt.preventDefault();
            this.props.onSave();
        }}>
            {this.props.configuration.accounts.map((config)=> {
                return <div key={config.user}>
                    <label>{config.user}</label>
                    <input type="password" className="form-control" 
                        value={this.props.configuration.passwords[config.user]}
                        onChange={(evt)=> {
                            this.props.configuration.passwords[config.user] = evt.target.value;
                        }
                    }/>
                </div>;
            })}
            <div>
                <button type="submit" className="btn btn-default">Save</button>
            </div>
        </form>;
    }
}
