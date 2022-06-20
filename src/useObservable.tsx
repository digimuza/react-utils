import * as React from 'react'
import { useEffect } from 'react'
import { BehaviorSubject, Observable, ObservedValueOf, tap } from 'rxjs'
import * as P from 'ts-prime'

export function useObservable<T extends Observable<unknown> | BehaviorSubject<unknown>>(
	obs: T
): T extends BehaviorSubject<ObservedValueOf<T>> ? ObservedValueOf<T> : ObservedValueOf<T> | null {
	const initialValue = obs instanceof BehaviorSubject ? obs.getValue() : null
	const [data, set] = React.useState<any | null>(initialValue)
	useEffect(() => {
		const sub = obs.subscribe({
			next: (data) => {
				set(data)
			},
		})
		return () => {
			P.canFail(() => sub.unsubscribe())
		}
	}, [obs])
	if (obs instanceof BehaviorSubject) {
		return data as any
	}
	return data as any
}

export function useObservableEvent<R>(obs: Observable<R>, fn: (data: R) => void, deps: any[]) {
	React.useEffect(() => {
		const subscription = obs
			.pipe(
				tap((data) => {
					fn(data)
				})
			)
			.subscribe()
		return () => {
			subscription.unsubscribe()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [obs, fn, ...deps])
}
