$(document).ready(function() {
  getElements();

  function customAlert(message, operation, confirmationButtons = false) {
    const title = {
      delete: '<i class="bi bi-trash3"></i> Suppression',
      update: '<i class="bi bi-pencil-square"></i> Modification',
      create: '<i class="bi bi-plus-circle"></i> Ajout',
      default: '<i class="bi bi-info-circle"></i> Message',
    };
    $("#alertTitle").empty().html(title[operation] || title.default);
    $("#alertMessage").empty().text(message);
    if (confirmationButtons) {
      $("#alertFooter").html(
        `<button type="button" class="btn btn-secondary bg-success text-light" data-bs-dismiss="modal">Non</button> <button type="button" class="btn btn-secondary bg-danger text-light" id="confirmOk">Oui</button>`
      );
    } else {
      $("#alertFooter").html(
        `<button type="button" class="btn btn-secondary bg-dark text-light" data-bs-dismiss="modal">Fermer</button>`
      );
    }
    $("#customAlert").modal("show");
  }

  $("#addModal").on("shown.bs.modal", function() {
    $("#addInputs").html("");
    $("#newManager").val("");
    $("#newManager").focus();
  });

  function fillGroupes(element, checkedElement = "") {
    let select = $(element);
    select.empty();
    $.post(
      "../model/gerant.php", {
        action: "read_groupes"
      },
      function(result) {
        if (checkedElement !== "") {
          select = $("#groupe");
        }
        if (result.success) {
          const listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner un groupe</option>`);
          listStatus.forEach((item) => {
            if (item[0] === checkedElement) {
              select.append(
                `<option selected value=${item[0]}>${item[1]}</option>`
              );
            } else {
              select.append(`<option value=${item[0]}>${item[1]}</option>`);
            }
          });
        } else {
          customAlert(`Erreur lors de la récupération`);
        }
      },
      "json"
    );
  }
  function getElements() {
    $("#updateForm").hide();
    $.post(
      "../model/gerant.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          fillGroupes("#newGroupe");
          const tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
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
              { title: "Groupe" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1]
                },
  
                filename: `gérants${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des gérants";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [260,260];
                }
              },
              {
                extend: "csv",
                exportOptions: {
                  columns: [0,1]
                },
                filename: `gérants${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0,1]
                },
                filename: `gérants${today}`
              },
              "colvis"
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un gérant</button>';
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
    let libelle = $("#newManager").val();
    let groupe_id = $("#newGroupe").val();
    libelle=$.trim(libelle);
    groupe_id=$.trim(groupe_id);
    let errorList="";
    if (!libelle) {
      errorList+="<li>la libellé</li>"
    }
    if (!groupe_id) {
      errorList+="<li>le groupe</li>"
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (libelle && groupe_id) {      
      $("#addModal").modal("hide");
      $("#addInputs").html("");
      $.post(
        "../model/gerant.php",
        {
          action: "add_manager",
          libelle:libelle,
          groupe_id:groupe_id     
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newManager, #newGroupe").val("")
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
        "../model/gerant.php",
        { action: "delete_manager", id: id },
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
    $("#updateForm").show();
    let id = $(this).data("id");
    id=$.trim(id)
    $.post(
      "../model/gerant.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.idGerant);
          $("#manager").val(data.libelle);
          fillGroupes("#groupe",data.idGroupe);
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
    id=$.trim(id);
    let libelle = $("#manager").val();
    let groupe_id = $("#groupe").val();
    libelle=$.trim(libelle);
    groupe_id=$.trim(groupe_id);
    let errorList="";
    if (!libelle) {
      errorList+="<li>la libellé</li>"
    }
    if (!groupe_id) {
      errorList+="<li>le groupe</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }

    if (id && libelle && groupe_id) {      $("#addModal").modal("hide");
      $("#updateInputs").html("");

      $.post(
        "../model/gerant.php",
        {
          action: "update_manager",
          id: id,
          libelle:libelle,
          groupe_id:groupe_id     
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
