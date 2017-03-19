
var React = require('react');
var {observer} = require('mobx-react');
var moment = require('moment');

var MessageView = require('./MessageView.jsx');


module.exports = observer(class MessageList extends React.Component {
    render() {
        var selected = this.props.selected;
        // var selected = this.props.collection.find((msg)=> msg.id == this.props.selected);

        return <div className={selected ? 'full-width' : ''}>
            <div className={'message-list' + (selected ? ' side-content' : '')}>
                <div>
                {this.props.collection.map(function(msg) {
                    var active = (selected && msg.id === selected.id ? ' active' : '');
                    return <MessageItem key={msg.id} model={msg} active={active} />;
                })}
                </div>
                {this.props.collection.length > 0 &&
                <div onClick={()=> {this.props.loadMore();}}>
                    load more
                </div>
                }
            </div>
            {selected &&
            <div className="message-view">
                <MessageView model={selected} />
            </div>
            }
        </div>;
    }
});


class MessageItem extends React.Component {
    render() {
        var model = this.props.model;
        var env = model.envelope;
        // var date = moment(model.envelope.date, 'Mon, 13 Mar 2017 16:14:19 +0000');
        var date = moment(new Date(model.envelope.date));
        var flags = model.flags.map(function (flag) {
            return flag.replace('\\', '');
        });

        return <a className={`media ${this.props.active}`} href={`#/messages/${model.id}`}>
            <div className={['media-body'].concat(flags).join(' ')}>
                <span className="message-item-date pull-right" title={date.format('lll')}>{date.calendar()}</span>
                <strong className="media-heading">{model.envelope.subject}</strong>
            </div>
        </a>;
    }
}