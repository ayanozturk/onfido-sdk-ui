import { h, FunctionComponent } from 'preact'
import { useEffect, useRef } from 'preact/compat'
import { useSelector } from 'react-redux'
import classNames from 'classnames'

import style from './style.scss'

import type { RootState } from '~types/redux'

type Props = {
  className?: string
  smaller?: boolean
  subTitle?: string
  title: string
}

const PageTitle: FunctionComponent<Props> = ({
  title,
  subTitle,
  smaller,
  className,
}) => {
  const isFullScreen = useSelector<RootState, boolean | undefined>(
    (state) => state.globals.isFullScreen
  )
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    containerRef.current && containerRef.current.focus()
  }, [title, subTitle])

  return (
    <div
      className={classNames(
        style.titleWrapper,
        {
          [style.smaller]: smaller && !isFullScreen,
          [style.fullScreen]: isFullScreen,
        },
        className
      )}
    >
      <div
        className={style.title}
        role="heading"
        aria-level="1"
        aria-live="assertive"
      >
        <span className={style.titleSpan} tabIndex={-1} ref={containerRef}>
          {title}
        </span>
      </div>
      {subTitle && (
        <div className={style.subTitle} role="heading" aria-level="2">
          {subTitle}
        </div>
      )}
    </div>
  )
}

export default PageTitle
