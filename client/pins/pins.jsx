const React = require('react');
const _     = require('lodash');
const cx    = require('classnames');

const Pins = React.createClass({
	getDefaultProps: function() {
		return {
			pins : []
		};
	},
	getInitialState: function() {
		const channels =_.uniq(_.map(this.props.pins, (pin)=>{ return pin.channel }));

		return {
			selectedChannel: 'general',
			channels : channels
		};
	},

	handleChannel : function(channel){
		this.setState({
			selectedChannel : channel
		})
	},

	getDateString : function(ts){
		const d = new Date(0);
		d.setUTCSeconds(ts);

		return d.toUTCString();l

		return `${d.getHours()}:${d.getMinutes()}`;
	},

	renderChannels : function(){
		return _.map(this.state.channels, (channel)=>{
			const isSelected = channel == this.state.selectedChannel;
			const count = _.filter(this.props.pins, (pin)=>{ return channel == pin.channel; }).length;
			return <div
				className={cx('channel', {selected : isSelected})} key={channel}
				onClick={this.handleChannel.bind(null, channel)}>
				<i className='fa fa-hashtag' />
				<h5>{channel}</h5>
				<div className='count'>{count}</div>
			</div>
		});
	},

	renderPins : function(){
		const pins = _.filter(this.props.pins, (pin)=>{
			return this.state.selectedChannel == pin.channel;
		});

		return _.map(pins, (pin)=>{
			return <div className='pin' key={pin.ts}>
				<div className='top'>
					<span className='user'>{pin.user}</span>
					<span className='date'>{this.getDateString(pin.ts)}</span>
					<a href={pin.permalink} target='_blank'><i className='fa fa-external-link' /></a>
				</div>
				<div className='text'>{pin.text}</div>
			</div>
		});
	},

	render : function(){
		return <div className='pinPage'>
			<div className='sidebar'>
				<h1>
					Coolsville Pins
					<i className='fa fa-chevron-down' />
				</h1>
				<div className='channels'>
					<h3>Channels</h3>
					{this.renderChannels()}
				</div>
			</div>
			<div className='content'>
				<h1>
					<i className='fa fa-hashtag' />
					{this.state.selectedChannel}
				</h1>
				{this.renderPins()}
			</div>
		</div>
	}
});

module.exports = Pins;
