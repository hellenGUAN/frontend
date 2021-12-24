import {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import ProjectAvatar from './ProjectAvatar'
import DrawingBoard from './DrawingBoard'
import Axios from 'axios'
import moment from 'moment'
import {Backdrop, CircularProgress} from '@material-ui/core'
import {connect} from 'react-redux';


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
    minWidth: '30px',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}))

function PullRequestsPage(prop) {
  const classes = useStyles()
  const [pullRequestListData, setPullRequestListData] = useState([])
  const [dataForPullRequestChart, setDataForPullRequestChart] = useState({labels: [], data: {opened: [], closed: [], merged: []}})

  const [currentProject, setCurrentProject] = useState({})

  const projectId = localStorage.getItem("projectId")
  const jwtToken = localStorage.getItem("jwtToken")

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  useEffect(() => {
    Axios.get(`http://localhost:9100/pvs-api/project/1/${projectId}`,
      {headers: {"Authorization": `${jwtToken}`}})
      .then((response) => {
        setCurrentProject(response.data)
      })
      .catch((e) => {
        alert(e.response.status)
        console.error(e)
      })
  }, [])

  useEffect(() => {
    if (Object.keys(currentProject).length !== 0) {
      handleToggle()
      const githubRepo = currentProject.repositoryDTOList.find(repo => repo.type === 'github')
      const query = githubRepo.url.split("github.com/")[1]

      // todo need reafctor with async
      Axios.get(`http://localhost:9100/pvs-api/github/pullRequests/${query}`,
        {headers: {"Authorization": `${jwtToken}`}})
        .then((response) => {
          if(response.data !== undefined) {
            setPullRequestListData(response.data)
          }
          handleClose()
        })
        .catch((e) => {
          alert(e.response.status);
          console.error(e)
        })
    }
  }, [currentProject, prop.startMonth, prop.endMonth])

  useEffect(() => {
    const {endMonth} = prop
    let chartDataset = {labels: [], data: {merged: [], closed: [], opened: []}}
    const closedPullRequestListData = []
    const mergedPullRequestListData = []
    for(const pr in pullRequestListData) {
      if(pr !== null) {
        console.log(pr)
        closedPullRequestListData.push(pr)
      }
      if(pr.mergedAt !== null) {
        mergedPullRequestListData.push(pr)
      }
    }

    pullRequestListData.sort((a, b) => a.createdAt - b.createdAt)
    closedPullRequestListData.sort((a, b) => a.closedAt - b.closedAt)
    mergedPullRequestListData.sort((a, b) => a.mergedAt - b.mergedAt)

    console.log(closedPullRequestListData)

    if (pullRequestListData.length > 0) {
      for (let month = moment(pullRequestListData[0].createdAt); month < moment(endMonth).add(1, 'months'); month = month.add(1, 'months')) {
        let index
        chartDataset.labels.push(month.format("YYYY-MM"))

        index = pullRequestListData.findIndex(pullRequest => {
          return moment(pullRequest.createdAt).format("YYYY-MM") === month.format("YYYY-MM")
        })
        chartDataset.data.opened.push(index === pullRequestListData.length ? 0 : index)

        index = closedPullRequestListData.findIndex(pullRequest => {
          return moment(pullRequest.closedAt).format("YYYY-MM") === month.format("YYYY-MM")
        })
        chartDataset.data.closed.push(index === -1 ? pullRequestListData.length : index)

        index = mergedPullRequestListData.findIndex(pullRequest => {
          return moment(pullRequest.mergedAt).format("YYYY-MM") === month.format("YYYY-MM")
        })
        chartDataset.data.merged.push(index === -1 ? pullRequestListData.length : index)
      }
    }

//     for (let month = moment(pullRequestListData[0].createdAt); month <= moment(endMonth).add(1, 'months'); month = month.add(1, 'months')) {
//       let index
//       chartDataset.labels.push(month.format("YYYY-MM"))
//
//       index = pullRequestListData.findIndex(pullRequest => {
//         return moment(pullRequest.createdAt).year() >= month.year() && moment(pullRequest.createdAt).month() > month.month()
//       })
//       chartDataset.data.opened.push(index === -1 ? pullRequestListData.length : index)
//
//       index = pullRequestListData.findIndex(pullRequest => {
//         return pullRequest.closedAt != null && (moment(pullRequest.closedAt).year() > month.year() || moment(pullRequest.closedAt).year() === month.year()) && moment(pullRequest.closedAt).month() > month.month()
//       })
//       chartDataset.data.closed.push(index === -1 ? pullRequestListData.length : index)
//
//       index = pullRequestListData.findIndex(pullRequest => {
//         return pullRequest.mergedAt != null && (moment(pullRequest.mergedAt).year() > month.year() || moment(pullRequest.mergedAt).year() === month.year()) && moment(pullRequest.mergedAt).month() > month.month()
//       })
//       chartDataset.data.merged.push(index === -1 ? pullRequestListData.length : index)
//     }

    console.log(pullRequestListData)
    setDataForPullRequestChart(chartDataset)
  }, [pullRequestListData, prop.endMonth])

  return (
    <div style={{marginLeft: "10px"}}>
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit"/>
      </Backdrop>
      <div className={classes.root}>
        <ProjectAvatar
          size="small"
          project={currentProject}
        />
        <p>
          <h2>{currentProject.projectName}</h2>

        </p>
      </div>
      <div className={classes.root}>
        <div style={{width: "67%"}}>
          <div>
            <h1>Team</h1>
            <div>
              <DrawingBoard data={dataForPullRequestChart} color='skyblue' id="team-issue-chart" isIssue={true}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    endMonth: state.selectedMonth.endMonth
  }
}

export default connect(mapStateToProps)(PullRequestsPage);
