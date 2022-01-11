import { useEffect, useState } from 'react'
import { Backdrop, CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Axios from 'axios'

import Board from "react-trello";
import { createTranslate } from 'react-trello'

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: '10px'
  },
  boardContainer: {
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

function TrelloBoardPage() {

  const classes = useStyles()
  const [boardData, setBoardData] = useState({})
  const [hasBoardData, setHasBoardData] = useState(false)
  const [currentProject, setCurrentProject] = useState({})

  const projectId = localStorage.getItem("projectId")
  const jwtToken = localStorage.getItem("jwtToken")
  const memberId = localStorage.getItem("memberId")

  const [isLoading, setLoading] = useState(false);
  const loadingBoardEnd = () => {
    setLoading(false)
  }
  const loadingBoardStart = () => {
    setLoading(true)
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

  const getTrelloData = async () => {
    const trelloBoard = currentProject.repositoryDTOList.find(repo => repo.type === 'trello')
    if (trelloBoard !== undefined) {
      try {
        const response = await sendPVSBackendRequest('GET', `/trello/board?url=${trelloBoard.url}`)
        setBoardData(response)
        setHasBoardData(true)
        loadingBoardEnd()
      } catch (e) {
        alert(e.response?.status)
        console.error(e)
        loadingBoardEnd()
      }
    }
  }

  const TEXTS = {
    "Add another lane": "NEW LANE",
    "Click to add card": "Click to add card",
    "Delete lane": "Delete lane",
    "Lane actions": "Lane actions",
    "button": {
      "Add lane": "Add lane",
      "Add card": "ADD CARD",
      "Cancel": "Cancel"
    },
    "placeholder": {
      "title": "title",
      "description": "description",
      "label": "label"
    }
  }

  useEffect(() => {
    loadingBoardStart()
    if (Object.keys(currentProject).length !== 0) {
      getTrelloData()
    }
  }, [currentProject])

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className={classes.boardContainer}>
        {hasBoardData &&
        <Board
          data={boardData}
          canAddLanes
          t={createTranslate(TEXTS)}
        />
        }
      </div>
    </div>
  );
}

export default TrelloBoardPage;
