import {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import ProjectAvatar from './ProjectAvatar'
import Axios from 'axios'
import {Backdrop, CircularProgress} from '@material-ui/core'
import {connect} from 'react-redux'
import DrawingBoard from './DrawingBoard'
import moment from 'moment'

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

function BugsPage(prop) {
  const classes = useStyles()
  const [bugList, setBugList] = useState([])
  const [currentProject, setCurrentProject] = useState(undefined)
  const [bugUrl, setBugUrl] = useState("")
  const [dataForBugChart, setDataForBugChart] = useState({labels: [], data: {bug: []}})

  const projectId = localStorage.getItem("projectId")
  const [open, setOpen] = useState(false)
  const handleClose = () => {
    setOpen(false)
  }
  const handleToggle = () => {
    setOpen(!open)
  }

  const jwtToken = localStorage.getItem("jwtToken")
  const memberId = localStorage.getItem("memberId")

  //TODO 這邊寫死的記得要改唷!!!! >////<

  const config = {
    headers: {
      ...(jwtToken && { "Authorization": jwtToken })
    }
  }

  const sendPVSBackendRequest = async (method, url) => {
    const baseURL = 'http://localhost:9100/pvs-api'
    const requestConfig = {
      baseURL,
      url,
      method,
      config
    }
    return (await Axios.request(requestConfig))?.data
  }

  const loadInitialProjectInfo = async () => {
    try {
      const response = await sendPVSBackendRequest('GET', `/project/${memberId}/${projectId}`)
      setCurrentProject(response)
    } catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  useEffect(() => {
    loadInitialProjectInfo()
  }, [])

  const getBugData = async () => {
    let repositoryDTO = currentProject.repositoryDTOList.find(x => x.type === "sonar")
    let sonarComponent = repositoryDTO.url.split("id=")[1]
    setBugUrl(`https://sonarcloud.io/project/issues?id=${sonarComponent}&resolved=false&types=BUG`)
    try {
      const response = await sendPVSBackendRequest('GET', `/sonar/${sonarComponent}/bug`)
      setBugList(response)
    } catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  useEffect(() => {
    handleToggle()
    if (currentProject !== undefined) {
      getBugData()
    }
  }, [currentProject])

  const getDatasetForChart = () => {
    let dataset = {labels: [], data: {bug: []}}
    bugList.forEach(bug => {
      dataset.labels.push(moment(bug.date).format("YYYY-MM-DD HH:mm:ss"))
      dataset.data.bug.push(bug.value)
    })
    return dataset
  }

  useEffect(() => {
    const chartDataset = getDatasetForChart()
    setDataForBugChart(chartDataset)
    handleClose()
  }, [bugList, prop.startMonth, prop.endMonth])

  return (
    <div style={{marginLeft: "10px"}}>
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit"/>
      </Backdrop>
      <div className={classes.root}>
        {currentProject && <ProjectAvatar
          size="small"
          project={currentProject}
        />}
        <p>
          <h2>{currentProject ? currentProject.projectName : ""}</h2>
        </p>
      </div>
      <h2 id="number-of-sonar"><a href={bugUrl}
                                  target="blank">{dataForBugChart.data.bug[dataForBugChart.data.bug.length - 1]}</a>
      </h2>
      <div className={classes.root}>
        <div style={{width: "67%"}}>
          <div>
            <h1>Bugs</h1>
            <div>
              <DrawingBoard data={dataForBugChart} maxBoardY={Math.max(...dataForBugChart.data.bug) + 5}
                            id="bugs-chart"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    startMonth: state.selectedMonth.startMonth,
    endMonth: state.selectedMonth.endMonth
  }
}

export default connect(mapStateToProps)(BugsPage)
