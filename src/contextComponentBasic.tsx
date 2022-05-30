import * as React from 'react'
import * as P from 'ts-prime'

type ContextFn<K extends string, T> = {
	provider: {
		key: `${Capitalize<K>}ContextProvider`
		fn: (props: React.PropsWithChildren<{ value: T }>) => JSX.Element
	}
	useContext: {
		key: `use${Capitalize<K>}Context`
		fn: () => T
	}
}

type Return<K extends string, T> = {
	[k in keyof ContextFn<K, T>]: { key: ContextFn<K, T>[k]['key']; fn: ContextFn<K, T>[k]['fn'] }
}[keyof ContextFn<K, T>]

type X<K extends string, T> = {
	[k in Return<K, T>['key']]: Extract<Return<K, T>, { key: k }>['fn']
}

export function makeBasicContextComponent<T>(): <K extends string>(ctx: K) => X<K, T> {
	return <K extends string>(ctx: K) => {
		const cont = React.createContext<{ data: T } | null>(null)
		function useCtx() {
			const ctxValue = React.useContext(cont)
			if (ctxValue == null) throw new Error(`Context ${ctx} was not provided!`)
			return ctxValue.data
		}

		return {
			[`${P.capitalize(ctx)}ContextProvider`]: (props: React.PropsWithChildren<{ value: T }>) => {
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
			[`use${P.capitalize(ctx)}Context`]: useCtx,
		} as any
	}
}
