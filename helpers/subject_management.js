export async function createSubject(allSubjects, userId, setuserId, g_idx, studyId, mutateAllSubjects) {
  const alreadyExists = allSubjects.find(subject => 
    subject.name === userId &&
    subject.studyId === studyId
  );
  
  if (alreadyExists) {
    return "Sujet déjà existant dans le groupe " + (alreadyExists["group"]+1);
  }

  if (userId === "") {
    return "Le nom du sujet ne peut pas être vide";
  }

  
  fetch(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: userId, // name instead of id to avoid duplicate ids within multiple studies, maybe to reconsider
      group: g_idx,
      studyId: studyId
    })
  })
    .then(response => response.json())
    .then(data => { 
      // console.log("Creation", data)

      // Ask for revalidation
      setuserId("");
      mutateAllSubjects();
      //mutate(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/?group=` + g_idx + '&studyId=' + studyId)
    })  
    .catch(error => console.error(error));

    return "ok";

}


export async function deleteSubject(subjectId, mutateAllSubjects, g_idx, studyId) {
  fetch(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/${subjectId}`, {
    method: 'DELETE',
  })
    .then(response => response.json())
    .then(data => { 
      // console.log("Deleted", data)
      // mutate(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/?group=${g_idx}&studyId=${studyId}`)
      mutateAllSubjects();
      // mutate(process.env.NEXT_PUBLIC_JSON_SERVER_URL + `/subjects/?studyId=${studyId}`)
    })
    .catch((error) => {
      console.error('Error:', error);
      return error;
    });
    return "ok"
}