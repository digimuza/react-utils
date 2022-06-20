import * as React from 'react'

type ContextOutput<T> = {
	ContextProvider: (props: React.PropsWithChildren<{ value: T }>) => JSX.Element
	useContext: () => T
}

export function makeBasicContextComponent<T>(ctx: string): ContextOutput<T> {
	const cont = React.createContext<{ data: T } | null>(null)
	function useCtx() {
		const ctxValue = React.useContext(cont)
		if (ctxValue == null) throw new Error(`Context ${ctx} was not provided!`)
		return ctxValue.data
	}
	return {
		ContextProvider: (props: React.PropsWithChildren<{ value: T }>) => {
			return (
				<cont.Provider
					value={{
						data: props.value,
					}}
				>
					{props.children}
				</cont.Provider>
			)
		},
		useContext: useCtx,
	}
}
