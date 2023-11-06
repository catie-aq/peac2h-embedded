import React, { useState } from "react";

import {Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Link} from "@nextui-org/react";
import Session from "./session";
import useSWR from 'swr'
import { useSWRConfig } from "swr"

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function Group({group, g_idx}) {
  const { mutate } = useSWRConfig()

  const [userId, setuserId] = useState(''); // Declare a state variable...
  const [userKey, setUserKey] = useState(0); // Declare a state variable...
  
  const { data, error, isLoading }= useSWR('http://localhost:3003/subjects/?group=' + g_idx, fetcher)
  const [subjectList, setSubjectList] = useState(''); // Declare a state variable...
 
  if (error){ 
     return <div>échec du chargement</div>
  }
  if (isLoading){
    return <div>chargement...</div>
  } 

  let subjects = data;
 
  let createSubject = () => {
    fetch('http://localhost:3003/subjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: userId, 
        group: g_idx
      })
    })
      .then(response => response.json())
      .then(data => { 
        // console.log("Creation", data)

        // Ask for revalidation
        setuserId("");
        mutate('http://localhost:3003/subjects/?group=' + g_idx)
      })  
      .catch(error => console.error(error));

  }

  // Order by position
  // thanks https://stackoverflow.com/questions/43572436/sort-an-array-of-objects-in-react-and-render-them
  let time_periods = [].concat(group["time_periods"]).sort((a, b) => a["position"] > b["position"] ? -1 : 1)

  return (
    <>

      <Card className="max-w-[45em] mb-8 mt-4">
        <CardHeader className="flex gap-3">

        <h2 className="text-lg"> {group["name"]}  </h2>
        </CardHeader> 
        <Divider/>
        <CardBody>
          <h3 className="text-sm font-light"> Liste de sujets </h3> 
          <div className="flex gap-2 flex-wrap">
            { subjects.map((subject, s_idx) => { 
              return ( 
                <Link href={"http://localhost:3003/subjects/" + subject["id"]}> 
                  <div className="text-md m-2">
                    { subject["id"] }
                  </div> 
                </Link>
              ) 
              }) 
            }
          </div>
        </CardBody>
        
        <Divider/>
        <CardFooter>

          <div className="flex gap-4 items-center">
          
            <Input
              label="ID participant"
              value={userId}
              onChange={e => setuserId(e.target.value)}
              defaultValue="S01"
              className="max-w-xs"
            />

            <Button onPress={createSubject} size="md">
                créer
            </Button> 
          </div>
          </CardFooter>
        
      </Card>
      

      <div className='flex flex-wrap justify-center gap-4'>
        { time_periods.map((time_period, t_idx) => { 
          return ( 
              <Session session={time_period} s_idx={time_period["position"]} group={group} 
                        g_idx={g_idx} subjects={subjects}> 
              </Session>
          ) 
          }) 
        }
      </div>
    </>
  );
}