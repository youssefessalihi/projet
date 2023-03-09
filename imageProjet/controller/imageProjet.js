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
    $("#newDate").html("");
    $("#newDate").focus();
  });
  function fillProjects(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/imageProjet.php",
      { action: "read_projects" },
      function (result) {
        if (checkedElement != "") {
          select = $("#projet");
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
  function getElements() {
    $.post(
      "../model/imageProjet.php",
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
            { title: "URL" },
            { title: "Date" },
            { title: "Nom du projet" },
            { title: "Action" }
          ],
          dom: "Bfrtip",
          buttons: [
            {
              extend: "pdf",
              exportOptions: {
                columns: [0, 1, 2]
              },

              filename: `images${today}`,
              customize: function (doc) {
                doc.content[0].text = "Liste des images";
                doc.styles.tableHeader.alignment = "left";
                doc.content[1].table.widths = [170, 170, 170];
              }
            },
            {
              extend: "csv",
              exportOptions: {
                columns: [0, 1, 2]
              },

              filename: `images${today}`
            },
            {
              extend: "copy",
              exportOptions: {
                columns: [0, 1, 2]
              },

              filename: `images${today}`
            },
            "colvis"
          ]
        });
        const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter une image</button>';
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
    let url = $("#newURL").val();
    let projet = $("#newProjet").val();
    date = $.trim(date);
    url = $.trim(url);
    projet = $.trim(projet);
    let errorList = "";
    if (!date) {
      errorList += "<li>La date</li>"
    }
    if (!url) {
      errorList += "<li>L'URL</li>"
    }
    if (!projet) {
      errorList += "<li>Le projet</li>"
    }
    if (errorList !== "") {
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):" + errorList);
    }
    if (date && url && projet) {
      $("#addModal").modal("hide");
      $("#addInputs").html("");
      $.post(
        "../model/imageProjet.php",
        {
          action: "add_image",
          url: url,
          date: date,
          projet: projet
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newDate,#newURL, #newProjet").val("")
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
    id = $.trim(id)
    customAlert("Êtes-vous sûr de vouloir supprimer ceci ?", "delete", true);
    $(document).on("click", "#confirmOk", function () {
      $.post(
        "../model/imageProjet.php",
        { action: "delete_image", id: id },
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
    id = $.trim(id)
    $.post(
      "../model/imageProjet.php",
      { action: "read_one", id: id },
      function (result) {
        const data = result.data;
        if (result.success) {
          $("#id").val(data.idImage);
          $("#url").val(data.url);
          $("#date").val(data.date);
          fillProjects("#projet", data.idProjet);
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
    let date = $("#date").val();
    let url = $("#url").val();
    let projet = $("#projet").val();
    id = $.trim(id);
    date = $.trim(date);
    url = $.trim(url);
    projet = $.trim(projet);
    let errorList = "";
    if (!id) {
      errorList += "<li>L'id</li>"
    }
    if (!date) {
      errorList += "<li>La date</li>"
    }
    if (!url) {
      errorList += "<li>L'URL</li>"
    }
    if (!projet) {
      errorList += "<li>Le projet</li>"
    }
    if (errorList !== "") {
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):" + errorList);
    }

    if (id && date && url && projet) {
      $("#addModal").modal("hide");
      $("#updateInputs").html("");

      $.post(
        "../model/imageProjet.php",
        {
          action: "update_image",
          id: id,
          url: url,
          date: date,
          projet: projet
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
