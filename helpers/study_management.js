export async function importStudy(file, existingStudies, mutate) {
  // Récupérer le fichier
  // let file = selectedFile;
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
        const alreadyExists = existingStudies.some(study => study.name === study_name);

        if (alreadyExists) {
          return resolve("exists"); // On “résout” la Promise avec un statut
        }

        // On envoie la requête
        const response = await fetch(process.env.NEXT_PUBLIC_JSON_SERVER_URL + "/studies", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedData, null, 2)
        });

        if (!response.ok) {
          throw new Error("Erreur HTTP: " + response.status);
        }

        // On force la revalidation SWR (si besoin)
        mutate(process.env.NEXT_PUBLIC_JSON_SERVER_URL + "/studies/");

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


export async function deleteStudy(studyId, mutate) {
  let studySubjects = await fetch(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/?studyId=${studyId}`)
    .then(response => response.json())
    .then(data => data) 
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });

  // delet study subjects
  await Promise.all(
    studySubjects.map(subject => {
      fetch(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/${subject.id}`, {
        method: 'DELETE',
      })
        .then(response => response.json())
        .then(data => { 
          // console.log("Deleted subject", subject.name)
        })
        .catch((error) => {
          console.error('Error:', error);
          return error;
        });
    })
  );

  // console.log("sujets supprimés")

  // delete study
  await fetch(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/studies/${studyId}`, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(data => { 
      // console.log("Deleted study", data)
    })
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });

  // console.log("étude supprimée")

  mutate(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/?studyId=${studyId}`);
  mutate(process.env.NEXT_PUBLIC_JSON_SERVER_URL + "/studies/");

  return "ok"
}