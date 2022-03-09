import React from './react';

export default class Counter extends React.Component {
	constructor(props) {
		super(props)
		this.state = { number: 0 }
		console.log('Counter constructor')
	}

	componentWillMount() {
		console.log('Counter componentWillMount')
	}

	componentWillUnmount() {
		console.log('Counter componentWillUnmount')
	}

	componentDidMount() {
		console.log('Counter componentDidMount')
	}

	shouldComponentUpdate(nextProps, nextState) {
		console.log('Counter shouldComponentUpdate', nextProps, nextState)
		return nextState.number % 2 === 0
	}

	componentWillUpdate() {
		console.log('Counter componentWillUpdate')
	}

	componentDidUpdate() {
		console.log('Counter componentDidUpdate')
	}

	componentWillReceiveProps(newProps) {
		console.log('Counter componentWillReceiveProps', newProps)
	}

	handleClick = () => {
		this.setState({ number: this.state.number + 1 })
	}

	render() {
		console.log('Counter render')
		return (
			<div>
				<p>{this.state.number}</p>
				{this.state.number === 4 ? null : <ChildCounter count={this.state.number} />}
				<button onClick={this.handleClick}>+</button>
			</div>
		)
	}
}

class ChildCounter extends React.Component {
	constructor(props) {
		super(props)
		this.state = { number: 0 }
		console.log('ChildCounter constructor')
	}

	componentWillMount() {
		console.log('ChildCounter componentWillMount')
	}

	componentWillUnmount() {
		console.log('ChildCounter componentWillUnmount')
	}

	componentDidMount() {
		console.log('ChildCounter componentDidMount')
	}

	shouldComponentUpdate(nextProps, nextState) {
		console.log('ChildCounter shouldComponentUpdate', nextProps, nextState)
		return nextProps.count % 3 === 0;
	}

	componentWillUpdate() {
		console.log('ChildCounter componentWillUpdate')
	}

	componentDidUpdate() {
		console.log('ChildCounter componentDidUpdate')
	}

	componentWillReceiveProps(newProps) {
		console.log('ChildCounter componentWillReceiveProps', newProps)
	}

	render() {
		console.log('ChildCounter render')
		return (
			<div>{this.props.count}</div>
		)
	}
}