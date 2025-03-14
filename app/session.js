import React, { useState } from "react";

import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";
import { mutate } from "swr";
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';
import { convertResultsToCSV, downloadCSV } from "@/helpers/js_to_csv";
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { ComputePagesNumber } from "@/progress_bar";
import tippy from "tippy.js";

export default function Session({session, s_idx, g_idx, group, subject, studyId}) {

  let session_name = session["name"]
  if(session_name === "" || session_name === undefined){
    session_name = "(sans nom)"
  }

  // Check if the subject has results, or finished results 

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

  let currentPage = 0;
  if(subject.hasOwnProperty(`result-S${s_idx}`)){
    currentPage = subject[`result-S${s_idx}`]["pageNo"] +1;
  }

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

  return (

    <div className="session-management">
      <h3 className="light-text">Session {s_idx}</h3>
      <h3 className="bold-text">{session["name"]}</h3>
      <Tippy content={tippyContent} appendTo={document.body} placement="top">
        {progressBar}
      </Tippy>
      
      <div className="flex justify-center">
        {seeResults}
      </div>
    </div>
  );
}