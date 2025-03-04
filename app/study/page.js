"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import {Input} from "@nextui-org/react";
import Group from '../group'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {Button } from "@nextui-org/react";
import { SnackbarProvider } from 'notistack';


const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {

  const params = useSearchParams()
  const router = useRouter()

  let studyId = parseInt(params.get("id"));

  const { data, error, isLoading }= useSWR('http://localhost:3003/studies/' + studyId, fetcher)

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>
  
  let groups = data["groups"] 
  let surveyJson = data["groups"][0]["time_periods"][0]["protocol"]
  
  let name = data["name"]
  
  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <main className="font-sans flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">

      <h1 className="text-4xl font-bold">Étude: { name }</h1>
      <p className="text-2xl" style={{color: "#f8b242"}}> 
      
        <Image src="/PEAC2H.png" width="150" height="100" alt="Peac²h logo" style={{display: "inline"}}/> 
        <span className='ml-4'> embarquée  </span>
      
         </p>

      <Button onClick={() => router.push('/')}>retour</Button>
      <h2 className='text-2xl mt-8 mb-4'> Groupes et sessions</h2>
  
        { 
          groups.map((group, g_idx) => { 
            return (   
              <div key={g_idx}>
                <Group group={group} g_idx={g_idx} studyId={studyId}/>
              </div>
            ) } ) 
        }
     
      </div>
    </main>
    </SnackbarProvider>
  )
}
