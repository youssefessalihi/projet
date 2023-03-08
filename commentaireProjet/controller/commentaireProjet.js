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
    $("#newDate").focus();
  });

  function fillProjects(element, checkedElement = "") {
    let select = $(element);
    select.empty();
    $.post(
      "../model/commentaireProjet.php", {
        action: "read_projects"
      },
      function(result) {
        if (checkedElement !== "") {
          select = $("#projet");
        }
        if (result.success) {
          const listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner un projet</option>`);
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
      "../model/commentaireProjet.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          $("#newProjet").html("");
          fillProjects("#newProjet");
          const tableData = data.map(function (item) {
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
              { title: "Date" },
              { title: "Commentaire" },
              { title: "Nom du projet" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2]
                },
  
                filename: `commentaires${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des commentaires";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [150,150,150];
                }
              },
              {
                extend: "csv",
                exportOptions: {
                  columns: [0,1,2]
                },
                filename: `commentaires${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0, 1,2]
                },
                filename: `commentaires${today}`
              },
              "colvis"
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un commentaire</button>';
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
    let date = $("#newDate").val();
    let comment = $("#newComment").val();
    let projet = $("#newProjet").val();
    date=$.trim(date);
    comment=$.trim(comment);
    projet=$.trim(projet);
    let errorList="";
    if (!date) {
      errorList+="<li>La date</li>"
    }
    if (!comment) {
      errorList+="<li>Le commentaire</li>"
    }
    if (!projet) {
      errorList+="<li>Le projet</li>"
    }
    if(errorList!==""){
      $("#ajoutInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (date && comment && projet) {      $("#addModal").modal("hide");
    $("#ajoutInputs").html("");
      $.post(
        "../model/commentaireProjet.php",
        {
          action: "add_comment",
          date:date,
          comment:comment,
          projet:projet      
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newDate,#newComment, #newProjet").val("")
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
        "../model/commentaireProjet.php",
        { action: "delete_comment", id: id },
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
    let id = $(this).data("id");
    id=$.trim(id)
    $.post(
      "../model/commentaireProjet.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.id);
          date = $("#date").val(data.date);
          comment = $("#comment").val(data.commentaire);
          fillProjects("#projet",data.idProjet);
          $("#updateModal").modal("show");
          $("#result_filter input").val(data.label);
        } else {
          customAlert(`Erreur lors de la récupération`, "update");
        }
      },
      "json"
      )
  });
  $(document).on("click", "#update-button", function () {
    let id = $("#id").val();
    let date = $("#date").val();
    let comment = $("#comment").val();
    let projet=$("#projet").val();
    id=$.trim(id);
    date=$.trim(date);
    comment=$.trim(comment);
    projet=$.trim(projet);
    let errorList="";
    if (!date) {
      errorList+="<li>La date</li>"
    }
    if (!comment) {
      errorList+="<li>Le commentaire</li>"
    }
    if (!projet) {
      errorList+="<li>Le projet</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }

    if (id && date && comment && projet) {      $("#addModal").modal("hide");
      $("#updateInputs").html("");

      $.post(
        "../model/commentaireProjet.php",
        {
          action: "update_comment",
          id: id,
          date:date,
          comment:comment,
          projet:projet   
        },
        
        function (result) {
          if (result.success) {
            customAlert("Modifié avec succès!", "update");
            $("#updateForm").hide();
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
