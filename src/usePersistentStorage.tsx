import React from 'react'
import * as P from 'ts-prime'

export function makeItemsStorage<X>(persistent?: { get(): Record<string, X>; set(data: Record<string, X>): void }) {
	const cx = React.createContext<[Record<string, X>, (data: Record<string, X>) => void] | null>(null)
	function useSingleItem(key: string) {
		const ctxValue = React.useContext(cx)
		if (ctxValue == null) throw new Error(`Items storage context was not provided!`)
		const [rec, setRec] = ctxValue

		return {
			item: rec[key] || null,
			set(data: X) {
				setRec({
					...rec,
					[key]: data,
				})
			},
			delete() {
				setRec(P.omit(rec, [key]))
			},
		}
	}

	function useItems() {
		const ctxValue = React.useContext(cx)
		if (ctxValue == null) throw new Error(`Items storage context was not provided!`)
		const [rec, setRec] = ctxValue

		return {
			items: rec,
			set(data: Record<string, X>) {
				setRec(data)
			},
			delete(key: string) {
				setRec(P.omit(rec, [key]))
			},
		}
	}
	return {
		ItemsStorageContext: (props: React.PropsWithChildren<{ initial?: Record<string, X> }>) => {
			const [state, setState] = React.useState({
				...(persistent?.get() || {}),
				...(props.initial || {}),
			})
			React.useEffect(() => {
				persistent?.set(state)
			}, [state])
			return <cx.Provider value={[state, setState]}>{props.children}</cx.Provider>
		},
		useSingleItemStorage: useSingleItem,
		useItemsStorage: useItems,
	}
}
