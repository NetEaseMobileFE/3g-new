import * as utils from './../../common/utils'

export default class NBAHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      teamInfo: {}
    }
  }
  componentDidMount() {
    utils.importJs(this.props.url + '?jsoncallback=gameInfoCallback')
    window.gameInfoCallback = (data) => {
      window.gameInfoCallback = null
      this.setState({teamInfo: data })
    }
  }
  render() {
    if (!this.props.show) {
      return null
    }
    const teamInfo = this.state.teamInfo || {}
    const gameInfo = this.props.gameInfo || {}
    const started = this.props.started
    const style = {
      display: started ? 'block': 'none'
    }
    // 一开始不知道支持足球
    // 与篮球的区别在于统计链接
    // 变量名懒得改了~
    // 通过直播数据sportsApiUrl进行区别
    // 足球： http://goal.sports.163.com/flag/57000.json
    // 足球： http://cs.sports.163.com/flag/63925.json
    // 篮球： http://nba.sports.163.com/flag/61959.json
    let className = 'live-header live-header-nba'
    let href = `http://3g.163.com/ntes/special/00340BF8/basketballgame.html?mid=${teamInfo.mid}&cid=${teamInfo.cid}&sid=${teamInfo.sid}&source=${teamInfo.source}`
    const url = this.props.url
    if (url.match(/http\:\/\/cs|goal\./) || url.match(/football/)) {
      href = `http://3g.163.com/ntes/special/00340BF8/footballgame.html?mid=${teamInfo.mid}&cid=${teamInfo.cid}&sid=${teamInfo.sid}&source=${teamInfo.source}`
      className += ' soccer'
    }
    return (
      <div className={className}>
        <div className="teams">
          <div className="team">
            <img src={teamInfo.homeFlag} />
            <span>{teamInfo.homeName}</span>
          </div>
          <div>
            <div className="section">{gameInfo.section || ''}&nbsp;&nbsp;{this.props.userCount || 0}人参与</div>
            <div className="scores" style={style}>
              <div>{gameInfo.homeScore} - {gameInfo.awayScore}</div>
            </div>
          </div>
          <div className="team">
            <img src={teamInfo.awayFlag} />
            <span>{teamInfo.awayName}</span>
          </div>
        </div>
      </div>
    )
  }
}