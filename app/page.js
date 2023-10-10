"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import {Input} from "@nextui-org/react";
import Group from './group'

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
    <main className="font-sans flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">

      <h1 className="text-4xl font-bold">Welcome to the study</h1>
      <p className="text-2xl">Please enter your ID</p>
      

      <h2 className='text-2xl mt-8 mb-4'> Groupes et sessions</h2>
  
        { 
          groups.map((group, g_idx) => { 
            return (   

               <Group group={group} g_idx={g_idx}/>
        
            ) } ) 
        }
     
      </div>
    </main>
  )
}
