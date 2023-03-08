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
    $("#newIF").focus();
  })
  function getElements() {
    $("#updateForm").hide();
    $.post(
      "../model/groupe.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          $("#newGroupe").html("");
          const tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
              item[3],
              `<button class="btn btn-success edit-button m-1" style="width: 100px;padding:2px;" data-id="${item[0]}">Modifier</button>  <button class="btn btn-danger delete-button  m-1"  style="width: 100px;padding:2px;"  data-id="${item[0]}">Supprimer</button>`
            ];
          });
          const date = new Date();
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const today = `${day}-${month}-${year}`;

          $("#result").DataTable({
            destroy: true,
            data: tableData,
            columns: [
              { title: "Identifiant Fiscal" },
              { title: "Descriptif" },
              { title: "Nom du groupe" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2]
                },
  
                filename: `Groupes${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des groupes";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [170, 170,170];
                }
              },
              {
                extend: "csv",
                exportOptions: {
                  columns: [0, 1,2]
                },
  
                filename: `Groupes${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0, 1,2]
                },
  
                filename: `Groupes${today}`
              },
              "colvis"
            ]
          });
          const  addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un groupe</button>';
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
    let idF = $("#newIF").val();
    let descriptif = $("#newDescription").val();
    let groupe = $("#newGroupe").val();
    idF=$.trim(idF);
    descriptif=$.trim(descriptif);
    groupe=$.trim(groupe);
    let errorList="";
    if (!idF) {
      errorList+="<li>L'identifiant fiscal</li>"
    }
    if (!descriptif) {
      errorList+="<li>Le descriptif</li>"
    }
    if (!groupe) {
      errorList+="<li>Le nom du groupe</li>"
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (idF && descriptif && groupe) {      $("#addModal").modal("hide");
    $("#addInputs").html("");
      $.post(
        "../model/groupe.php",
        {
          action: "add_groupe",
          idF: idF,
          descriptif : descriptif,
          groupe: groupe        
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newIF,#newDescription, #newGroupe").val("")
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
        "../model/groupe.php",
        { action: "delete_groupe", id: id },
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
    $("#updateForm").show();
    $("#updateInputs").html("");
    let id = $(this).data("id");
    id=$.trim(id)
    $.post(
      "../model/groupe.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.id);
          $("#idF").val(data.if_groupe);
          $("#description").val(data.descriptif);
          $("#groupe").val(data.nomGroupe);
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
    let idF= $("#idF").val();
    let descriptif=$("#description").val();
    let groupe= $("#groupe").val();
    id=$.trim(id);
    idF=$.trim(idF);
    descriptif=$.trim(descriptif);
    groupe=$.trim(groupe);
    let errorList="";
    if (!idF) {
      errorList+="<li>L'identifiant fiscal</li>"
    }
    if (!descriptif) {
      errorList+="<li>Le descriptif</li>"
    }
    if (!groupe) {
      errorList+="<li>Le nom du groupe</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }

    if (id && idF && descriptif && groupe) { 
      $("#updateInputs").html("");

      $.post(
        "../model/groupe.php",
        {
          action: "update_groupe",
          id: id,
          idF: idF,
          descriptif : descriptif,
          groupe: groupe      
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
