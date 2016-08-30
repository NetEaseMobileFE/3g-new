// 消息体 -> 引用
export default function Quote(props) {
  return (
    <div className="quote">
      <div className="quote-user ellipsis">{ '回复用户： ' + props.info.nick_name}</div>
      <div>{props.info.msg}</div>
    </div>
  )
}