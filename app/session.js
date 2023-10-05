import React, { useState } from "react";

import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";


export default function Session({session, s_idx, g_idx, group, subjects}) {


  console.log("Session", session);
  let session_name = session["name"]
  if(session_name === "" || session_name === undefined){
    session_name = "(sans nom)"
  }

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          width={40}
        />
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
            { subjects.map((subject) => { 
              return ( 

                <div>

                  <h3 className="text-sm font-light"> {subject["id"]} </h3>

                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/study?group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`}>
                      <Button size="sm">
                        Passer
                      </Button> 
                    </Link>
                    <Link href={`/study?group=${g_idx}&session=${s_idx}&subject=${subject["id"]}`}>
                      <Button size="sm">
                        Revoir
                      </Button> 
                    </Link>
                  </div>
                  
                  {/* {s_idx != 0 && <Divider/>} */}
                  
                </div>
              ) 
              }) 
            }
          </div>

          { subjects.map((subject, s_idx) => { 
              <Link href={`/study?group=${g_idx}&session=${s_idx}&subject=${subject}`}>
              <Button size="md">
              Passer
              </Button> 
              </Link>
          }) }
    
       </div>

      </CardBody>
      <Divider/>
      <CardFooter>
        <Link
          isExternal
          showAnchorIcon
          href="https://github.com/nextui-org/nextui"
        >
          Visit source code on GitHub.
        </Link>
      </CardFooter>
    </Card>
  );
}