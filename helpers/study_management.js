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

        const study = parsedData;
        study.groups.forEach((group, g_idx) => {
          group.subjects.forEach(async (subject, s_idx) => {
            await fetch (process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: subject.name,
                group: g_idx,
                studyId: study.id,
                id: subject.id
              })
            });
            
            group.time_periods.forEach(async (time_period, t_idx) => {
              // check in each time_periods if the subject has result
              time_period.experience_results.forEach(async (result, r_idx) => {
                if (result.subject_id === subject.id && result.result!==null) {
                  await fetch (process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/${subject.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      [`result-S${time_period.position}`]: result.result,
                      [`partial-S${time_period.position}`]: result.partial
                    })
                  });
                }
              });
            });
          });

          
        });

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


export async function exportStudy(study) {
  let studySubjects = await fetch(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/?studyId=${study.id}`)
    .then(response => response.json())
    .then(data => data) 
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });

  
  let export_study = study;


  studySubjects.forEach(subject => {
    // console.log("subject_id", subject.id)
    const subjectGroupPosition = subject.group;
    const studyGroup = export_study.groups.find(group => group.position === subjectGroupPosition);
    studyGroup.time_periods.forEach(time_period => {
      time_period.experience_results.forEach(result => {
        // console.log("result", result.id)
        if (result.subject_id === subject.id) {
          // put the result back in the experience_result
          // console.log("find expe result for the subject", result.result)
          // console.log("subject result", subject[`result-S${time_period.position}`])

          result.result = subject[`result-S${time_period.position}`];
          result.partial = subject[`partial-S${time_period.position}`];
        }
      });
    })
  });

  // console.log("export_study", export_study)

  // Combine study and its subjects
  const exportData = {
    study: export_study
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create a Blob and download the file
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${study.name.replace(/\s+/g, '_')}_export.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return "ok";

}