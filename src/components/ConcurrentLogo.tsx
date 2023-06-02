import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const spin = keyframes`
  from {
    transform: rotate(0deg)
  }

  to {
    transform: rotate(360deg)
  }
`

const Ring = styled.path`
    transform-origin: center;
    animation: ${spin} 1s ease infinite;
`

export interface ConcurrentLogoProps {
    size: string
    upperColor: string
    lowerColor: string
    frameColor: string
    spinning?: boolean
}

export function ConcurrentLogo(props: ConcurrentLogoProps): JSX.Element {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            style={{ width: props.size, height: props.size }}
        >
            <polygon
                id="elem1"
                points="418.2 927.35 945.13 1102.99 1472.06 576.06 418.2 927.35"
                style={{ fill: props.upperColor }}
            />
            <polygon
                id="elem2"
                points="1472.06 576.06 945.13 1102.99 1120.77 1629.92 1472.06 576.06"
                style={{ fill: props.lowerColor }}
            />
            <Ring
                id="elem3"
                d="m1024,1971.49c-127.86,0-251.96-25.07-368.84-74.5-112.84-47.73-214.16-116.03-301.14-203.01s-155.28-188.3-203.01-301.14c-49.44-116.88-74.5-240.98-74.5-368.84s25.07-251.96,74.5-368.84c47.73-112.84,116.03-214.16,203.01-301.14s188.3-155.28,301.14-203.01c116.88-49.44,240.98-74.5,368.84-74.5v220c-401.14,0-727.49,326.35-727.49,727.49s326.35,727.49,727.49,727.49,727.49-326.35,727.49-727.49h220c0,127.86-25.07,251.96-74.5,368.84-47.73,112.84-116.03,214.16-203.01,301.14s-188.3,155.28-301.14,203.01c-116.88,49.44-240.98,74.5-368.84,74.5Z"
                style={{ fill: props.frameColor, animationPlayState: props.spinning ? 'running' : 'paused' }}
            />
        </svg>
    )
}
