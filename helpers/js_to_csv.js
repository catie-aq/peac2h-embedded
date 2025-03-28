function convertResultsToCSV(result, session) {
  // 1) On récupère la liste de toutes les colonnes
  let headers = buildHeadersFromTemplate(session.protocol);
  
  // 2) Prépare un tableau qui contiendra toutes les lignes
  let rows = [];

  // 3) On construit l'objet "rowData" pour ce participant
  let rowData = {};
  rowData["Sujet"] = result.name; // ou tout autre identifiant du participant

  // On va chercher les résultats propres à la session (ex: "result-S0")
  const sessionId = session.position; // par ex 0
  const answers = result[`result-S${sessionId}`] || {};

  // 4) On remplit rowData en fonction des réponses
  Object.entries(answers).forEach(([key, value]) => {
    // "key" = ex. "GP:0-TP:0-EC:981::question5"
    let formattedKey = formatKey(key); 
    // = ex. "GP-0::SE-0::question::page981::question5"

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Cas où "value" est un objet => potentiellement un multipletext, matrix, matrixdropdown, etc.
      Object.entries(value).forEach(([subKey, subValue]) => {
        // subKey = "text1" ou "Row1" etc.
        if (typeof subValue === 'object') {
          // subValue lui-même peut être un objet => matrice à double niveau
          Object.entries(subValue).forEach(([subSubKey, subSubValue]) => {
            // ex: subSubKey = "Column1"
            let nestedKey = `${formattedKey}${subKey}_${subSubKey}`;
            // rowData[nestedKey] = subSubValue;
            rowData[nestedKey] = (Array.isArray(subSubValue))
              ? subSubValue.join("::")
              : subSubValue;
          });
        } else {
          let nestedKey = `${formattedKey}${subKey}`;
          rowData[nestedKey] = (Array.isArray(subValue))
            ? subValue.join("::")
            : subValue;
        }
      });
    } else {
      // Sinon, c'est un champ "simple" (radio, dropdown, text, etc.)
      rowData[formattedKey] = Array.isArray(value) ? value.join("::") : value;
    }
  });

  // 5) On ajoute l'objet rowData dans le tableau rows
  rows.push(rowData);

  // 6) Construire le CSV
  //    On écrit la première ligne (header), puis pour chaque row on place la donnée correspondante 
  //    ou "" si la clé n'existe pas
  let csvContent = headers.join(";") + "\n";

  rows.forEach(row => {
    // On mappe chaque header pour s'assurer de l'ordre et remplir éventuellement par ""
    csvContent += headers.map(h => row[h] ?? "").join(";") + "\n";
  });

  return csvContent;
}

function formatKey(key) {
  return key.replace(/GP:(\d+)-TP:(\d+)-EC:(\d+)::/, "GP-$1::SE-$2::question::page$3::");
}


export function convertResultsToCSVGroup(results, session) {
  // 1) Construire la liste de tous les headers possibles à partir du template
  //    (en supposant session.protocol contient votre survey complet)
  // console.log(session);
  let templateHeaders = buildHeadersFromTemplate(session.protocol);

  // On place "Sujet" en première position
  // let headers = ["Sujet", ...templateHeaders];
  let headers = templateHeaders;

  // 2) Prépare un tableau pour stocker les lignes (une ligne par participant)
  let rows = [];

  // 3) Parcourt chaque participant (chaque "result" dans results)
  results.forEach((participant) => {
    // On prépare un objet rowData
    let rowData = {};
    // Identifiant du participant (ou tout autre champ)
    rowData["Sujet"] = participant.name;

    // Récupère les réponses du participant pour la session donnée
    // si session.position est un nombre, par exemple 0, on fait :
    // const answers = participant[`result-S${session.position}`];
    // sinon si session est juste un nombre, on fait :
    const answers = participant[`result-S${session.position}`];
    if (!answers) {
      // pas de réponses => on ajoute quand même la ligne "vide"
      rows.push(rowData);
      return; 
    }

    // 4) Remplit rowData en itérant sur chaque question/réponse
    Object.entries(answers).forEach(([key, value]) => {
      const formattedKey = formatKey(key); // ex. "GP-0::SE-0::question::..."

      if (typeof value === 'object' && !Array.isArray(value)) {
        // ex: multipletext, matrix, matrixdropdown, likertmatrix...
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'object') {
            // subValue peut être un objet => matrice multi-niveau
            Object.entries(subValue).forEach(([subSubKey, subSubValue]) => {
              let nestedKey = `${formattedKey}${subKey}_${subSubKey}`;
              rowData[nestedKey] = Array.isArray(subSubValue)
                ? subSubValue.join("::")
                : subSubValue;
            });
          } else {
            // ex : likertmatrix => subKey = 'item1', subValue = '-1'
            // => nestedKey = "GP-0::SE-0::question::page998::likertmatrixitem1"
            let nestedKey = `${formattedKey}${subKey}`;
            rowData[nestedKey] = Array.isArray(subValue)
              ? subValue.join("::")
              : subValue;
          }
        });
      } else {
        // champ simple (radio, checkbox, text, etc.)
        rowData[formattedKey] = Array.isArray(value) ? value.join("::") : value;
      }
    });

    // On ajoute l'objet final au tableau de lignes
    rows.push(rowData);
  });

  // 5) Construire la chaîne CSV
  let csvContent = headers.join(";") + "\n";
  rows.forEach((row) => {
    // On respecte l'ordre exact de "headers"
    const line = headers.map((col) => row[col] ?? "").join(";");
    csvContent += line + "\n";
  });

  return csvContent;
}



