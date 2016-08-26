// 消息体 -> 图集
export default function Album(props) {
  const album = props.album
  return <a className="media album" href={'http://3g.163.com/touch/photoview.html?setid=' + album.articleId + '&channelid=' + album.channelId}>
    <img src={album.coverImg} />
    <span className="tip">图集</span>
  </a>
}
