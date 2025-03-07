"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import useSWR from 'swr'
import { useSWRConfig } from "swr"
import {Card, Input, Button, select} from "@nextui-org/react";
import Group from './group'
import { useRouter } from 'next/navigation'
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

const fetcher = (...args) => fetch(...args).then(res => res.json())


export default function Home() {

  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedName, setSelectedName] = useState("");


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setSelectedName(file.name);
    // Additional validation logic
  };

  const showAlert = () => {
    alert("Cette action est irréversible. Voulez-vous vraiment continuer ?");
  };

  const { data, error, isLoading }= useSWR('http://localhost:3003/studies/', fetcher)

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>

  async function deleteStudy(studyId) {
    let studySubjects = await fetch(`http://localhost:3003/subjects/?studyId=${studyId}`)
      .then(response => response.json())
      .then(data => data) 
      .catch((error) => {
        console.error('Error:', error);
        return error;
      });

    console.log(studySubjects)

    // delet study subjects
    await Promise.all(
      studySubjects.map(subject => {
        fetch(`http://localhost:3003/subjects/${subject.id}`, {
          method: 'DELETE',
        })
          .then(response => response.json())
          .then(data => { 
            console.log("Deleted subject", subject.name)
          })
          .catch((error) => {
            console.error('Error:', error);
            return error;
          });
      })
    );

    console.log("sujets supprimés")

    // delete study
    await fetch(`http://localhost:3003/studies/${studyId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => { 
        console.log("Deleted study", data)
      })
      .catch((error) => {
        console.error('Error:', error);
        return error;
      });

    console.log("étude supprimée")

    await new Promise(resolve => setTimeout(resolve, 1500));
    mutate(`http://localhost:3003/subjects/?studyId=${studyId}`);
    mutate("http://localhost:3003/studies/");

    return "ok"
  }

  

  async function importStudy() {
    // Récupérer le fichier
    let file = selectedFile;
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
        className='max-w-[20em] m-4'
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
        Importer l'étude
      </Button> 
    )
  }


  
  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    {/* <main className="font-sans flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm"> */}
      <div className="flex flex-col items-center mt-8">

      <h1 className="text-4xl font-bold mb-4">PEAC²H D&CO</h1>
      
        <Image src="/peac2h_deco.jpg" width="500" height="400" alt="Peac²h logo" style={{display: "inline"}} priority/> 
        {/* <span className='ml-4'> embarquée  </span> */}
      
    
      </div>

      <div direction="row" className="flex gap-4 justify-start ml-10 mt-8">

      { data.map((study, s_idx) => {
        return (
          <div key={s_idx}>
            <Card className="max-w-[25em] mb-8 mt-4">
              <div className='flex justify-between'>
                <h2 className='text-2xl m-4'> Étude: { study["name"] }</h2>
                <Tippy content="Supprimer l'étude">
                  <button onClick={() => deleteStudy(study["id"])} className='flex align-start m-4'>x</button>
                </Tippy>
              </div>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push('/study?id=' + study["id"])}
              >
              Accéder à l'étude
            </button>
            {/* <button 
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={showAlert}
            >
              Supprimer
            </button> */}
            
            </Card>
          </div>
          )
        }
      )}

      </div>

      <div className='flex justify-center'>
      <Card className="w-[40em] mb-8 mt-4">
        <div className="file-upload m-4">
          {/* <img src={uploadImg} alt="upload" /> */}
          <h3> {selectedName || "Cliquez ici pour charger une étude"}</h3>
          <p>Format : .json</p>
          <input 
            type="file" 
            justify="center" 
            accept='.json'
            onChange={handleFileChange}/>
        </div>
        
        <div className="flex gap-4 justify-center">
          <ImportStudyButton/>
        </div>
        {/* <Button
          onClick={() => importStudy()}
          justify="center"
          >
          Importer une étude
        </Button> */}
        
        </Card>
        </div>
      {/* </div>
    </main> */}
    </SnackbarProvider>
  )
}

