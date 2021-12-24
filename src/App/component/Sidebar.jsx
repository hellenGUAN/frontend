import {useEffect, useState} from 'react'
import logo_p from '../../assets/p.png'
import logo_v from '../../assets/v.png'
import logo_s from '../../assets/s.png'
import {useHistory} from 'react-router-dom'
import {
  ExitToApp,
  ArrowBack,
  ExpandLess,
  ExpandMore,
  Code,
  GpsFixed
//   Merge
} from '@material-ui/icons'
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CssBaseline,
  AppBar,
  Toolbar,
  Divider,
  Collapse,
  IconButton
} from '@material-ui/core'
import {AiFillBug} from 'react-icons/ai'
import {IoGitCommitSharp, IoNuclear} from 'react-icons/io5'
import {GoIssueOpened} from 'react-icons/go'
import {HiDocumentDuplicate} from 'react-icons/hi'
import {SiGithub, SiSonarqube} from 'react-icons/si'
import {RiDashboardFill} from 'react-icons/ri'
// import MergeIcon from '@mui/icons-material/Merge';
import clsx from 'clsx'
import {MuiPickersUtilsProvider, DatePicker} from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import {makeStyles} from '@material-ui/core/styles'
import {connect} from 'react-redux'
import {setStartMonth, setEndMonth} from '../../redux/action'
import Axios from 'axios'

const drawerWidth = 240
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  drawerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  list: {
    height: 'calc(100%)',
    width: 'auto'
  },

  logout: {
    position: 'absolute',
    right: 0
  },
  menuList: {
    height: 'calc(100%)',
  },
  monthSelector: {
    width: 204,
    padding: theme.spacing(0, 3, 0),
  },
  innerList: {
    backgroundColor: "#fafafa"
  }
}))

