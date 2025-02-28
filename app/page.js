"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import useSWR from 'swr'
import { useSWRConfig } from "swr"
import {Card, Input} from "@nextui-org/react";
import Group from './group'
import { useRouter } from 'next/navigation'

const fetcher = (...args) => fetch(...args).then(res => res.json())


export default function Home() {

  const router = useRouter()
  const { mutate } = useSWRConfig()
  const fileRef = useRef(null)

  const { data, error, isLoading }= useSWR('http://localhost:3003/studies/', fetcher)

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>
  
  // let groups = data[0]["groups"] 
  // let surveyJson = data[0]["groups"][0]["time_periods"][0]["protocol"]
  
  // let name = data[0]["name"]
  let importStudy = async function() {
    let file = fileRef.current?.files[0]
    console.log(file)
    const filename = file.name
    // const file_content = await convert(filename)
    const reader = new FileReader();
    reader.onload = (event) => {
      
      // event.target.result contient le texte brut du fichier
      const textContent = event.target.result;
      // On parse le JSON
      const parsedData = JSON.parse(textContent);
      console.log("Contenu du fichier JSON :", parsedData);

      const existingData = data;
      console.log(existingData.length)
      

      parsedData["id"] = existingData.length + 1;
      console.log("New study id", parsedData["id"])
      
      const response = fetch("http://localhost:3003" + '/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData, null, 2),
      })
      // TODO: for now, we use the status response to display the snackbar
      // see if we can display directly the error message and so return the response.json()
        .then(response => response)
        .then(data => { 
          console.log("Creation", data)

          // Ask for revalidation
          // setName("");
          mutate("http://localhost:3003" + '/studies');
          return data;
        })  
        .catch(error => console.error(error));
      return response;
    };
    
    reader.onerror = () => {
      console.error('Erreur lors de la lecture du fichier.');
    };

    // 4. Démarrer la lecture
    reader.readAsText(file);
  }
  
  return (
    <main className="font-sans flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">

      <h1 className="text-4xl font-bold">PEAC²H Embarqué</h1>
      <p className="text-2xl" style={{color: "#f8b242"}}> 
      
        <Image src="/PEAC2H.png" width="150" height="100" alt="Peac²h logo" style={{display: "inline"}}/> 
        <span className='ml-4'> embarquée  </span>
      
         </p>

      { data.map((study, s_idx) => {
        return (
          <div key={s_idx}>
            <h2 className='text-2xl mt-8 mb-4'> Étude: { study["name"] }</h2>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push('/study?id=' + study["id"])}
              >
              accéder à l'étude
            </button>
          </div>
          )
        }
      )}

      <Card className="max-w-[45em] mb-8 mt-4">
        
        <Input type="file" ref={fileRef}/>
        <button
          onClick={() => importStudy()}
          >
          Importer une étude
        </button>
        
        </Card>
     
      </div>
    </main>
  )
}

// "use client";

// import { useState } from 'react';

// export default function UploadJson() {
  // const handleFileChange = (event) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   // Vérifier qu’il s’agit bien d’un fichier JSON (optionnel)
  //   if (file.type !== 'application/json') {
  //     console.error("Veuillez sélectionner un fichier JSON.");
  //     return;
  //   }

  //   // Créer un FileReader pour lire le contenu du fichier
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     // Log le texte brut du fichier
  //     console.log(e.target.result);

  //     // Si vous souhaitez parser le JSON, vous pouvez faire :
  //     // const parsedData = JSON.parse(e.target.result);
  //     // console.log(parsedData);
  //   };
  //   reader.onerror = () => {
  //     console.error('Erreur lors de la lecture du fichier.');
  //   };

  //   // Lire le fichier en tant que texte (UTF-8)
  //   reader.readAsText(file);
  // };

//   return (
//     <div>
//       <h1>Upload d’un fichier JSON</h1>
//       <input
//         type="file"
//         accept="application/json"
//         onChange={handleFileChange}
//       />
//     </div>
//   );
// }


