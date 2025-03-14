"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import useSWR from 'swr'
import { useSWRConfig } from "swr"
import {Card, Input, Button, select, CardHeader} from "@nextui-org/react";
import Group from './group'
import { useRouter } from 'next/navigation'
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { Dialog, DialogContent } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { importStudy, deleteStudy } from '@/helpers/study_management';

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {

  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const [open, setOpen] = useState(false);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setSelectedName(file.name);
    // Additional validation logic
  };

  const handleClose = () => {
    setOpen(false);
  }

  const { data, error, isLoading }= useSWR(process.env.NEXT_PUBLIC_JSON_SERVER_URL + '/studies/', fetcher)

  if (error) return <div>échec du chargement</div>
  if (isLoading) return <div>chargement...</div>

  function DeleteStudyButton({id}) {
    const { enqueueSnackbar } = useSnackbar();

    function handleClickVariant(variant, message){
      // variant could be success, error, warning, info, or default
      enqueueSnackbar(message, { variant });
    };

    return (
      <>
      <button
        onClick={async () => {
          if (window.confirm("Êtes-vous sûr de vouloir supprimer cette étude ?")) {
            let res = await deleteStudy(id, mutate);
            if (res === "ok") {
              // Succès
              handleClickVariant('info', 'Étude supprimée !');
            } else {
              // Erreur
              handleClickVariant('error', 'Erreur lors de la suppression');
            }
          }
        }}
        className="flex justify-end mr-4"
      >
        <Tippy content="Supprimer l'étude">
          <CloseIcon color='error'/>
        </Tippy>
      </button>
      </>
    )
  }
  

  function ImportStudyButton() {
    const { enqueueSnackbar } = useSnackbar();
  
    function handleClickVariant(variant, message){
      // variant could be success, error, warning, info, or default
      enqueueSnackbar(message, { variant });
    };

    return (
      <Button 
        className='white-button mt-4'
        justify="center"  
        onClick={async () => {
          let res = await importStudy(selectedFile, data, mutate);
          setOpen(false);
          setSelectedFile(null);
          setSelectedName("");
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
        Valider
      </Button> 
    )
  }


  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Dialog 
        maxWidth={"md"}
        open={open}
        onClose={handleClose}>
        <DialogContent className="w-[40em] mb-8 mt-4">
          <div className="file-upload">
            {/* <img src={uploadImg} alt="upload" /> */}
            
            <div className='flex flex-col justify-center items-center'>
              <CloudUploadIcon fontSize='large'/>
              <span>Glissez un fichier</span>
            </div>

            <p className='flex justify-center'>Ou</p>
        
            <div className='flex flex-col justify-center items-center'>
              <h3>Trouver un fichier</h3>
              <p>Format : .json</p>
              <input 
                type="file" 
                justify="center" 
                accept='.json'
                onChange={handleFileChange}/>
            </div>
          </div>

          <h3 className='flex justify-center mt-4'> {selectedName || "Aucun fichier sélectionné"}</h3>
          
          <div className="flex mt-4 justify-center">
            <ImportStudyButton/>
          </div>        
        </DialogContent>
      </Dialog>
      
      <div className='flex justify-start mt-8 ml-8'>
        <Image src='/PEAC2H.png' width="200" height="200" alt="Peac²h logo" style={{display: "inline"}} priority/>
      </div>
      <main className="font-sans flex flex-col items-center justify-between">
        <div className="z-10 max-w-6xl w-full items-center justify-between font-mono text-sm">
          <div className="flex justify-center">
            <Button className='white-button white-button-big' onClick={() => setOpen(true)}>
              Importer une étude
            </Button>
          </div>

          <div direction="row" className="study-list">

            { data.map((study, s_idx) => {
              return (
                <div key={s_idx}>
                  <Card className="study-card mb-8 mt-4">
                    <div className="study-card-header">
                      <span></span>
                      <h3 className="flex justify-center"> Étude {study["id"]} </h3>
                      
                      <DeleteStudyButton id={study["id"]}/>

                    </div>
                    <h2 className='study-card-body'> Étude: { study["name"] }</h2>

                    <div className='study-card-footer'>
                      <Button 
                        className="white-button"
                        onClick={() => router.push('/study?id=' + study["id"])}
                        >
                        Accéder à l'étude
                      </Button>
                    </div>
                  
                  </Card>
                </div>
                )
              }
            )}

          </div>
        </div>
      </main>
    </SnackbarProvider>
  )
}