function buildHeadersFromTemplate(protocol) {
  // On commence toujours avec la colonne "Sujet"
  const headers = ["Sujet"];

  protocol.pages.forEach(page => {
    page.elements.forEach(element => {
      // La "clé brute" est element.name, par ex: "GP:0-TP:0-EC:998::question14"
      // On applique formatKey dessus, par exemple:
      const baseKey = formatKey(element.name); 
      // (Déjà existant dans votre code, je le recopie ici au besoin)
      // function formatKey(key) {
      //   return key.replace(/GP:(\d+)-TP:(\d+)-EC:(\d+)::/, "GP-$1::SE-$2::question::page$3::");
      // }

      switch (element.type) {
        // Cas simple : 1 colonne
        case "text":
        case "comment":
        case "radiogroup":
        case "dropdown":
        case "boolean":
        case "imagepicker":
        case "html":
        case "expression":
        case "image":
        case "signaturepad":
        case "rating":
        case "ranking":
        case "likert":
        case "nouislider":
        case "nouislidertlx":
        case "nouislidercustom":
          // On n'ajoute qu'une seule colonne
          if (!headers.includes(baseKey)) {
            headers.push(baseKey);
          }
          break;

        // multipletext => un objet "items", chaque item a un "name"
        case "multipletext":
          if (Array.isArray(element.items)) {
            element.items.forEach(item => {
              // ex: item.name = "text1"
              const subKey = `${baseKey}${item.name}`;
              if (!headers.includes(subKey)) {
                headers.push(subKey);
              }
            });
          } else {
            // Par précaution, on met au moins la colonne de base
            if (!headers.includes(baseKey)) {
              headers.push(baseKey);
            }
          }
          break;

        // matrix => rows x columns
        case "matrix":
          // element.rows = ["Row 1", "Row 2"]
          // element.columns = ["Column 1", "Column 2", "Column 3"]
          if (Array.isArray(element.rows) && Array.isArray(element.columns)) {
            element.rows.forEach(rowName => {
              element.columns.forEach(colName => {
                const subKey = `${baseKey}${rowName}_${colName}`;
                if (!headers.includes(subKey)) {
                  headers.push(subKey);
                }
              });
            });
          } else {
            // fallback
            if (!headers.includes(baseKey)) {
              headers.push(baseKey);
            }
          }
          break;

        // matrixdropdown => rows x columns (mais columns sont des objets)
        case "matrixdropdown":
          // element.rows = ["Row 1", "Row 2"]
          // element.columns = [{name: "Column 1"}, {name: "Column 2"}, ...]
          if (Array.isArray(element.rows) && Array.isArray(element.columns)) {
            element.rows.forEach(rowName => {
              element.columns.forEach(col => {
                // col.name = "Column 1" par ex.
                const subKey = `${baseKey}${rowName}_${col.name}`;
                if (!headers.includes(subKey)) {
                  headers.push(subKey);
                }
              });
            });
          } else {
            // fallback
            if (!headers.includes(baseKey)) {
              headers.push(baseKey);
            }
          }
          break;

          case "likertmatrix":
            // On s'attend à ce que "rows" soit un tableau d'objets
            // du type:
            // "rows": [
            //   { "value": "item1", "text": "aaa", "Texte2": "bbb" },
            //   { "value": "item2", ... },
            //   ...
            // ]
            if (Array.isArray(element.rows)) {
              element.rows.forEach((rowObj) => {
                // On prend rowObj.value comme identifiant de la ligne
                const rowId = rowObj.value;
                // On construit la clé => par exemple "likertmatrix_item1"
                const subKey = `${baseKey}${rowId}`;
                if (!headers.includes(subKey)) {
                  headers.push(subKey);
                }
              });
            } else {
              // Si rows n'est pas un tableau, fallback minimal
              if (!headers.includes(baseKey)) {
                headers.push(baseKey);
              }
            }
            break

        default:
          // fallback
          if (!headers.includes(baseKey)) {
            headers.push(baseKey);
          }
          break;
      }
    });
  });

  return headers;
}


// 📌 Fonction pour télécharger le CSV en React
export function downloadCSV(result, session) {
  const csvData = convertResultsToCSV(result, session);
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Resultats_${result.name}_S${session.position+1}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCSVGroup(result, group, session) {
    const csvData = convertResultsToCSVGroup(result, session);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Resultats_G${group+1}_S${session.position+1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
