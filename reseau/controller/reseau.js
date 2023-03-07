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
    $("#newRegion").focus();
  });
  function fillRegions(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/reseau.php",
      { action: "read_regioDirec" },
      function (result) {
        if (checkedElement != "") {
          select = $("#regioDirec");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner une direction régionale</option>`)
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
      "../model/reseau.php",
      { action: "read_all" },
      function (result) {
          var data = result.data;
          fillRegions("#newRegioDirec");
          var tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
              item[3],
              `<button class="btn btn-success edit-button" data-id="${item[0]}">Modifier</button>  <button class="btn btn-danger delete-button" data-id="${item[0]}">Supprimer</button>`
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
              { title: "Région" },
              { title: "Libellé" },
              { title: "Direction Régionale" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2]
                },
  
                filename: `réseaux${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des réseaux";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [150, 150,200];
                }
              },
              {
                extend: "csv",
                exportOptions: {
                  columns: [0, 1,2]
                },
  
                filename: `réseaux${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0, 1,2]
                },
  
                filename: `réseaux${today}`
              },
              "colvis",
            ]
          });
          var addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un réseau</button>';
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
    let region =$("#newRegion").val();
    let libelle = $("#newLabel").val();
    let direction_regionale_id = $("#newRegioDirec").val();
    id=$.trim(id);
    region=$.trim(region);
    libelle=$.trim(libelle);
    direction_regionale_id=$.trim(direction_regionale_id);
    let errorList="";
    if (!region) {
      errorList+="<li>La région</li>"
    }
    if (!libelle) {
      errorList+="<li>La libellé</li>"
    }
    if (!direction_regionale_id) {
      errorList+="<li>La direction régionale</li>"
    }
    if(errorList!==""){
      $("#addingInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (region && libelle && direction_regionale_id) {      $("#addModal").modal("hide");
    $("#addingInputs").html("");
      $.post(
        "../model/reseau.php",
        {
          action: "add_networks",
          region:region,
          libelle:libelle,
          direction_regionale_id:direction_regionale_id
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newRegion,#newLabel, #newRegioDirec").val("")
          } else {
            customAlert("Erreur lors de l'ajout", "create");
          }
        },
        "json"
      )
    }
  });
  $(document).on("click", ".delete-button", function () {
    var id = $(this).data("id");
    id=$.trim(id)
    customAlert("Êtes-vous sûr de vouloir supprimer ceci ?", "delete", true);
    $(document).on("click", "#confirmOk", function () {
      $.post(
        "../model/reseau.php",
        { action: "delete_networks", id: id },
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
    $("#updateForm").show();
    var id = $(this).data("id");
    id=$.trim(id)
    $("#updatingInputs").html("");
    $.post(
      "../model/reseau.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.idReseau);
          $("#region").val(data.region);
          $("#label").val(data.libelleReseau);
          fillRegions("#regioDirec",data.idDossier);
          $("#updateModal").modal("show");
        } else {
          customAlert(`Erreur lors de la récupération`, "update");
        }
      },
      "json"
      )
  });
  $(document).on("click", "#update-button", function () {
    let id = $("#id").val();
    let region =$("#region").val();
    let libelle = $("#label").val();
    let direction_regionale_id = $("#regioDirec").val();
    id=$.trim(id);
    region=$.trim(region);
    libelle=$.trim(libelle);
    direction_regionale_id=$.trim(direction_regionale_id);
    let errorList="";
    if (!id) {
      errorList+="<li>L'id</li>"
    }
    if (!region) {
      errorList+="<li>La région</li>"
    }
    if (!libelle) {
      errorList+="<li>La libellé</li>"
    }
    if (!direction_regionale_id) {
      errorList+="<li>La direction régionale</li>"
    }
    if(errorList!==""){
      $("#updatingInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (id && region && libelle && direction_regionale_id) {      $("#updateModal").modal("hide");
      $("#updatingInputs").html("");

      $.post(
        "../model/reseau.php",
        {
          action: "update_networks",
          id: id,
          region:region,
          libelle:libelle,
          direction_regionale_id:direction_regionale_id
        },
        
        function (result) {
          if (result.success) {
            customAlert("Modifié avec succès!", "update");
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
