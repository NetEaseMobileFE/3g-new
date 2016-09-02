// 消息体 -> 引用
import * as utils from './../../common/utils'
export default function Quote(props) {
  return (
    <div className="quote">
      <div className="quote-user ellipsis">{props.info.nick_name}</div>
      <div className="quote-text">{props.info.msg}</div>
      <div className="quote-time">{utils.parseTime(props.info.time)}</div>
    </div>
  )
}

