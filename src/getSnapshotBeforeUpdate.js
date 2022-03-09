import React from './react';

export default class ScrollLost extends React.Component {
	constructor(props) {
		super(props)
		this.state = { messages: [] };
		this.wrapper = React.createRef();
	}

	addMessage = () => {
		this.setState({
			messages: [`${this.state.messages.length}`, ...this.state.messages]
		});
	}

	componentDidMount() {
		this.timer = setInterval(() => {
			this.addMessage();
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.timer)
	}

	getSnapshotBeforeUpdate() {
		return {
			prevScrollTop: this.wrapper.current.scrollTop,
			prevScrollHeight: this.wrapper.current.scrollHeight,
		}
	}

	componentDidUpdate(prevProps, prevState, { prevScrollTop, prevScrollHeight }) {
		this.wrapper.current.scrollTop = prevScrollTop + this.wrapper.current.scrollHeight - prevScrollHeight;
	}

	render() {
		const style = {
			width: '200px',
			height: '100px',
			border: '1px solid red',
			overflow: 'auto',
		}
		return (
			<div style={style} ref={this.wrapper}>
				{
					this.state.messages.map((messages, index) => <div key={index}>{messages}</div>)
				}
			</div>
		)
	}
}