function Sidebar(prop) {
  //todo seperate sidebar and appbar~~~

  const open = useState(true)[0]
  const history = useHistory()
  const classes = useStyles()
  const [currentProject, setCurrentProject] = useState(undefined)
  const [githubMenuOpen, setGithubMenuOpen] = useState(true)
  const [sonarMenuOpen, setSonarMenuOpen] = useState(true)

  const list = () => (
    <div className={classes.list} role="presentation">
      <List className={classes.menuList} width="inher">
        {prop.currentProjectId !== 0 &&
        <div>

          <ListItem button onClick={goToSelect}>
            <ListItemIcon>
              <ArrowBack/>
            </ListItemIcon>
            <ListItemText primary="Select"/>
          </ListItem>


          <Divider className={classes.divider}/>
          <ListItem button onClick={goToDashBoard}>
            <ListItemIcon>
              <RiDashboardFill size={30}/>
            </ListItemIcon>
            <ListItemText primary="DashBoard"/>
          </ListItem>
          <Divider className={classes.divider}/>

          {currentProject &&
          currentProject.repositoryDTOList.find(x => x.type === "github") &&
          <div>
            <ListItem button onClick={() => {
              setGithubMenuOpen(!githubMenuOpen)
            }}>
              <ListItemIcon>
                <SiGithub size={30}/>
              </ListItemIcon>
              <ListItemText primary="GitHub"/>
              {githubMenuOpen ? <ExpandLess/> : <ExpandMore/>}
            </ListItem>

            <Divider/>
            <Collapse in={githubMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding className={classes.innerList}>
                <ListItem button className={classes.nested} onClick={goToCommit}>
                  <ListItemIcon>
                    <IoGitCommitSharp size={24.5}/>
                  </ListItemIcon>
                  <ListItemText primary="Commits"/>
                </ListItem>

                <ListItem button className={classes.nested} onClick={goToIssue}>
                  <ListItemIcon>
                    <GoIssueOpened size={24.5}/>
                  </ListItemIcon>
                  <ListItemText primary="Issues"/>
                </ListItem>

                <ListItem button className={classes.nested} onClick={goToPullRequest}>
                  <ListItemIcon>
                    <GoIssueOpened size={24.5}/>
                  </ListItemIcon>
                  <ListItemText primary="Pull Request"/>
                </ListItem>

                <ListItem button className={classes.nested} onClick={goToCodeBase}>
                  <ListItemIcon>
                    <Code/>
                  </ListItemIcon>
                  <ListItemText primary="Code Base"/>
                </ListItem>
              </List>
            </Collapse>
          </div>
          }

          {currentProject &&
          currentProject.repositoryDTOList.find(x => x.type === "sonar") &&
          <div>
            <Divider className={classes.divider}/>
            <ListItem button onClick={() => {
              setSonarMenuOpen(!sonarMenuOpen)
            }}>

              <ListItemIcon>
                <SiSonarqube size={30}/>
              </ListItemIcon>
              <ListItemText primary="SonarQube"/>
              {sonarMenuOpen ? <ExpandLess/> : <ExpandMore/>}
            </ListItem>
            <Divider/>
            <Collapse in={sonarMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding className={classes.innerList}>
                <ListItem button onClick={goToCodeCoverage}>
                  <ListItemIcon>
                    <GpsFixed/>
                  </ListItemIcon>
                  <ListItemText primary="Code Coverage"/>
                </ListItem>

                <ListItem button onClick={goToBug}>
                  <ListItemIcon>
                    <AiFillBug size={24.5}/>
                  </ListItemIcon>
                  <ListItemText primary="Bugs"/>
                </ListItem>

                <ListItem button onClick={goToCodeSmell}>
                  <ListItemIcon>
                    <IoNuclear size={24.5}/>
                  </ListItemIcon>
                  <ListItemText primary="Code Smells"/>
                </ListItem>

                <ListItem button onClick={goToDuplication}>
                  <ListItemIcon>
                    <HiDocumentDuplicate size={24.5}/>
                  </ListItemIcon>
                  <ListItemText primary="Duplications"/>
                </ListItem>
              </List>
              <Divider/>
            </Collapse>
          </div>
          }
        </div>
        }
      </List>
    </div>
  )

  const logout = () => {
    localStorage.clear()
    history.push('/login')
  }

  const goToSelect = () => {
    history.push("/select")
  }

  const goToDashBoard = () => {
    history.push("/dashboard")
  }

  const goToCommit = () => {
    history.push("/commits")
  }

  const goToIssue = () => {
    history.push("/issues")
  }

  const goToPullRequest = () => {
    history.push("/pull_request")
  }

  const goToCodeBase = () => {
    history.push("/codebase")
  }

  const goToCodeCoverage = () => {
    history.push("/code_coverage")
  }

  const goToBug = () => {
    history.push("/bugs")
  }

  const goToCodeSmell = () => {
    history.push("/code_smells")
  }

  const goToDuplication = () => {
    history.push("/duplications")
  }

  const jwtToken = localStorage.getItem("jwtToken")

  useEffect(() => {
    if (prop.currentProjectId !== 0) {
      Axios.get(`http://localhost:9100/pvs-api/project/1/${prop.currentProjectId}`,
        {headers: {"Authorization": `${jwtToken}`}})
        .then((response) => {
          setCurrentProject(response.data)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [prop.currentProjectId])

  return (
    <div className={classes.root}>
      <CssBaseline/>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <img src={logo_p} alt={""}/>
          <img src={logo_v} alt={""}/>
          <img src={logo_s} alt={""}/>
          <div className={classes.monthSelector}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <DatePicker className={classes.datepicker}
                          fullWidth
                          focused={false}
                          openTo="year"
                          views={["year", "month"]}
                          label="Start Month and Year"
                          value={prop.startMonth}
                          onChange={prop.setStartMonth}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className={classes.monthSelector}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <DatePicker
                fullWidth
                focused={false}
                openTo="year"
                views={["year", "month"]}
                label="End Month and Year"
                value={prop.endMonth}
                onChange={prop.setEndMonth}
              />
            </MuiPickersUtilsProvider>
          </div>
          <IconButton className={classes.logout} onClick={logout}>
            <ExitToApp/>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.drawerContent}/>
        <Divider/>
        {list()}
      </Drawer>
      <main className={classes.content}>
        <div className={classes.drawerContent}/>
        {prop.children}
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    startMonth: state.selectedMonth.startMonth,
    endMonth: state.selectedMonth.endMonth,
    currentProjectId: state.currentProjectId
  }
}

const mapActionToProps = (dispatch) => {
  return {
    setStartMonth: (startMonth) => dispatch(setStartMonth(startMonth)),
    setEndMonth: (endMonth) => dispatch(setEndMonth(endMonth))
  }
}

export default connect(mapStateToProps, mapActionToProps)(Sidebar)
