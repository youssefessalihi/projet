$(document).ready(function () {
  getElements();

  function customAlert(message, operation, confirmationButtons = false) {
    let title = "";
    $("#alertTitle").html("");
    $("#alertMessage").text("");
    switch (operation) {
      case "delete":
        title = '<i class="bi bi-trash3"></i> Suppression';
        break;
      case "update":
        title = '<i class="bi bi-pencil-square"></i> Modification';
        break;
      case "create":
        title = '<i class="bi bi-plus-circle"></i> Ajout';
        break;
      default:
        title = '<i class="bi bi-info-circle"></i> Message';
    }
    confirmationButtons
      ? $("#alertFooter").html(`<button type="button" class="btn btn-secondary bg-success text-light" data-bs-dismiss="modal">Non</button> <button type="button" class="btn btn-secondary bg-danger text-light" id="confirmOk">Oui</button>`)
      : $("#alertFooter").html(`<button type="button" class="btn btn-secondary bg-dark text-light" data-bs-dismiss="modal">Fermer</button>`);
    $("#alertTitle").html(title);
    $("#alertMessage").text(message);
    $("#customAlert").modal("show");
  }

  $("#addModal").on("shown.bs.modal", function () {
    $("#addInputs").html("");
    $("#newLong,#newLat,#newNumber, #newSup,#newAvgPrice,#newCompany,#newName,#newType").val("")
    $("#newLong").focus();
  });
  function fillCompanies(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/projet.php",
      { action: "read_companies" },
      function (result) {
        if (checkedElement != "") {
          select = $("#company");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner une société</option>`)
          listStatus.forEach((item) => {
              if (item[0] == checkedElement) {
                select.append(
                  `<option selected value=${item[0]}>${item[1]}</option>`
                );
              } else {
                select.append(`<option value=${item[0]}>${item[1]}</option>`);
            }
          });
          rendered = true;
        } else {
          customAlert(`Erreur lors de la récupération`);
        }
      },
      "json"
    )
  }
  function fillTypes(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/projet.php",
      { action: "read_types" },
      function (result) {
        if (checkedElement != "") {
          select = $("#type");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner un type</option>`)
          listStatus.forEach((item) => {
              if (item[0] == checkedElement) {
                select.append(
                  `<option selected value=${item[0]}>${item[1]}</option>`
                );
              } else {
                select.append(`<option value=${item[0]}>${item[1]}</option>`);
            }
          });
          rendered = true;
        } else {
          customAlert(`Erreur lors de la récupération`);
        }
      },
      "json"
    )
  }

  function getElements() {
    $("#updateForm").hide();
    $.post(
      "../model/projet.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          fillCompanies("#newCompany");
          fillTypes("#newType");
          const tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
              item[3],
              item[4],
              item[5],
              item[6],
              item[7],
              item[8],
              `<button class="btn btn-success edit-button m-1" style="width: 100px;padding:2px;" data-id="${item[0]}">Modifier</button>  <button class="btn btn-danger delete-button  m-1"  style="width: 100px;padding:2px;"  data-id="${item[0]}">Supprimer</button>`
            ];
          });
          const date = new Date();
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let today = `${day}-${month}-${year}`;

          $("#result").DataTable({
            destroy: true,
            data: tableData,
            columns: [
              { title: "Longitude" },
              { title: "Latitude" },
              { title: "Nombre" },
              { title: "Superficie moyenne" },
              { title: "Prix moyen" },
              { title: "Société" },
              { title: "Nom du projet" },
              { title: "Type de projet" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2,3,4,5,6,7]
                },
  
                filename: `projets${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des projets";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [60,60,60,60,60,60,60,60];
                }
              },
              {
                extend: "csv",
                charset: 'utf-8',
                exportOptions: {
                  columns: [0,1,2,3,4,5,6,7]
                },
                filename: `projets${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0,1,2,3,4,5,6,7]
                },
  
                filename: `projets${today}`
              },
              "colvis"
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un projet</button>';
          $('.dt-buttons').prepend(addButton);
      }
      ,
      "json"
    ).fail(function () {
      $("#result").html(
        "<p class='bg-warning'>Pas de données disponibles.</p>"
      );    
    });
  }
  $(document).on("click", "#add-button", function () {
    let longitude = $("#newLong").val();
    let latitude = $("#newLat").val();
    let nombre = $("#newNumber").val();
    let superficieMoyenne = $("#newSup").val();
    let prixMoyen = $("#newAvgPrice").val();
    let societe_id = $("#newCompany").val();
    let nomProjet = $("#newName").val();
    let typeProjet = $("#newType").val();
    longitude=$.trim(longitude);
    latitude=$.trim(latitude);
    nombre=$.trim(nombre);
    superficieMoyenne=$.trim(superficieMoyenne);
    prixMoyen=$.trim(prixMoyen);
    societe_id=$.trim(societe_id);
    nomProjet=$.trim(nomProjet);
    typeProjet=$.trim(typeProjet);
    let errorList="";
    if (!longitude) {
      errorList+="<li>Longitude</li>"
    }
    if (!latitude) {
      errorList+="<li>Latitude</li>"
    }
    if (!nombre) {
      errorList+="<li>Le nombre</li>"
    }
    if (!superficieMoyenne) {
      errorList+="<li>La superficie moyenne</li>"
    }
    if (!prixMoyen) {
      errorList+="<li>Le prix moyen</li>"
    }
    if (!societe_id) {
      errorList+="<li>La société</li>"
    }
    if (!nomProjet) {
      errorList+="<li>Le nom du projet</li>"
    }
    if (!typeProjet) {
      errorList+="<li>Le type du projet</li>"
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (longitude && latitude && nombre && superficieMoyenne && prixMoyen && societe_id && nomProjet && typeProjet) {      $("#addModal").modal("hide");
    $("#addInputs").html("");
      $.post(
        "../model/projet.php",
        {
          action: "add_project",
          longitude:longitude,
          latitude:latitude,
          nombre:nombre,
          superficieMoyenne:superficieMoyenne,
          prixMoyen:prixMoyen,
          societe_id:societe_id,
          nomProjet:nomProjet,
          typeProjet:typeProjet
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newLong,#newLat,#newNumber, #newSup,#newAvgPrice,#newCompany,#newName,#newType").val("")
          } else {
            customAlert("Erreur lors de l'ajout", "create");
          }
        },
        "json"
      )
    }
  });
  $(document).on("click", ".delete-button", function () {
    let id = $(this).data("id");
    id=$.trim(id)
    customAlert("Êtes-vous sûr de vouloir supprimer ceci ?", "delete", true);
    $(document).on("click", "#confirmOk", function () {
      $.post(
        "../model/projet.php",
        { action: "delete_project", id: id },
        function (result) {
          if (result.success) {
            customAlert("Supprimé avec succès!", "delete");
            getElements();
          } else {
            customAlert("Erreur lors de la suppression", "delete");
          }
        },
        "json"
        )
    });
  });

  $(document).on("click", ".edit-button", function () {
    $("#updateInputs").html("");
    $("#updateModal").modal("show");
    let id = $(this).data("id");
    id=$.trim(id)
    $.post(
      "../model/projet.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.idProjet)
          $("#long").val(data.longitude);
          $("#lat").val(data.latitude);
          $("#number").val(data.nombre);
          $("#sup").val(data.superficieMoyenne);
          $("#avgPrice").val(data.prixMoyen);
          fillCompanies("#company",data.idSociete)
          $("#name").val(data.nomProjet);
          fillTypes("#type",data.idType)
        } else {
          customAlert(`Erreur lors de la récupération`, "update");
        }
      },
      "json"
      )
  });
  $(document).on("click", "#update-button", function () {
    let id = $("#id").val();
    let longitude = $("#long").val();
    let latitude = $("#lat").val();
    let nombre = $("#number").val();
    let superficieMoyenne = $("#sup").val();
    let prixMoyen = $("#avgPrice").val();
    let societe_id = $("#company").val();
    let nomProjet = $("#name").val();
    id=$.trim(id);
    longitude=$.trim(longitude);
    latitude=$.trim(latitude);
    nombre=$.trim(nombre);
    superficieMoyenne=$.trim(superficieMoyenne);
    prixMoyen=$.trim(prixMoyen);
    societe_id=$.trim(societe_id);
    nomProjet=$.trim(nomProjet);
    let errorList="";
    if (!longitude) {
      errorList+="<li>Longitude</li>"
    }
    if (!latitude) {
      errorList+="<li>Latitude</li>"
    }
    if (!nombre) {
      errorList+="<li>Le nombre</li>"
    }
    if (!superficieMoyenne) {
      errorList+="<li>La superficie moyenne</li>"
    }
    if (!prixMoyen) {
      errorList+="<li>Le prix moyen</li>"
    }
    if (!societe_id) {
      errorList+="<li>La société</li>"
    }
    if (!nomProjet) {
      errorList+="<li>Le nom du projet</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (id && longitude && latitude && nombre && superficieMoyenne && prixMoyen && societe_id && nomProjet ) {      $("#addModal").modal("hide");
      $("#updateInputs").html("");
      $.post(
        "../model/projet.php",
        {
          action: "update_project",
          id: id,
          longitude:longitude,
          latitude:latitude,
          nombre:nombre,
          superficieMoyenne:superficieMoyenne,
          prixMoyen:prixMoyen,
          societe_id:societe_id,
          nomProjet:nomProjet
        },
        
        function (result) {
          if (result.success) {
            customAlert("Modifié avec succès!", "update");
            $("#updateModal").modal("hide");
            getElements();
          } else {
            customAlert(`Erreur lors de la mise à jour`, "update");
          }
        },
        "json"
        )
    }
  });
});
