import React, { useState } from "react";

import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";
import { mutate } from "swr";
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';
import { convertResultsToCSV, downloadCSV } from "@/js_to_csv";
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { ComputePagesNumber } from "@/progress_bar";
import tippy from "tippy.js";

export default function Session({session, s_idx, g_idx, group, subject, studyId}) {

  let session_name = session["name"]
  if(session_name === "" || session_name === undefined){
    session_name = "(sans nom)"
  }

  // async function deleteSubject(subjectId) {
  //   fetch(`http://localhost:3003/subjects/${subjectId}`, {
  //     method: 'DELETE',
  //   })
  //     .then(response => response.json())
  //     .then(data => { 
  //       console.log("Deleted", data)
  //       mutate(`http://localhost:3003/subjects/?group=${g_idx}&studyId=${studyId}`)
  //       mutate(`http://localhost:3003/subjects/?studyId=${studyId}`)
  //     })
  //     .catch((error) => {
  //       console.error('Error:', error);
  //       return error;
  //     });
  //     return "ok"
  // }

  // let seeResults = null; 

  // function DeleteSubjectButton() {
  //   const { enqueueSnackbar } = useSnackbar();
      
  //   function handleClickVariant(variant, message){
  //     // variant could be success, error, warning, info, or default
  //     enqueueSnackbar(message, { variant });
  //   };

  //   return (
  //     <Tippy content="Supprimer le sujet"
  //             placement="top">
  //       <button 
  //         onClick={async () => {
  //           if(window.confirm("La suppression du sujet entraîne la suppresion de ses données. Voulez-vous vraiment supprimer ce sujet ?")){
  //             let res = await deleteSubject(subject["id"]);
  //             if(res == "ok"){
  //               handleClickVariant('info','Sujet supprimé !');
  //             }
  //             else{
  //               handleClickVariant('error','Erreur lors de la suppression');
  //             }
  //           }
  //         }}>
  //           x 
  //       </button>
  //     </Tippy>
  //   )
  // }

  // let subjectList = subjects.map((subject) => {  

  //   // Check if the subject has results, or finished results 

  let inProgress = subject.hasOwnProperty("partial-S" + s_idx)
  let finished = !subject["partial-S" + s_idx] && subject["partial-S" + s_idx] != undefined
  // let seeResults = (<></>); 

  let finishText = "Passer"
  if(inProgress){
    finishText = "Continuer"
  }
  let link = `/survey?studyId=${studyId}&group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`
  if(finished){
    finishText = "Revoir"
    link = `/review?studyId=${studyId}&group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`
  }

  let seeResults =  ( 
    <Link href={link} target="_blank">
      <Button size="sm" className="white-button">
        {finishText}
      </Button> 
    </Link>
  )

  const pagesNumber = ComputePagesNumber(session["protocol"]);
  // console.log("total pages:", pagesNumber);

  let currentPage = 0;
  if(subject.hasOwnProperty(`result-S${s_idx}`)){
    currentPage = subject[`result-S${s_idx}`]["pageNo"] +1;
  }
  // console.log("current page:", currentPage);

  let progress = currentPage / pagesNumber * 100;
  let hasFinished = false;
  if(subject["partial-S" + s_idx] !== undefined && subject["partial-S" + s_idx] === false){
    hasFinished = true;
  }

  let tippyContent = null;

  let progressBar = (<></>)
  if(hasFinished){
    currentPage = subject[`result-S${s_idx}`]["pageNo"];
    tippyContent = "Terminé";
    // console.log("progress bar complete for subject", subject["id"], "and session", s_idx);
    progressBar = (
      <div className="subject-progress-bar progress-bar-complete">
        <progress value={progress} max="100"></progress>
      </div>
    )
  }
  else {
    if(progress == 0){
      tippyContent = "Pas commencé";
    }
    else {
      tippyContent = "En cours : Page " + currentPage + " / " + pagesNumber;
    }
    progressBar = (
      <div className="subject-progress-bar">
        <progress value={progress} max="100"></progress>
      </div>
    )
  }

    
  //   // console.log(session);

  //   return ( 

  //     <div key={subject["id"]}>
  //       <Card>
  //         <CardHeader className="flex gap-10 justify-between">
  //           <h3 className="text-sm font-light"> {subject["name"]} </h3>
            
  //           <DeleteSubjectButton/>
  //           <Tippy content="Télécharger les résultats de ce sujet"
  //                 placement="top">
  //             <button onClick={() => downloadCSV(subject, session)}>csv</button>
  //           </Tippy>
  //         </CardHeader>
          

  //         <div className="flex gap-2 flex-wrap">
  //           {seeResults}
          
  //         </div>
  //       </Card>
        
        
  //     </div>
  //   ) 
  // });

  return (
    // <Card className="max-w-[30em]">
    //   <CardHeader className="flex gap-3">

    //     <div className="flex flex-col">
    //       <p className="text-md">
    //          { group["name"] } </p>
    //       <p className="text-small text-default-500"> 
    //        { session_name }
    //       </p>
    //     </div>
    //   </CardHeader>
    //   <Divider/>
    //   <CardBody>        
    //     <div className="flex gap-2">
    //       {/* <div className="flex gap-2 flex-col">
    //         { subjectList }
    //       </div> */}

 
    
    //    </div>

    //   </CardBody>
    //   <Divider/>
    //   {/* <CardFooter>
    //     <Link
    //       isExternal
    //       showAnchorIcon
    //       href="https://github.com/nextui-org/nextui"
    //     >
    //       Visit source code on GitHub.
    //     </Link>
    //   </CardFooter> */}
    // </Card>
    <div className="session-management">
      <h3>Session {s_idx}</h3>
      <h3 className="bold-text">{session["name"]}</h3>
      <Tippy content={tippyContent} appendTo={document.body} placement="top">
        {progressBar}
      </Tippy>
      
      {/* <Link href={`/survey?studyId=${studyId}&group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`} target="_blank">
        <Button size="sm">
          passer l'étude
        </Button> 
      </Link> */}
      <div className="flex justify-center">
        {seeResults}
      </div>
      {/* <span>{subject["name"]}</span> */}
    </div>
  );
}