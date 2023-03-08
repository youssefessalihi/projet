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

  function getElements() {
    $("#updateForm").hide();
    $.post(
      "../model/statutProjet.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          const tableData = data.map(function (item) {
            return [
              item[1],
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
              { title: "Libellé" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0]
                },
  
                filename: `statutsProjets${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Les différents status de projets";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [500];
                }
              },
              {
                extend: "csv",
                exportOptions: {
                  columns: [0]
                },
  
                filename: `statutsProjets${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0]
                },
  
                filename: `statutsProjets${today}`
              },
              "colvis"
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un statut </button>';
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
    let libelle = $("#newLabel").val();
    libelle=$.trim(libelle);
    let errorList="";
    if (!libelle) {
      errorList+="<li>Libellé</li>";
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (libelle) {$("#addModal").modal("hide");
      $.post(
        "../model/statutProjet.php",
        {
          action: "add_statuts",
          libelle: libelle
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
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
        "../model/statutProjet.php",
        { action: "delete_statuts", id: id },
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
    $("#updateForm").show();
    let id = $(this).data("id");
    id=$.trim(id)
    $.post(
      "../model/statutProjet.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.id);
          $("#label").val(data.libelle);
          $("#updateModal").modal("show");
        } else {
          customAlert(`Erreur lors de la récupération`, "update");
        }
      },
      "json"
      )
  });
  $("#addModal").on("shown.bs.modal", function () {
    $("#addInputs").html("");
    $("#newLabel").val("")
    $("#newLabel").focus();
  });
  $(document).on("click", "#update-button", function () {
    let id = $("#id").val();
    let libelle=$("#label").val();
    id=$.trim(id);
    libelle=$.trim(libelle);
    let errorList="";
    if (!libelle) {
      errorList+="<li>Libellé</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }

    if (id && libelle) { 
      $("#updateInputs").html("");

      $.post(
        "../model/statutProjet.php",
        {
          action: "update_statuts",
          id: id,
          libelle: libelle
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
