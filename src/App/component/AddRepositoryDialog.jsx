import {useEffect, useState} from 'react'
import Axios from 'axios'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel
} from '@material-ui/core'

import InputAdornment from '@material-ui/core/InputAdornment';
import {SiGithub, SiSonarqube, SiGitlab} from 'react-icons/si'

export default function AddRepositoryDialog({open, reloadProjects, handleClose, projectId}) {
  const [repositoryURL, setRepositoryURL] = useState("")
  const [repoType, setRepoType] = useState("")
  const [githubRepositoryURL, setGithubRepositoryURL] = useState("")
  const [gitlabRepositoryURL, setGitlabRepositoryURL] = useState("")
  const [sonarRepositoryURL, setSonarRepositoryURL] = useState("")
  const setIsGithubAvailable = useState(false)[1]
  const setIsGitlabAvailable = useState(false)[1]
  const setIsSonarAvailable = useState(false)[1]
  const jwtToken = localStorage.getItem("jwtToken")

  const [showGithubDiv, setShowGithubDiv] = useState(false)
  const [showGitlabDiv, setShowGitlabDiv] = useState(false)
  const [showSonarDiv, setShowSonarDiv] = useState(false)

  const addRepository = () => {
    let checker = []
    if (githubRepositoryURL === "" && sonarRepositoryURL === "" && gitlabRepositoryURL === "") {
      alert("不準啦馬的>///<")
    } else {

      if (githubRepositoryURL !== "") {
        checker.push(checkGithubRepositoryURL());
      }
      if (gitlabRepositoryURL !== "") {
        checker.push(checkGitlabRepositoryURL());
      }
      if (sonarRepositoryURL !== "") {
        checker.push(checkSonarRepositoryURL());
      }

      Promise.all(checker)
        .then((response) => {
          if (response.includes(false) === false) {
            let payload = {
              projectId: projectId,
              repositoryURL: repositoryURL
            }

            Axios.post(`http://localhost:9100/pvs-api/project/${projectId}/repository/${repoType}`, payload,
              {headers: {"Authorization": `${jwtToken}`}})
              .then(() => {
                reloadProjects()
                handleClose()
              })
              .catch((e) => {
                alert(e.response.status)
                console.error(e)
              })
          }
        }).catch((e) => {
        alert(e.response.status)
        console.error(e)
      })
    }
  }

  const checkGithubRepositoryURL = () => {
    return Axios.get(`http://localhost:9100/pvs-api/repository/github/check?url=${githubRepositoryURL}`,
      {headers: {"Authorization": `${jwtToken}`}})
      .then(() => {
        setIsGithubAvailable(true);
        return true
      })
      .catch(() => {
        alert("github error")
        return false
      })
  }

  const checkGitlabRepositoryURL = () => {
    return Axios.get(`http://localhost:9100/pvs-api/repository/gitlab/check?url=${gitlabRepositoryURL}`,
      {headers: {"Authorization": `${jwtToken}`}})
      .then(() => {
        setIsGitlabAvailable(true);
        return true
      })
      .catch(() => {
        alert("gitlab error")
        return false
      })
  }

  const checkSonarRepositoryURL = () => {
    return Axios.get(`http://localhost:9100/pvs-api/repository/sonar/check?url=${sonarRepositoryURL}`,
      {headers: {"Authorization": `${jwtToken}`}})
      .then(() => {
        setIsSonarAvailable(true);
        return true
      })
      .catch((e) => {
        alert("sonar error")
        console.error(e)
        return false
      })
  }

  const onClick1 = () => {
    setShowGithubDiv(true)
    setShowGitlabDiv(false)
    setShowSonarDiv(false)
  }
  const onClick2 = () => {
    setShowSonarDiv(true)
    setShowGithubDiv(false)
    setShowGitlabDiv(false)
  }
  const onClick3 = () => {
    setShowGitlabDiv(true)
    setShowGithubDiv(false)
    setShowSonarDiv(false)
  }

  const close = () => {
    setShowGithubDiv(false)
    setShowGitlabDiv(false)
    setShowSonarDiv(false)
    handleClose()
  }

  const add = () => {
    setShowGithubDiv(false)
    setShowGitlabDiv(false)
    setShowSonarDiv(false)
    addRepository()
  }

  const GithubDiv = () => (
    <div id="githubDiv">
        <TextField
          margin="dense"
          id="GithubRepositoryURL"
          label="Github Repository URL"
          type="text"
          fullWidth
          onChange={(e) => {
            setGithubRepositoryURL(e.target.value)
            setRepositoryURL(e.target.value)
            setRepoType("github")
          }}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SiGithub/>
              </InputAdornment>
            ),
          }}
        />
    </div>
  )

  const GitlabDiv = () => (
      <div id="gitlabDiv">
          <TextField
            margin="dense"
            id="GitlabRepositoryURL"
            label="Gitlab Repository URL"
            type="text"
            fullWidth
            onChange={(e) => {
              setGitlabRepositoryURL(e.target.value)
              setRepositoryURL(e.target.value)
              setRepoType("gitlab")
            }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SiGitlab/>
                </InputAdornment>
              ),
            }}
          />
      </div>
  )

  const SonarDiv = () => (
    <div id = "sonarDiv">
        <TextField
          margin="dense"
          id="SonarRepositoryURL"
          label="Sonar Repository URL"
          type="text"
          fullWidth
          onChange={(e) => {
            setSonarRepositoryURL(e.target.value)
            setRepositoryURL(e.target.value)
            setRepoType("sonar")
          }}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SiSonarqube/>
              </InputAdornment>
            ),
          }}
        />
    </div>
  )

  useEffect(() => {
    setRepositoryURL("")
    setRepoType("")
    setGithubRepositoryURL("")
    setGitlabRepositoryURL("")
    setSonarRepositoryURL("")
  }, [open])

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Add Repository</DialogTitle>
      <DialogContent>
        <DialogContentText>
            To add a repository, please select a repository type and enter the repository URL.
        </DialogContentText>

        <FormControl component="fieldset">
          <FormLabel component="legend" />
          <RadioGroup row aria-label="repoType" name="row-radio-buttons-group">
            <FormControlLabel value="gitlab" control={<Radio />} onClick={onClick1} label="GitHub" />
            <FormControlLabel value="github" control={<Radio />} onClick={onClick3} label="GitLab" />
            <FormControlLabel value="sonar" control={<Radio />} onClick={onClick2} label="SonarQube" />
            <FormControlLabel
              value="disabled"
              disabled
              control={<Radio />}
              label="other"
            />
          </RadioGroup>
        </FormControl>
        <div>
            {showGithubDiv ? <GithubDiv /> : null}
            {showGitlabDiv ? <GitlabDiv /> : null}
            {showSonarDiv ? <SonarDiv /> : null}
        </div>

      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="secondary">
          Cancel
        </Button>
        <Button onClick={add} color="primary" id="AddRepositoryBtn">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
