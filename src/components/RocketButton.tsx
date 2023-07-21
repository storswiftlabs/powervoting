import React, { CSSProperties } from "react"
import "./index.less"

interface Props {
  childrenText: string
  style?: CSSProperties
  onClick?: () => void
  className?: string
}

function RocketButton({ childrenText, style, onClick, className }: Props) {
  return (
    <button
      onClick={onClick}
      style={{ ...style }}
      className={`RocketButton ${className}`}
    >
      <a>{childrenText}</a>
    </button>
  )
}

export default RocketButton
