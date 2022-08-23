import React from 'react'
import * as P from 'ts-prime'
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs'
import { useObservable } from './useObservable'
export function makeItemsStorage<X>(persistent?: { get(): Record<string, X>; set(data: Record<string, X>): void }) {
	const store = new BehaviorSubject<Record<string, X>>({})
	const cx = React.createContext<BehaviorSubject<Record<string, X>>>(store)
	function useSingleItem(key: string) {
		const value = useObservable(
			store.pipe(
				map((q) => q[key]),
				distinctUntilChanged()
			),
			[key]
		)

		return {
			item: value,
			set(data: X) {
				store.next({
					...store.getValue(),
					[key]: data,
				})
			},
			delete() {
				store.next(P.omit(store.getValue(), [key]))
			},
		}
	}

	function useItems() {
		const val = useObservable(store, [])
		return {
			items: val,
			set(data: Record<string, X>) {
				store.next(data)
			},
			delete(key: string) {
				store.next(P.omit(store.getValue(), [key]))
			},
		}
	}
	return {
		ItemsStorageContext: (props: React.PropsWithChildren<{ initial?: Record<string, X> }>) => {
			React.useEffect(() => {
				const x = persistent?.get()
				if (x) {
					store.next(x)
				}
				const subscribe = store.subscribe((s) => {
					persistent?.set(s)
				})
				return () => {
					subscribe.unsubscribe()
				}
			}, [store])
			return <cx.Provider value={store}>{props.children}</cx.Provider>
		},
		useSingleItemStorage: useSingleItem,
		useItemsStorage: useItems,
		store,
	}
}
