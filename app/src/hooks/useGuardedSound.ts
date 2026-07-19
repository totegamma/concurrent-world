import useSound from 'use-sound'
import { useCallback } from 'react'
import { type HookOptions, type PlayOptions, type ReturnedValue } from 'use-sound/dist/types'

// バックグラウンドタブではAudioContextがsuspendされ、howlerがplay要求を
// 内部キューに溜めて復帰時に一斉再生してしまうため、hidden中は再生要求自体を捨てる
export function useGuardedSound(src: string | string[], options?: HookOptions): ReturnedValue {
    const [play, exposed] = useSound(src, options)

    const guardedPlay = useCallback(
        (opts?: PlayOptions): void => {
            if (document.hidden) return
            play(opts)
        },
        [play]
    )

    return [guardedPlay, exposed]
}
