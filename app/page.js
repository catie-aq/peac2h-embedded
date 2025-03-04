"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import useSWR from 'swr'
import { useSWRConfig } from "swr"
import {Card, Input, Button} from "@nextui-org/react";
import Group from './group'
import { useRouter } from 'next/navigation'
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';

const fetcher = (...args) => fetch(...args).then(res => res.json())


export default function Home() {

  const router = useRouter()
  const { mutate } = useSWRConfig()
  const fileRef = useRef(null)
  const fetchResponseRef = useRef(null)

  const { data, error, isLoading }= useSWR('http://localhost:3003/studies/', fetcher)

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>
  

  async function importStudy() {
    // Récupérer le fichier
    let file = fileRef.current?.files[0];
    if (!file) {
      return "no-file"; // ou throw new Error("Pas de fichier")
    }
  
    // On retourne une Promise
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = async (event) => {
        try {
          const textContent = event.target.result;
          const parsedData = JSON.parse(textContent);
  
          // ... vos vérifs ...
          const study_name = parsedData["name"];
          const alreadyExists = data.some(study => study.name === study_name);
  
          if (alreadyExists) {
            return resolve("exists"); // On “résout” la Promise avec un statut
          }
  
          // On envoie la requête
          const response = await fetch("http://localhost:3003/studies", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedData, null, 2)
          });
  
          if (!response.ok) {
            throw new Error("Erreur HTTP: " + response.status);
          }
  
          // On force la revalidation SWR (si besoin)
          mutate("http://localhost:3003/studies/");
  
          // On résout la Promise avec un statut “ok”
          resolve("ok");
        } catch (error) {
          // Si on a une erreur de parse ou de fetch
          reject(error);
        }
      };
  
      // En cas d’erreur de lecture
      reader.onerror = (err) => {
        reject(err);
      };
  
      // Lance la lecture du fichier
      reader.readAsText(file);
    });
  }
  

  function ImportStudyButton() {
    const { enqueueSnackbar } = useSnackbar();
  
    function handleClickVariant(variant, message){
      // variant could be success, error, warning, info, or default
      enqueueSnackbar(message, { variant });
    };

    return (
      <Button 
        justify="center"  
        onClick={async () => {
          let res = await importStudy();
          if (res === "ok") {
            // Succès
            handleClickVariant('success', 'Étude ajoutée !');
          } else if (res === "exists") {
            // Étude déjà existante
            handleClickVariant('error', 'Erreur : Étude déjà existante');
          } else if (res === "no-file") {
            // Aucun fichier
            handleClickVariant('error', 'Aucun fichier sélectionné');
          }
        }} 
      >
        Importer une étude
      </Button> 
    )
  }


  
  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <main className="font-sans flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">

      <h1 className="text-4xl font-bold">PEAC²H Embarqué</h1>
      <p className="text-2xl" style={{color: "#f8b242"}}> 
      
        <Image src="/PEAC2H.png" width="150" height="100" alt="Peac²h logo" style={{display: "inline"}} priority/> 
        <span className='ml-4'> embarquée  </span>
      
         </p>

      <div direction="row" className="flex gap-4">

      { data.map((study, s_idx) => {
        return (
          <div key={s_idx}>
            <Card className="max-w-[20em] mb-8 mt-4">
            <h2 className='text-2xl m-4'> Étude: { study["name"] }</h2>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push('/study?id=' + study["id"])}
              >
              Accéder à l'étude
            </button>
            </Card>
          </div>
          )
        }
      )}

      </div>

      <Card className="max-w-[45em] mb-8 mt-4">
        <Input type="file" ref={fileRef} justify="center"/>
        
          <ImportStudyButton/>
      
        {/* <Button
          onClick={() => importStudy()}
          justify="center"
          >
          Importer une étude
        </Button> */}
        
        </Card>
      </div>
    </main>
    </SnackbarProvider>
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


