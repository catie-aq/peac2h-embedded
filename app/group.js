import React, { useState } from "react";

import {Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Link, Tooltip} from "@nextui-org/react";
import Session from "./session";
import useSWR from 'swr'
import { useSWRConfig } from "swr"
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';
import { convertResultsToCSVGroup, downloadCSVGroup } from "@/js_to_csv";
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { useCollapse } from "react-collapsed";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function Group({group, g_idx, studyId, showGroup}) {
  const { mutate } = useSWRConfig()

  const [userId, setuserId] = useState(''); // Declare a state variable...
  const [userKey, setUserKey] = useState(0); // Declare a state variable...
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const { data, error, isLoading }= useSWR('http://localhost:3003/subjects/?group=' + g_idx + '&studyId=' + studyId, fetcher)
  const { data: allSubjects, error: allSubjectsError, isLoading: allSubjectsLoading, mutate: mutateAllSubjects} = useSWR('http://localhost:3003/subjects/?studyId=' + studyId, fetcher);
  const [subjectList, setSubjectList] = useState(''); // Declare a state variable...

  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({
    defaultExpanded: showGroup,
  });
 
  if (error || allSubjectsError){ 
     return <div>échec du chargement</div>
  }
  if (isLoading || allSubjectsLoading) {
    return <div>chargement...</div>
  } 

  let subjects = data;

  
  let createSubject = async function() {
    const alreadyExists = allSubjects.some(subject => 
      subject.name === userId &&
      subject.studyId === studyId
    );
    
    if (alreadyExists) {
      // console.log("Subject already exists");
      // 2. On termine la fonction, donc on NE fait PAS de fetch
      return;
    }

    
    fetch(`http://localhost:3003/subjects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userId, // name instead of id to avoid duplicate ids within multiple studies, maybe to reconsider
        group: g_idx,
        studyId: studyId
      })
    })
      .then(response => response.json())
      .then(data => { 
        // console.log("Creation", data)

        // Ask for revalidation
        setuserId("");
        mutateAllSubjects();
        mutate(`http://localhost:3003/subjects/?group=` + g_idx + '&studyId=' + studyId)
      })  
      .catch(error => console.error(error));

      return "ok";

  }

  function CreateSubjectButton() {
    const { enqueueSnackbar } = useSnackbar();
  
    function handleClickVariant(variant, message){
      // variant could be success, error, warning, info, or default
      enqueueSnackbar(message, { variant });
    };

    return (
      <Button onClick={async () => {
        let res = await createSubject();
        if(res == "ok"){
          handleClickVariant('success','Sujet créé !');
        }
        else{
          handleClickVariant('error','Erreur lors de la création ! : ' + "Sujet déjà existant");
        }
        
      }} size="md">
          créer
      </Button> 
    )
  }

  // Order by position
  // thanks https://stackoverflow.com/questions/43572436/sort-an-array-of-objects-in-react-and-render-them
  let time_periods = [].concat(group["time_periods"]).sort((a, b) => a["position"] > b["position"] ? 1 : -1)

  let DownloadGroupResultButton = (<></>)

  if (time_periods.length === 1) {
    const session = time_periods[0]["position"]
    DownloadGroupResultButton = (
      <Tooltip content="Télécharger les résultats de tous les sujets de ce groupe" placement="top" appendTo={document.body}>
        <button onClick={() => downloadCSVGroup(subjects, g_idx, session)}><FileDownloadIcon/></button>
      </Tooltip>)
  }
  else {
    DownloadGroupResultButton = (
      <Tippy
        interactive 
        trigger="click"
        placement="top"
        appendTo={document.body}
        content={
          <div className="flex flex-col gap-2">
          {time_periods.map((time_period, t_idx) => (
            <button key={t_idx} onClick={() => downloadCSVGroup(subjects, g_idx, time_period["position"])}>{time_period.name}</button>
          ))}
          </div>
        }
        >
        <button>
          <FileDownloadIcon/>
        </button>
      </Tippy>
    )
  }

  async function deleteSubject(subjectId) {
    fetch(`http://localhost:3003/subjects/${subjectId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => { 
        console.log("Deleted", data)
        mutate(`http://localhost:3003/subjects/?group=${g_idx}&studyId=${studyId}`)
        mutate(`http://localhost:3003/subjects/?studyId=${studyId}`)
      })
      .catch((error) => {
        console.error('Error:', error);
        return error;
      });
      return "ok"
  }

  function OpenModal(subject) {
    setOpen(true);
    setSelectedSubject(subject);
  }

  function SubjectManagement(subject) {

    const handleClose = () => {
      setOpen(false);
    }

    function DeleteSubjectButton() {
        const { enqueueSnackbar } = useSnackbar();
          
        function handleClickVariant(variant, message){
          // variant could be success, error, warning, info, or default
          enqueueSnackbar(message, { variant });
        };
    
        return (
          <Button 
            className="white-button"
            onClick={async () => {
              if(window.confirm("La suppression du sujet entraîne la suppresion de ses données. Voulez-vous vraiment supprimer ce sujet ?")){
                let res = await deleteSubject(subject["id"]);
                setOpen(false);
                if(res == "ok"){
                  
                  handleClickVariant('info','Sujet supprimé !');
                }
                else{
                  handleClickVariant('error','Erreur lors de la suppression');
                }
              }
            }}>
              Supprimer le sujet
          </Button>
        )
      }

    

    if (subject === null) {
      return
    }
    else {
      return (
        <Dialog 
          maxWidth={"lg"}
          open={open}
          onClose={handleClose}>
          <DialogTitle>
            <div className="study-card-header">
              <span></span>
              <div className="flex flex-col items-center">
                <h3 className="bold-text">{group["name"]}</h3>
                <h3 className="flex justify-end mr-4"> Sujet {subject["name"]}  </h3>
              </div>
              
            </div>
          </DialogTitle>
          <DialogContent style={{ overflow: "visible" }}>
            {/* <div className="file-upload m-4">
              helooooo {subject["name"]}
            </div>
            
            <div className="flex gap-4 justify-center">
              
            </div>         */}
            <div className="flex flex-col gap-4">
              { time_periods.map((time_period, t_idx) => {
                return (
                  // <div className="flex gap-4 justify-center">
                  //   <h3>Session {t_idx}</h3>
                  //   <h3>{time_period["name"]}</h3>
                  //   <span>progress bar</span>
                  //   <Link href={`/survey?studyId=${studyId}&group=${g_idx}&session=${t_idx}&subject=${subject["id"]}`} target="_blank">
                  //     <Button size="sm">
                  //       passer l'étude
                  //     </Button> 
                  //   </Link>
                  // </div>
                  <Session key={t_idx} session={time_period} s_idx={time_period["position"]} group={group} 
                            g_idx={g_idx} subjects={subjects} studyId={studyId} subject={subject}>
                  </Session>
                  // <div key={t_idx}>
                  //   <Session session={time_period} s_idx={time_period["position"]} group={group} 
                  //             g_idx={g_idx} subjects={subjects} studyId={studyId} subject={subject}> 
                  //   </Session>
                  // </div>
                )
              })}
            </div>
            <div className="flex justify-center mt-4">
              <DeleteSubjectButton/>
            </div>
            
            
          </DialogContent>
        </Dialog>
      )
    }
    
  }
  

  return (
    <>

      <Card className="mb-8 mt-4">
        <CardHeader className="flex justify-between gap-3 items-start">
          <div>
            <h3>Groupe {group.position}</h3>
            <div className="flex gap-2">
              <h2 className="text-lg bold-text"> {group["name"]}  </h2>
              {DownloadGroupResultButton}
            </div>
          </div>
        
        
        <button {...getToggleProps()} className="flex items-start">
          {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
        </button>
  
        </CardHeader> 
        {/* <Divider/> */}
        {/* <CardBody > */}
          {/* <h3 className="text-sm font-light"> Liste de sujets existants </h3> */}
          {/* {Demo} */}

          {/* <div className="flex gap-2 flex-wrap">
            { group["subjects"].map((subject, s_idx) => {
              return (
                <div key={{s_idx}}>
                  {subject["name"]}
                </div>
              )
            })}
          </div> */}

          {/* <Divider/> */}
          {/* <h3 className="text-sm font-light"> Liste de sujets </h3>  */}
          <div {...getCollapseProps()}>
            {SubjectManagement(selectedSubject)}


            <div key={g_idx} className="flex gap-10 flex-wrap ml-4" >
              { subjects.map((subject, s_idx) => { 
                return ( 
                  // <Tippy key={s_idx} content="Voir le sujet dans la base de données">
                  //   <Link href={`http://localhost:3003/subjects/` + subject["id"]}> 
                  //     <div className="text-md">
                  //       { subject["name"] }
                  //     </div> 
                  //   </Link>
                    
                  // </Tippy>
                  <Button key={s_idx} onClick={() => {OpenModal(subject)}}>{subject["name"]}</Button>
                ) 
                }) 
              }
            </div>

            <div className="flex gap-4 items-center mt-2 ml-4 mb-4"> {/* less collapse lag when margin are here... */}
                      
              <Input
                label="ID participant"
                value={userId}
                onChange={e => setuserId(e.target.value)}
                // defaultValue="S01"
                className="max-w-xs"
              />
              <CreateSubjectButton/>
              
            
            </div>
          </div>

          

          

          {/* <div className="flex gap-4 items-center">
          
            <Input
              label="ID participant"
              value={userId}
              onChange={e => setuserId(e.target.value)}
              // defaultValue="S01"
              className="max-w-xs"
            />
            <CreateSubjectButton/>
            
          </div> */}
        {/* </CardBody> */}
        
        {/* <Divider/> */}
        {/* <CardFooter>

          
          </CardFooter> */}
        
      </Card>
      

      {/* <div className='flex flex-wrap justify-center gap-4'>
        { time_periods.map((time_period, t_idx) => { 
          return ( 
            <div key={t_idx}>
              <Session session={time_period} s_idx={time_period["position"]} group={group} 
                        g_idx={g_idx} subjects={subjects} studyId={studyId}> 
              </Session>
            </div>
          ) 
          }) 
        }
      </div> */}
    </>
  );
}