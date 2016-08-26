// 消息体 -> 新闻
export default function News(props) {
  let docid = props.href.match(/\/(.{16})\.html/)
  if(docid){
    docid = docid[1]
  }
  return <a className="news" href={'http://3g.163.com/touch/article.html?docid=' + docid}>
    {'原文：' + props.title}
  </a>
}
