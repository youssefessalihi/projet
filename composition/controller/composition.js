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
    $("#newAvgArea,#newPrice,#newNumber, #newProject,#newIcon,#newType").val("")
    $("#newAvgArea").focus();
  });
  function fillProjects(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/composition.php",
      { action: "read_projects" },
      function (result) {
        if (checkedElement != "") {
          select = $("#project");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner un projet</option>`)
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
      "../model/composition.php",
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
      "../model/composition.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          fillProjects("#newProject");
          fillTypes("#newType");
          const tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
              item[3],
              item[4],
              item[5]==""?"-":item[5],
              item[6],
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
              { title: "Superficie" },
              { title: "Prix Moyen" },
              { title: "Nombre" },
              { title: "Projet" },
              { title: "Icône" },
              { title: "Type de composition" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2,3,4,5]
                },
  
                filename: `compositions${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des compositions";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [80,80,80,80,80,80];
                }
              },
              {
                extend: "csv",
                charset: 'utf-8',
                exportOptions: {
                  columns: [0,1,2,3,4,5]
                },
                filename: `compositions${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0,1,2,3,4,5]
                },
  
                filename: `compositions${today}`
              },
              "colvis"
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter une composition</button>';
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
    let superficieMoyenne = $("#newAvgArea").val();
    let prixMoyen = $("#newPrice").val();
    let nombre = $("#newNumber").val();
    let projet_id = $("#newProject").val();
    let icon = $("#newIcon").val();
    let typecomposition_id = $("#newType").val();
    superficieMoyenne=$.trim(superficieMoyenne);
    prixMoyen=$.trim(prixMoyen);
    nombre=$.trim(nombre);
    projet_id=$.trim(projet_id);
    icon=$.trim(icon);
    typecomposition_id=$.trim(typecomposition_id);
    let errorList="";
    if (!superficieMoyenne) {
      errorList+="<li>La superficie moyenne</li>"
    }
    if (!prixMoyen) {
      errorList+="<li>Le prix moyen</li>"
    }
    if (!nombre) {
      errorList+="<li>Le nombre</li>"
    }
    if (!projet_id) {
      errorList+="<li>Le projet</li>"
    }
    if (!icon) {
      errorList+="<li>L'icône</li>"
    }
    if (!typecomposition_id) {
      errorList+="<li>Le type de composition</li>"
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (superficieMoyenne && prixMoyen && nombre && projet_id && icon && typecomposition_id) {      $("#addModal").modal("hide");
    $("#addInputs").html("");
      $.post(
        "../model/composition.php",
        {
          action: "add_composition",
          superficieMoyenne:superficieMoyenne,
          prixMoyen:prixMoyen,
          nombre:nombre,
          projet_id:projet_id,
          icon:icon,
          typecomposition_id:typecomposition_id
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newAvgArea,#newPrice,#newNumber, #newProject,#newIcon,#newType").val("")
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
        "../model/composition.php",
        { action: "delete_composition", id: id },
        function (result) {
          if (result.success) {
            customAlert("Supprimé avec succès!", "delete");
            $("#edit-form").show("");
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
      "../model/composition.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.idComposition);
          $("#avgArea").val(data.superficieMoyenne);
          $("#price").val(data.prixMoyen);
          $("#number").val(data.nombre);
          fillProjects("#project",data.idProjet)
          data.icon==""?$("#icon").val("-"):$("#icon").val(data.icon);
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
    let superficieMoyenne = $("#avgArea").val();
    let prixMoyen = $("#price").val();
    let nombre = $("#number").val();
    let projet_id = $("#project").val();
    let icon = $("#icon").val();
    id=$.trim(id);
    superficieMoyenne=$.trim(superficieMoyenne);
    prixMoyen=$.trim(prixMoyen);
    nombre=$.trim(nombre);
    projet_id=$.trim(projet_id);
    icon=$.trim(icon);
    let errorList="";
    if (!superficieMoyenne) {
      errorList+="<li>La superficie moyenne</li>"
    }
    if (!prixMoyen) {
      errorList+="<li>Le prix moyen</li>"
    }
    if (!nombre) {
      errorList+="<li>Le nombre</li>"
    }
    if (!projet_id) {
      errorList+="<li>Le projet</li>"
    }
    if (!icon) {
      errorList+="<li>L'icône</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (id && superficieMoyenne && prixMoyen && nombre && projet_id && icon) {      $("#addModal").modal("hide");
      $("#updateInputs").html("");
      $.post(
        "../model/composition.php",
        {
          action: "update_composition",
          id: id,
          superficieMoyenne:superficieMoyenne,
          prixMoyen:prixMoyen,
          nombre:nombre,
          projet_id:projet_id,
          icon:icon
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
