// 消息体 -> NBA比分
export default function NBAScore(props) {
  const scores = props.item
  return <div className="nba-score">{scores.homeTeam} {scores.homeScore} : {scores.awayScore} {scores.awayTeam}</div>
}