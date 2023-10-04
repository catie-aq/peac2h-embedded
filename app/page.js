"use client"

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {

  const { data, error, isLoading }= useSWR('http://localhost:3003/studies/', fetcher)

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>
 
  if(data){
    console.log(data[0]["id"]);
  }
  
  let groups = data[0]["groups"] 
  let surveyJson = data[0]["groups"][0]["time_periods"][0]["protocol"]
  console.log("Groups", groups);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        Groups 
        { 
          groups.map((group, g_idx) => { 
            console.log("Group", group);
            return (   
              <div>
              <h2> Group { group["name"] } </h2> 
              { group["time_periods"].map((time_period, t_idx) => { 
                return ( 
                  <>
                    <h3> Session: { time_period["name"] } </h3> 
                    <Link href={`/study?group=${g_idx}&session=${t_idx}`}> Passer </Link>
                    
                  </>
                ) 
                }) 
              }
       
              </div>
            ) } ) 
        }
      </div>
    </main>
  )
}
