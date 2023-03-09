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
    $("#newDate,#newAmount, #newRate,#newURL,#newFolder").val("")
    $("#newDate").focus();
  });
  function fillPapers(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/deblocage.php",
      { action: "read_papers" },
      function (result) {
        if (checkedElement != "") {
          select = $("#folder");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner un dossier</option>`)
          listStatus.forEach((item) => {
            if (item[0] == checkedElement) {
              select.append(
                `<option selected value=${item[0]}>N*${item[1]}-${item[3]}-${item[2]}</option>`
              );
            } else {
              select.append(`<option value=${item[0]}>N*${item[1]}-${item[3]}-${item[2]}</option>`);
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
      "../model/deblocage.php",
      { action: "read_all" },
      function (result) {
        const data = result.data;
        fillPapers("#newFolder");
        const tableData = data.map(function (item) {
          return [
            item[1],
            item[2],
            item[3],
            item[4]==""?"-":item[4],
            item[5],
            item[6],
            item[7],
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
            { title: "Date" },
            { title: "Montant" },
            { title: "Taux" },
            { title: "URL d'image" },
            { title: "N* Dossier" },
            { title: "Statut de crédit" },
            { title: "Objet de financement" },
            { title: "Action" }
          ],
          dom: "Bfrtip",
          buttons: [
            {
              extend: "pdf",
              exportOptions: {
                columns: [0, 1, 2, 3, 4, 5, 6]
              },

              filename: `déblocages${today}`,
              customize: function (doc) {
                doc.content[0].text = "Liste des déblocages";
                doc.styles.tableHeader.alignment = "left";
                doc.content[1].table.widths = [65,65,65,65,65,65,65];
              }
            },
            {
              extend: "csv",
              charset: 'utf-8',
              exportOptions: {
                columns: [0, 1, 2, 3, 4, 5, 6]
              },
              filename: `déblocages${today}`
            },
            {
              extend: "copy",
              exportOptions: {
                columns: [0, 1, 2, 3, 4, 5, 6]
              },

              filename: `déblocages${today}`
            },
            "colvis"
          ]
        });
        const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un déblocage</button>';
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
    let montant = $("#newAmount").val();
    let taux = $("#newRate").val();
    let img_url = $("#newURL").val();
    let dossierdecredit_id = $("#newFolder").val();
    date = $.trim(date);
    montant = $.trim(montant);
    taux = $.trim(taux);
    img_url = $.trim(img_url);
    dossierdecredit_id = $.trim(dossierdecredit_id);
    let errorList = "";
    if (!date) {
      errorList += "<li>La date</li>"
    }
    if (!montant) {
      errorList += "<li>Le montant</li>"
    }
    if (!taux) {
      errorList += "<li>Le taux</li>"
    }
    if (!img_url) {
      errorList += "<li>L'URL d'image</li>"
    }
    if (!dossierdecredit_id) {
      errorList += "<li>Le dossier de crédit</li>"
    }
    if (errorList !== "") {
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):" + errorList);
    }
    if (date && montant && taux && img_url && dossierdecredit_id) {
      $("#addModal").modal("hide");
      $("#addInputs").html("");
      $.post(
        "../model/deblocage.php",
        {
          action: "add_unlock",
          date:date,
          montant:montant,
          taux:taux,
          img_url:img_url,
          dossierdecredit_id
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newDate,#newAmount, #newRate,#newURL,#newFolder").val("")
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
        "../model/deblocage.php",
        { action: "delete_unlock", id: id },
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
    $("#updateModal").modal("show");
    $("#updateInputs").html("");
    let id = $(this).data("id");
    id = $.trim(id)
    $.post(
      "../model/deblocage.php",
      { action: "read_one", id: id },
      function (result) {
        const data = result.data;
        if (result.success) {
          $("#id").val(data.idDeblocage);
          $("#date").val(data.dateDeblocage);
          $("#amount").val(data.montantDeblocage);
          $("#rate").val(data.tauxDeblocage);
          data.imgDeblocage==""?$("#url").val("-"):$("#url").val(data.imgDeblocage);
          fillPapers("#folder", data.idCredit)
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
    let montant = $("#amount").val();
    let taux = $("#rate").val();
    let img_url = $("#url").val();
    id = $.trim(id);
    date = $.trim(date);
    montant = $.trim(montant);
    taux = $.trim(taux);
    img_url = $.trim(img_url);
    let errorList = "";
    if (!date) {
      errorList += "<li>La date</li>"
    }
    if (!montant) {
      errorList += "<li>Le montant</li>"
    }
    if (!taux) {
      errorList += "<li>Le taux</li>"
    }
    if (!img_url) {
      errorList += "<li>L'URL d'image</li>"
    }
    if (errorList !== "") {
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):" + errorList);
    }
    if (id && date && montant && taux && img_url ) {
      $("#addModal").modal("hide");
      $("#updateInputs").html("");
      $.post(
        "../model/deblocage.php",
        {
          action: "update_unlock",
          id: id,
          date:date,
          montant:montant,
          taux:taux,
          img_url:img_url,
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
