import React, { useState } from "react";

import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";
import { mutate } from "swr";
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';
import { convertResultsToCSV, downloadCSV } from "@/js_to_csv";

export default function Session({session, s_idx, g_idx, group, subjects, studyId}) {

  let session_name = session["name"]
  if(session_name === "" || session_name === undefined){
    session_name = "(sans nom)"
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

  let seeResults = null; 

  let subjectList = subjects.map((subject) => {  

    // Check if the subject has results, or finished results 

    let inProgress = subject.hasOwnProperty("partial-S" + s_idx)
    let finished = !subject["partial-S" + s_idx] && subject["partial-S" + s_idx] != undefined
    let seeResults = (<></>); 

    let finishText = "Passer"
    if(inProgress){
      finishText = "Continuer"
    }
    let link = `/survey?studyId=${studyId}&group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`
    if(finished){
      finishText = "Revoir"
      link = `/review?studyId=${studyId}&group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`
    }

    seeResults =  ( 
      <Link href={link} target="_blank">
        <Button size="sm">
          {finishText}
        </Button> 
      </Link>
    )

    function DeleteSubjectButton() {
      const { enqueueSnackbar } = useSnackbar();
        
      function handleClickVariant(variant, message){
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(message, { variant });
      };

      return (
        <div 
          onClick={async () => {
            let res = await deleteSubject(subject["id"]);
            if(res == "ok"){
              handleClickVariant('info','Sujet supprimé !');
            }
            else{
              handleClickVariant('error','Erreur lors de la suppression');
            }
          }}>
            x 
        </div>
      )
    }


    return ( 

      <div key={subject["id"]}>
        <Card>
          <CardHeader className="flex gap-10 justify-between">
            <h3 className="text-sm font-light"> {subject["name"]} </h3>
            {/* <Button 
              className="corner"
              onClick={() => deleteSubject(subject["id"])}>
                x 
            </Button> */}
            
            <DeleteSubjectButton/>
            <button onClick={() => downloadCSV(subject, s_idx)}>csv</button>
          </CardHeader>
          

          <div className="flex gap-2 flex-wrap">
            {seeResults}
          
          </div>
        </Card>
        
        
      </div>
    ) 
  });

  return (
    <Card className="max-w-[30em]">
      <CardHeader className="flex gap-3">

        <div className="flex flex-col">
          <p className="text-md">
             { group["name"] } </p>
          <p className="text-small text-default-500"> 
           { session_name }
          </p>
        </div>
      </CardHeader>
      <Divider/>
      <CardBody>        
        <div className="flex gap-2">
          <div className="flex gap-2 flex-col">
            { subjectList }
          </div>

 
    
       </div>

      </CardBody>
      <Divider/>
      {/* <CardFooter>
        <Link
          isExternal
          showAnchorIcon
          href="https://github.com/nextui-org/nextui"
        >
          Visit source code on GitHub.
        </Link>
      </CardFooter> */}
    </Card>
  );
}