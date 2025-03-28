import React, { useState } from "react";

import {Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Link, Tooltip} from "@nextui-org/react";
import Session from "./session";
import useSWR from 'swr'
import { useSWRConfig } from "swr"
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';
import { convertResultsToCSVGroup, downloadCSVGroup } from "@/helpers/js_to_csv";
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { useCollapse } from "react-collapsed";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { createSubject, deleteSubject } from "@/helpers/subject_management";

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function Group({group, g_idx, studyId, subjects, allSubjects, mutate, showGroup}) {
  // const { mutate } = useSWRConfig()

  const [userId, setuserId] = useState(''); // Declare a state variable...
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // const { data: allSubjects, error: allSubjectsError, isLoading: allSubjectsLoading, mutate: mutateAllSubjects} = useSWR(process.env.NEXT_PUBLIC_JSON_SERVER_URL + '/subjects/?studyId=' + studyId, fetcher);

  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({
    defaultExpanded: showGroup,
  });

  const { enqueueSnackbar } = useSnackbar();
          
  function handleClickVariant(variant, message){
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(message, { variant });
  };

  function CreateSubjectButton() {

    return (
      <Button className="white-button"
      onClick={async () => {
        let res = await createSubject(allSubjects, userId, setuserId, g_idx, studyId, mutate);
        if(res == "ok"){
          handleClickVariant('success','Sujet créé !');
        }
        else{
          handleClickVariant('error','Erreur lors de la création ! : ' + res);
        }
        
      }} size="md">
          Créer
      </Button> 
    )
  }

  // Order by position
  // thanks https://stackoverflow.com/questions/43572436/sort-an-array-of-objects-in-react-and-render-them
  let time_periods = [].concat(group["time_periods"]).sort((a, b) => a["position"] > b["position"] ? 1 : -1)

  let DownloadGroupResultButton = (<></>)

  if (time_periods.length === 1) {
    const session = time_periods[0]
    DownloadGroupResultButton = (
      <Tippy content="Télécharger les résultats de tous les sujets de ce groupe" placement="top" appendTo={document.body}>
        <button onClick={() => downloadCSVGroup(subjects, g_idx, session)}><FileDownloadOutlinedIcon/></button>
      </Tippy>)
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
            <button key={t_idx} onClick={() => downloadCSVGroup(subjects, g_idx, time_period)}>{time_period.name}</button>
          ))}
          </div>
        }
        >
        <button>
        <FileDownloadOutlinedIcon fontSize="medium"/>
        </button>
      </Tippy>
    )
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
    
        return (
          <Button 
            className="white-button white-button-delete"
            onClick={async () => {
              if(window.confirm("La suppression du sujet entraîne la suppresion de ses données. Voulez-vous vraiment supprimer ce sujet ?")){
                let res = await deleteSubject(subject["id"], mutate, g_idx, studyId);
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
                <h3 className="light-text"> Sujet {subject["name"]}</h3>
              </div>
              
            </div>
          </DialogTitle>
          <DialogContent style={{ overflow: "visible" }}>

            <div className="flex flex-col gap-4">
              { time_periods.map((time_period, t_idx) => {
                return (
 
                  <Session key={t_idx} session={time_period} s_idx={time_period["position"]} 
                            g_idx={g_idx} studyId={studyId} subject={subject}>
                  </Session>

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

  const groupBadgeColor = group["badge_color"] ? group["badge_color"] : "flamingo";
  const groupBadgeClass = "color-capsule badge-color-" + groupBadgeColor;

  return (
    <>

      <Card className="mb-8 mt-4">
        <CardHeader className="flex justify-between gap-3 items-start">
          <div className="flex flex-col gap-1">
            <h3 className="gray-text">Groupe {group.position+1}</h3>
            <div className="flex gap-2">
              <h2 className="text-lg bold-text"> {group["name"]}  </h2>
              {DownloadGroupResultButton}
            </div>
            {/* <div className={groupBadgeClass}></div> */}
          </div>
        
        
        <button {...getToggleProps()} className="flex items-start">
          {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
        </button>
  
        </CardHeader> 
        
        <div {...getCollapseProps()}>
          {SubjectManagement(selectedSubject)}


          <div key={g_idx} className="flex gap-8 flex-wrap ml-4 mt-2" >
            { subjects.map((subject, s_idx) => { 
                return ( 
                  <Button className="subject-button" key={s_idx} onClick={() => {OpenModal(subject)}}>{subject["name"]}</Button>
                ) 
              }) 
            }
          </div>

          <Divider className="mt-4"/>

          <div className="flex gap-4 items-center justify-center m-4"> {/* less collapse lag when margin are here... */}
                    
            <Input
              label="ID participant"
              value={userId}
              onChange={e => setuserId(e.target.value)}
              // defaultValue="S01"
              className="max-w-xs"
              onKeyDown={async(e) => {
                if (e.key === 'Enter') {
                  let res = await createSubject(allSubjects, userId, setuserId, g_idx, studyId, mutate);
                  if(res == "ok"){
                    handleClickVariant('success','Sujet créé !');
                  }
                  else{
                    handleClickVariant('error','Erreur lors de la création ! : ' + res);
                  }
                }
              }}
            />
            <CreateSubjectButton/>
            
          
          </div>
        </div>
        
      </Card>
    </>
  );
}