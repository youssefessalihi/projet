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
    $("#newLabel,#newCode, #newCity").val("")
    $("#newLabel").focus();
  });
  function fillCities(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/quartier.php",
      { action: "read_cities" },
      function (result) {
        if (checkedElement != "") {
          select = $("#city");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner une ville</option>`)
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
      "../model/quartier.php",
      { action: "read_all" },
      function (result) {
        const data = result.data;
        $("#newCity").html("");
        fillCities("#newCity");
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
            { title: "Libellé" },
            { title: "Code quartier" },
            { title: "Ville" },
            { title: "Action" }
          ],
          dom: "Bfrtip",
          buttons: [
            {
              extend: "pdf",
              exportOptions: {
                columns: [0, 1, 2]
              },

              filename: `quartiers${today}`,
              customize: function (doc) {
                doc.content[0].text = "Liste des quartiers";
                doc.styles.tableHeader.alignment = "left";
                doc.content[1].table.widths = [170, 170, 170];
              }
            },
            {
              extend: "csv",
              exportOptions: {
                columns: [0, 1, 2]
              },

              filename: `quartiers${today}`
            },
            {
              extend: "copy",
              exportOptions: {
                columns: [0, 1, 2]
              },

              filename: `quartiers${today}`
            },
            "colvis"
          ]
        });
        const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un quartier</button>';
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
    let code_quartier = $("#newCode").val();
    let ville_id = $("#newCity").val();
    libelle = $.trim(libelle);
    code_quartier = $.trim(code_quartier);
    ville_id = $.trim(ville_id);
    let errorList = "";
    if (!libelle) {
      errorList += "<li>La libellé</li>"
    }
    if (!code_quartier) {
      errorList += "<li>Le code quartier</li>"
    }
    if (!ville_id) {
      errorList += "<li>La ville</li>"
    }
    if (errorList !== "") {
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):" + errorList);
    }
    if (libelle && code_quartier && ville_id) {
      $("#addModal").modal("hide");
      $("#addInputs").html("");
      $.post(
        "../model/quartier.php",
        {
          action: "add_quartier",
          libelle: libelle,
          code_quartier: code_quartier,
          ville_id: ville_id
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newLabel,#newCode, #newCity").val("")
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
        "../model/quartier.php",
        { action: "delete_quartier", id: id },
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
    id = $.trim(id)
    $.post(
      "../model/quartier.php",
      { action: "read_one", id: id },
      function (result) {
        const data = result.data;
        if (result.success) {
          $("#id").val(data.idQuartier);
          $("#label").val(data.libelleQuartier);
          $("#code").val(data.code_quartier);
          fillCities("#city", data.idVille);
        } else {
          customAlert(`Erreur lors de la récupération`, "update");
        }
      },
      "json"
    )
  });
  $(document).on("click", "#update-button", function () {
    let id = $("#id").val();
    let libelle = $("#label").val();
    let code_quartier = $("#code").val();
    let ville_id = $("#city").val();
    id = $.trim(id);
    libelle = $.trim(libelle);
    code_quartier = $.trim(code_quartier);
    ville_id = $.trim(ville_id);
    let errorList = "";
    if (!id) {
      errorList += "<li>L'id</li>"
    }
    if (!libelle) {
      errorList += "<li>La libellé</li>"
    }
    if (!code_quartier) {
      errorList += "<li>Le code quartier</li>"
    }
    if (!ville_id) {
      errorList += "<li>La ville</li>"
    }
    if (errorList !== "") {
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):" + errorList);
    }

    if (id && libelle && code_quartier && ville_id) {
      $("#addModal").modal("hide");
      $("#updateInputs").html("");

      $.post(
        "../model/quartier.php",
        {
          action: "update_quartier",
          id: id,
          libelle: libelle,
          code_quartier: code_quartier,
          ville_id: ville_id
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
