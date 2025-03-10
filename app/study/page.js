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
      <Image priority 
            className="flex justify-start mt-8 ml-8" 
            src="/PEAC2H.png" 
            width={200}
            height={200}
            alt="Peac²h logo" 
            style={{display: "inline"}}/> 

      {/* TODO: put this in a css class ? */}
      <main className="font-sans flex flex-col items-center justify-between p-8">
        <div className="z-10 max-w-6xl w-full items-center justify-between font-mono text-sm">
          <div className="flex justify-between gap-12">
            <Button className='white-button' onClick={() => router.push('/')}>Accueil</Button>
            <h1 className="text-4xl bold-text">{ name }</h1>
            <Button style={{cursor: "not-allowed"}} disabled>etat de l'étude</Button>
          </div>

          <h2 className='text-2xl mt-8 mb-4'> Groupes et sessions</h2>
  
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
