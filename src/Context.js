import React from './react';

const ThemeContext = React.createContext();
const { Provider, Consumer } = ThemeContext;

const style = {
	margin: '5px',
	padding: '5px',
};
export default class Page extends React.Component {
	constructor(props) {
		super(props);
		this.state = { color: 'red' };
	}

	changColor = (color) => {
		this.setState({ color });
	}

	render() {
		const contextValue = {
			color: this.state.color,
			changColor: this.changColor,
		};
		return (
			<Provider value={contextValue}>
				<div style={{...style, width: '250px'}}>
					<Header />
					<Main />
				</div>
			</Provider>
		)
	}
}

class Header extends React.Component {
	static contextType = ThemeContext;
	render() {
		return <div style={{ ...style, border: `5px solid ${this.context.color}` }}>
			Header
			<Title />
		</div>
	}
}

function Title() {
	return (
		<Consumer>
			{
				(contextValue) => (
					<div style={{ ...style, border: `5px solid ${contextValue.color}` }}>
						Title
					</div>
				)
			}
		</Consumer>
	)
}

class Main extends React.Component {
	static contextType = ThemeContext;
	render() {
		return <div style={{ ...style, border: `5px solid ${this.context.color}` }}>
			Main
			<Content />
		</div>
	}
}

function Content() {
	return (
		<Consumer>
			{
				(contextValue) => (
					<div style={{ ...style, border: `5px solid ${contextValue.color}` }}>
						Content
						<button onClick={() => contextValue.changeColor('red')}>red</button>
						<button onClick={() => contextValue.changeColor('green')}>green</button>
					</div>
				)
			}
		</Consumer>
	)
}
