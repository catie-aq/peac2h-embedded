"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import {Input} from "@nextui-org/react";
import Group from '../group'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {Button, Divider } from "@nextui-org/react";
import { SnackbarProvider } from 'notistack';
import Session from "../session";
import { Dialog, DialogContent, DialogTitle, Tabs, Tab, Box, Typography } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';


const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {

  const params = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);

  let studyId = parseInt(params.get("id"));

  const { data, error, isLoading }= useSWR(process.env.NEXT_PUBLIC_JSON_SERVER_URL + '/studies/' + studyId, fetcher)
  const { data: allSubjects, error: allSubjectsError, isLoading: allSubjectsLoading, mutate: mutateAllSubjects} = useSWR(process.env.NEXT_PUBLIC_JSON_SERVER_URL + '/subjects/?studyId=' + studyId, fetcher);

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>
  
  let groups = data["groups"] 
  let surveyJson = data["groups"][0]["time_periods"][0]["protocol"]
  
  let name = data["name"]

  function StudyManagement() {

    const handleClose = () => {
      setOpen(false);
    }

    

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    // function DeleteSubjectButton() {
    //     const { enqueueSnackbar } = useSnackbar();
          
    //     function handleClickVariant(variant, message){
    //       // variant could be success, error, warning, info, or default
    //       enqueueSnackbar(message, { variant });
    //     };
    
    //     return (
    //       <Button 
    //         className="white-button white-button-delete"
    //         onClick={async () => {
    //           if(window.confirm("La suppression du sujet entraîne la suppresion de ses données. Voulez-vous vraiment supprimer ce sujet ?")){
    //             let res = await deleteSubject(subject["id"], mutate, g_idx, studyId);
    //             setOpen(false);
    //             if(res == "ok"){
                  
    //               handleClickVariant('info','Sujet supprimé !');
    //             }
    //             else{
    //               handleClickVariant('error','Erreur lors de la suppression');
    //             }
    //           }
    //         }}>
    //           Supprimer le sujet
    //       </Button>
    //     )
    //   }

    // tabs from here: https://mui.com/material-ui/react-tabs/?srsltid=AfmBOopcJqDR2GUJUu8bH8y7GcOtl1gbwu-L_-xwlQCLHKjCcadgZpeQ

    
    return (
      <Dialog 
        maxWidth="xl"
        open={open}
        onClose={handleClose}>
        <DialogTitle>
          <div className="study-card-header">
            <span></span>
            <div className="flex flex-col items-center">
              <h3 className="bold-text text-center">{data["name"]}</h3>
            </div>
            
          </div>
        </DialogTitle>
        <DialogContent style={{ overflow: "visible", height: "70vh", width: "80vw" }}>
          <div className='flex justify-center mb-4'>
          <Tabs
            value={value}
            onChange={handleChange}
            // textColor="secondary"
            // indicatorColor="secondary"
            aria-label="groups"
            variant="fullWidth" // Force les onglets à s'ajuster à la largeur disponible
            centered
            sx={{
              display: "flex",
              flexWrap: "nowrap", // Empêche le passage à la ligne
            }}
          >
            
            { groups.map((group, g_idx) => {
              return (
                <Tab key={g_idx} value={g_idx} label={group["name"]} />
              )
            })}
      
          </Tabs>
          </div>
          <Divider/>
            { groups.map((group, g_idx) => {
              if(g_idx === value){
                const time_periods = group["time_periods"]
                const subjects = allSubjects.filter((subject) => subject["group"] === g_idx)
                return (
                  <div key={g_idx}>
                    {/* <Typography variant="h6">Contenu de l'onglet {g_idx}</Typography> */}
                    <div className="flex flex-row gap-6 mt-4 justify-around">
                    { time_periods.map((time_period, t_idx) => {
                      return (
        
                        <div key={t_idx} className='flex flex-col gap-4 items-center'>
                          <h3 className='text-center bold-text'>{time_period["name"]}</h3>
                          { subjects.map((subject, s_idx) => {
                            let inProgress = subject.hasOwnProperty("partial-S" + t_idx)
                            let finished = !subject["partial-S" + t_idx] && subject["partial-S" + t_idx] != undefined
                            let textColor = "var(--dark-blue)"
                            if(inProgress){
                              textColor = "orange"
                            }
                            if(finished){
                              textColor = "lightgray"
                            }
                            
                            return (
                            <h3 style={{ color: textColor }}>{subject["name"]}</h3>
                            )
                          })}
                        </div>
                   
      
                      )
                    })}
                    </div>
                  </div>
                )
              }
            })}

         
          {/* <Box sx={{ width: '100%' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
            >
              <Tab value={0} label="Item One" />
              <Tab value={1} label="Item Two" />
              <Tab value={2} label="Item Three" />
              
            </Tabs>
      
            
          </Box> */}
  
          
          
        </DialogContent>
      </Dialog>
    )
  }
  
  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Image priority 
            className="flex justify-start mt-8 ml-8" 
            src="/PEAC2H.png" 
            width={200}
            height={200}
            alt="Peac²h logo" 
            style={{display: "inline"}}/> 

      {/* TODO: put this in a css class ? */}
      <main className="font-sans flex flex-col items-center justify-between pl-8 pr-8">
        <div className="z-10 max-w-6xl w-full items-center justify-between font-mono text-sm">
          {StudyManagement()}
          <div className="study-menu">
            <Button className='white-button min-w-[8em]' onClick={() => router.push('/')}>Accueil</Button>
            <h1 className="text-4xl bold-text text-center">{ name }</h1>
            <span></span>
            
          </div>

          <div className="flex justify-center mt-4">
            <Tippy content="Overview de l'étude">
              <button onClick={() => setOpen(true)}>
                <VisibilityIcon fontSize='large'/>
              </button>
            </Tippy>
          </div>
          <h2 className='text-2xl mt-12 mb-4 bold-text'> Groupes et sessions</h2>
  
          { 
            groups.map((group, g_idx) => { 
              if(g_idx === 0){
                return (
                  <div key={g_idx}>
                    <Group group={group} g_idx={g_idx} studyId={studyId} showGroup={true}/>
                  </div>
                )
              }else {
                return (   
                  <div key={g_idx}>
                    <Group group={group} g_idx={g_idx} studyId={studyId} showGroup={false}/>
                  </div>
                ) }
              })
          }
        </div>

        
      </main>
    </SnackbarProvider>
  )
}
