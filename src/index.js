import React from './react';
import ReactDOM from './react-dom';

// class ChildCount extends React.Component {
// 	constructor(props) {
// 		super(props)
// 	}
// 	componentWillMount() {
// 		console.log('ChildCount componentWillMount')
// 	}
// 	componentDidMount() {
// 		console.log('ChildCount componentDidMount')
// 	}
// 	// shouldComponentUpdate(nextProps, nextState) {
// 	// 	console.log('ChildCount shouldComponentUpdate')
// 	// 	return nextProps.number > 2
// 	// }
// 	componentWillUpdate() {
// 		console.log('ChildCount componentWillUpdate')
// 	}
// 	componentDidUpdate() {
// 		console.log('ChildCount componentDidUpdate')
// 	}
// 	componentWillReceiveProps(nextProps) {
// 		console.log('ChildCount componentWillReceiveProps', nextProps)
// 	}
// 	componentWillUnmount() {
// 		console.log('ChildCount componentWillUnmount')
// 	}

// 	static getDerivedStateFromProps(nextProps, prevState) {
// 		const { number } = nextProps;
// 		if (number % 2 === 0) {
// 			return { number: number * 2 }
// 		} else {
// 			return { number: number * 3 }
// 		}
// 	}

// 	render() {
// 		console.log('ChildCount render')
// 		return React.createElement('div', { id: 'ChildCount' }, this.state.number)
// 	}
// }

// class Life extends React.Component {
// 	static defaultProps = { name: 'luoluoluo' }
// 	constructor(props) {
// 		super(props);
// 		this.state = { number: 2 };
// 		console.log('Counter constructor')
// 	}
// 	componentWillMount() {
// 		console.log('Counter componentWillMount')
// 	}
// 	handleClick = () => {
// 		this.setState((state) => ({ number: state.number + 1 }))
// 	}
// 	componentDidMount() {
// 		console.log('Counter componentDidMount')
// 	}
// 	// shouldComponentUpdate(nextProps, nextState) {
// 	// 	console.log('Counter shouldComponentUpdate')
// 	// 	return nextState.number > 1
// 	// }
// 	componentWillUpdate() {
// 		console.log('Counter componentWillUpdate')
// 	}
// 	componentDidUpdate() {
// 		console.log('Counter componentDidUpdate')
// 	}
// 	componentWillReceiveProps(nextProps) {
// 		console.log('Counter componentWillReceiveProps', nextProps)
// 	}
// 	componentWillUnmount() {
// 		console.log('Counter componentWillUnmount')
// 	}
// 	render() {
// 		console.log('Counter render')
// 		return React.createElement('div', { id: 'Counter' },
// 			React.createElement('p', {}, this.state.number),
// 			React.createElement(/* this.state.number > 3 ? null :  */ChildCount, {number: this.state.number}),
// 			React.createElement('button', { onClick: this.handleClick }, '+'))
// 	}
// }

// class Show extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = { 
// 			show: true,
// 		}
// 	}

// 	handleClick = () => {
// 		this.setState({ show: !this.state.show });
// 	}

// 	render() {
// 		if (this.state.show) {
// 			return React.createElement('ul', { id: 'ClassCount', onClick: this.handleClick }, 
// 				React.createElement('li', { key: 'A' }, 'A'),
// 				React.createElement('li', { key: 'B' }, 'B'),
// 				React.createElement('li', { key: 'C' }, 'C'),
// 				React.createElement('li', { key: 'D' }, 'D'))
// 		} else {
// 			return (
// 				React.createElement('ul', { id: 'ClassCount', onClick: this.handleClick }, 
// 				React.createElement('li', { key: 'A' }, 'A'),
// 				React.createElement('li', { key: 'C' }, 'C'),
// 				React.createElement('li', { key: 'B' }, 'B'),
// 				React.createElement('li', { key: 'E' }, 'E'),
// 				React.createElement('li', { key: 'F' }, 'F'))
// 			)
// 		}
// 	}
// }

// class ClassCount extends React.Component{
// 	render() {
// 		return React.createElement('div', { id: 'ClassCount' }, 
// 			React.createElement('div', {}, this.props.number),
// 			React.createElement('button', { onClick: this.props.handleClick }, '+'))
// 	}
// }

// function FunctionCount(props) {
// 	return React.createElement('div', { id: 'FunctionCount' }, 
// 		React.createElement('div', {}, props.number),
// 		React.createElement('button', { onClick: props.handleClick }, '+'))
// }


class Counter extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			number: 0,
		};
		setInterval(() => {
			this.setState({ number: this.state.number + 1 });
		}, 5000);
	}

	handleClick = () => {
		this.setState({ number: this.state.number + 1 });
		console.log(this.state.number);
		this.setState({ number: this.state.number + 1 });
		console.log(this.state.number);
		setTimeout(() => {
			// 定时器里 updateQueue.isPending 已经是false了, 所以这里不是批量更新
			this.setState({ number: this.state.number + 1 });
			console.log(this.state.number);
			this.setState({ number: this.state.number + 1 });
			console.log(this.state.number);
		});
	}

	componentDidUpdate() {
		console.log('*************', this.state.number);
	}

	render() {
		return (
			<div id='Counter'>
				<div id='number'>{this.state.number}</div>
				<button id='button' onClick={this.handleClick}>+</button>
			</div>
		)
	}
}

const element = <Counter />;

ReactDOM.render(
	element,
	document.getElementById('root')
);
