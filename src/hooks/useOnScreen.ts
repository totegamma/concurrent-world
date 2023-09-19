import type React from 'react'
import { useState, useEffect } from 'react'

type TargetViewPosition = undefined | 'ABOVE_VIEWPORT' | 'BELOW_VIEWPORT' | 'VISIBLE'

export function useOnScreen(targetRef: React.RefObject<HTMLElement>): TargetViewPosition {
    const [targetViewPosition, setTargetViewPosition] = useState<TargetViewPosition>(undefined)

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                setTargetViewPosition('VISIBLE') // 画面内に表示中
                return
            }
            if (entry.boundingClientRect.top > 0) {
                setTargetViewPosition('BELOW_VIEWPORT') // 画面より下に表示中
            } else {
                setTargetViewPosition('ABOVE_VIEWPORT') // 画面より上に表示中
            }
        },
        {
            root: null,
            threshold: 0
        }
    )

    useEffect(() => {
        // マウント時にobserverを登録
        if (targetRef.current) observer.observe(targetRef.current)

        // アンマウント時にobserverを解除
        return () => {
            observer.disconnect()
        }
    }, [])

    return targetViewPosition
}
