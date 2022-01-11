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

function DuplicationsPage(prop) {
  const classes = useStyles()
  const [duplicationList, setDuplicationList] = useState([])
  const [currentProject, setCurrentProject] = useState(undefined)
  const [duplicationUrl, setDuplicationUrl] = useState("")
  const [dataForDuplicationChart, setDataForDuplicationChart] = useState({labels: [], data: {duplication: []}})

  const projectId = localStorage.getItem("projectId")
  const jwtToken = localStorage.getItem("jwtToken")
  const memberId = localStorage.getItem("memberId")

  const [isLoading, setLoading] = useState(false)
  const loadingDuplicationEnd = () => {
    setLoading(false)
  }
  const loadingDuplicationStart = () => {
    setLoading(!isLoading)
  }

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

  const getDuplicationData = async () => {
    let repositoryDTO = currentProject.repositoryDTOList.find(x => x.type === "sonar")
    let sonarComponent = repositoryDTO.url.split("id=")[1]
    setDuplicationUrl(`https://sonarcloud.io/component_measures?id=${sonarComponent}&metric=Duplications&view=list`)
    try {
      const response = await sendPVSBackendRequest('GET', `/sonar/${sonarComponent}/duplication`)
      setDuplicationList(response)
    } catch (e) {
      alert(e.response?.status)
      console.error(e)
    }
  }

  useEffect(() => {
    loadingDuplicationStart()
    if (currentProject !== undefined) {
      getDuplicationData()
    }
  }, [currentProject])

  const getDatasetForChart = () => {
    let dataset = {labels: [], data: {duplication: []}}
    duplicationList.forEach(duplication => {
      dataset.labels.push(moment(duplication.date).format("YYYY-MM-DD HH:mm:ss"))
      dataset.data.duplication.push(duplication.value)
    })
    return dataset
  }

  useEffect(() => {
    const chartDataset = getDatasetForChart()
    setDataForDuplicationChart(chartDataset)
    loadingDuplicationEnd()
  }, [duplicationList, prop.startMonth, prop.endMonth])

  return (
    <div style={{marginLeft: "10px"}}>
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit"/>
      </Backdrop>
      <div className={classes.root}>
        {currentProject && <ProjectAvatar
          size="small"
          project={currentProject}
        />}
        <p>
          <h2 id="number-of-sonar">{currentProject ? currentProject.projectName : ""}</h2>
        </p>
      </div>
      <h2><a href={duplicationUrl}
             target="blank">{dataForDuplicationChart.data.duplication[dataForDuplicationChart.data.duplication.length - 1]}%</a>
      </h2>
      <div className={classes.root}>
        <div style={{width: "67%"}}>
          <div>
            <h1>Duplications</h1>
            <div>
              <DrawingBoard data={dataForDuplicationChart} maxBoardY={100} id="duplications-chart"/>
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

export default connect(mapStateToProps)(DuplicationsPage)
