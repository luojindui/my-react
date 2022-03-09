import React from './react';

const url = 'http://localhost:8081?code='

const getData = (code) => {
	return new Promise((resolve, reject) => {
		fetch(`${url}${code}`)
			.then(res => res.json())
			.then(data => resolve(data))
			.catch((err) => reject(err))
	})
}

export default class Stock extends React.Component {
	constructor(props) {
		super(props)
		this.codeRef = React.createRef()
		this.state = {
			codeList: []
		}
		console.log('Stock constructor')
	}

	componentWillMount() {
		console.log('Stock componentWillMount')
	}

	componentDidMount() {
		console.log('Stock componentDidMount')
	}

	shouldComponentUpdate(nextProps, nextState) {
		console.log('Stock shouldComponentUpdate', nextProps, nextState)
		return true
	}

	componentWillUpdate() {
		console.log('Stock componentWillUpdate')
	}

	componentDidUpdate() {
		console.log('Stock componentDidUpdate')
	}

	componentWillReceiveProps(newProps) {
		console.log('Stock componentWillReceiveProps', newProps)
	}

	componentWillUnmount() {
		console.log('Stock componentWillUnmount')
	}


	handleClick = () => {
		let { codeList } = this.state
		let code = this.codeRef.current.value
		if (!code) {return}
		code = code[0] === '0' ? `SZ${code}` : `SH${code}`;
		if (!codeList.includes(code)) {
			codeList.push(code)
		}
		this.setState({ codeList })
	}

	handleDelete = (code) => {
		let { codeList } = this.state
		codeList = codeList.filter(c => c !== code)
		this.setState({ codeList })
	}

	render() {
		return <div id='wrapper'>
			<input ref={this.codeRef}/><button onClick={this.handleClick}>+</button>
			{
				this.state.codeList.map(code => <StockBar code={code} handleDelete={this.handleDelete}/>)
			}
		</div>
	}
}

class StockBar extends React.Component {
	constructor(props) {
		super(props)
		console.log('StockBar constructor')
	}

	update = (code) => {
		getData(code).then(data => {
			// console.log('update', data)
			this.setState({ ...data })
		})
	}

	componentWillMount() {
		const { code } = this.props
		this.update(code)
		if (!this.timer) {
			// this.timer = setInterval(() => this.update(code), 5000)
		}
		console.log('StockBar componentWillMount')
	}

	componentWillUnmount() {
		this.timer && clearInterval(this.timer)
		console.log('StockBar componentWillUnmount')
	}

	componentDidMount() {
		console.log('StockBar componentDidMount')
	}

	shouldComponentUpdate(nextProps, nextState) {
		console.log('StockBar shouldComponentUpdate', nextProps, nextState)
		return true
	}

	componentWillUpdate() {
		console.log('StockBar componentWillUpdate')
	}

	componentDidUpdate() {
		console.log('StockBar componentDidUpdate')
	}

	componentWillReceiveProps(newProps) {
		console.log('StockBar componentWillReceiveProps', newProps)
	}

	render() {
		const { name, high, low, now, percent } = this.state
		return <div>
			<Item name='code' value={this.props.code}/>
			<Item name='name' value={name}/>
			<Item name='now' value={now}/>
			<Item name='percent' value={percent != null ? Number((percent * 100).toFixed(2)) : null}/>
			<Item name='high' value={high}/>
			<Item name='low' value={low}/>
			<button onClick={() => this.props.handleDelete(this.props.code)}>x</button>
		</div>
	}
}

class Item extends React.Component {

	render() {
		return this.props.value != null ? <div id={this.props.name}>{this.props.name} : {this.props.value}</div> : null
	}
}