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
    $("#newDate").focus();
  });
  function fillReports(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/rembourssement.php",
      { action: "read_reports" },
      function (result) {
        if (checkedElement != "") {
          select = $("#creditReport");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner un dossier</option>`)
          listStatus.forEach((item) => {
              if (item[0] == checkedElement) {
                select.append(
                  `<option selected value=${item[0]}>N*${item[1]} - ${item[2]} - ${item[3]}</option>`
                );
              } else {
                select.append(`<option value=${item[0]}>N*${item[1]} - ${item[2]} - ${item[3]}</option>`);
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
      "../model/rembourssement.php",
      { action: "read_all" },
      function (result) {
          var data = result.data;
          fillReports("#newCreditReport");
          var tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
              item[3],
             ` N*${item[4]} - ${item[5]} - ${item[6]}`,
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
              { title: "Montant" },
              { title: "taux" },
              { title: "Dossier" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2,3]
                },
  
                filename: `remboursements${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des remboursements";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [100, 100,100,200];
                }
              },
              {
                extend: "csv",
                exportOptions: {
                  columns: [0, 1,2,3]
                },
  
                filename: `remboursements${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0, 1,2,3]
                },
  
                filename: `remboursements${today}`
              },
              "colvis",
            ]
          });
          var addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un remboursements</button>';
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
    let taux =$("#newRate").val();
    let dossierdecredit_id =$("#newCreditReport").val();
    date=$.trim(date);
    montant=$.trim(montant);
    taux=$.trim(taux);
    dossierdecredit_id=$.trim(dossierdecredit_id);
    let errorList="";
    if (!date) {
      errorList+="<li>La date</li>"
    }
    if (!montant) {
      errorList+="<li>Le montant</li>"
    }
    if (!taux) {
      errorList+="<li>Le taux</li>"
    }
    if (!dossierdecredit_id) {
      errorList+="<li>Le dossier</li>"
    }
    if(errorList!==""){
      $("#addingInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (date && montant && taux && dossierdecredit_id) {      $("#addModal").modal("hide");
    $("#addingInputs").html("");
      $.post(
        "../model/rembourssement.php",
        {
          action: "add_reimbursement",
          date:date,
          taux:taux,
          montant:montant,
          dossierdecredit_id
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newDate,#newAmount, #creditReport,#newRate").val("")
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
        "../model/rembourssement.php",
        { action: "delete_reimbursement", id: id },
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
      "../model/rembourssement.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.idRembourssement);
          $("#date").val(data.date);
          $("#amount").val(data.montant);
          $("#rate").val(data.taux);
          fillReports("#creditReport",data.idDossier);
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
    let taux =$("#rate").val();
    id=$.trim(id);
    date=$.trim(date);
    montant=$.trim(montant);
    taux=$.trim(taux);
    let errorList="";
    if (!id) {
      errorList+="<li>L'id</li>"
    }
    if (!date) {
      errorList+="<li>La date</li>"
    }
    if (!montant) {
      errorList+="<li>Le montant</li>"
    }
    if (!taux) {
      errorList+="<li>Le taux</li>"
    }
    if(errorList!==""){
      $("#updatingInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (id && date && montant && taux) {      $("#addModal").modal("hide");
      $("#updatingInputs").html("");

      $.post(
        "../model/rembourssement.php",
        {
          action: "update_reimbursement",
          id: id,
          date:date,
          taux:taux,
          montant:montant
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
