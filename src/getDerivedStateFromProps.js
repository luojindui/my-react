import React from './react';

export default class Counter extends React.Component {
	constructor(props) {
		super(props)
		this.state = { number: 0 }
	}

	handleClick = () => {
		this.setState({ number: this.state.number + 1 })
	}

	render() {
		return (
			<div>
				<p>{this.state.number}</p>
				<ChildCounter count={this.state.number} />
				<button onClick={this.handleClick}>+</button>
			</div>
		)
	}
}

class ChildCounter extends React.Component {
	constructor(props) {
		super(props)
		this.state = { number: 0 }
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		const { count } = nextProps;
		if (count % 2 === 0) {
			return { number: count * 2 };
		} else if (count % 3 === 0) {
			return { number: count * 3 };
		}
		return null
	}

	

	render() {
		return (
			<div>{this.state.number}</div>
		)
	}
}