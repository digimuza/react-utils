import * as React from 'react'

type ContextOutput<T> = {
	ContextProvider: (props: React.PropsWithChildren<{ initialValue: T }>) => JSX.Element
	useContext: () => [T, (data: T) => void]
}

export function makeContextComponent<T>(ctx: string): ContextOutput<T> {
	const cont = React.createContext<[T, (data: T) => void] | null>(null)
	function useCtx() {
		const ctxValue = React.useContext(cont)
		if (ctxValue == null) throw new Error(`Context ${ctx} was not provided!`)
		return ctxValue
	}

	return {
		ContextProvider: (props: React.PropsWithChildren<{ initialValue: T }>) => {
			const [state, setState] = React.useState(props.initialValue)
			return <cont.Provider value={[state, setState]}>{props.children}</cont.Provider>
		},
		useContext: useCtx,
	}
}
