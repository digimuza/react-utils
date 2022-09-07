import * as React from 'react'
import { BehaviorSubject } from 'rxjs'
import { useObservable } from './useObservable'

type ContextOutput<T> = {
	ContextProvider: (props: React.PropsWithChildren<{ initialValue: T }>) => JSX.Element
	useContext: () => [T, (data: T) => void]
	useStream(): BehaviorSubject<T>
}

export function makeContextComponent<T>(ctx: string): ContextOutput<T> {
	const cont = React.createContext<BehaviorSubject<T> | null>(null)
	function useStream() {
		const ctxValue = React.useContext(cont)
		if (ctxValue == null) throw new Error(`Context ${ctx} was not provided!`)
		return ctxValue
	}
	function useContext(): ReturnType<ContextOutput<T>['useContext']> {
		const ctxValue = useStream()
		const bh = useObservable(ctxValue, [])
		if (bh == null) throw new Error(`Context ${ctx} was not provided!`)
		return [
			bh,
			(data: T) => {
				return ctxValue.next(data)
			},
		]
	}

	return {
		ContextProvider: (props: React.PropsWithChildren<{ initialValue: T }>) => {
			const sub = React.useRef(new BehaviorSubject(props.initialValue))
			return <cont.Provider value={sub.current}>{props.children}</cont.Provider>
		},
		useStream,
		useContext,
	}
}
