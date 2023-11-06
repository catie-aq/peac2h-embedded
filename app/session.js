import React, { useState } from "react";

import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";


export default function Session({session, s_idx, g_idx, group, subjects}) {

  let session_name = session["name"]
  if(session_name === "" || session_name === undefined){
    session_name = "(sans nom)"
  }

  let seeResults = null; 

  let subjectList = subjects.map((subject) => {  

    // Check if the subject has results, or finished results 

    let inProgress = subject.hasOwnProperty("partial-S" + s_idx)
    let finished = !subject["partial-S" + s_idx]
    let seeResults = (<></>); 

    let finishText = "Continuer"
    let link = `/study?group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`
    if(finished){
      finishText = "Revoir"
      link = `/review?group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`
    }

    if(inProgress){
      seeResults =  ( 
          <Link href={link}>
            <Button size="sm">
              {finishText}
            </Button> 
          </Link>
      )
    }

    return ( 

      <div>
        <h3 className="text-sm font-light"> {subject["id"]} </h3>

        <div className="flex gap-2 flex-wrap">
          <Link href={`/study?group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`}>
            <Button size="sm">
              Passer
            </Button> 
          </Link>
          {seeResults}
        
        </div>
        
        {/* {s_idx != 0 && <Divider/>} */}
        
      </div>
    ) 
  });

  // { subjects.map((subject, s_idx) => { 
  //   <Link href={`/study?group=${g_idx}&session=${s_idx}&subject=${subject}`}>
  //     <Button size="md">
  //       Passer
  //     </Button> 
  //   </Link>
  // }) }

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