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
    $("#newCompany,#newShareholder,#newActio, #newPart,#newManager").val("")
    $("#newCompany").focus();
  });
  function fillCompanies(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/parts_sociales.php",
      { action: "read_companies" },
      function (result) {
        if (checkedElement != "") {
          select = $("#company");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner une société</option>`)
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
  function fillShareholders(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/parts_sociales.php",
      { action: "read_shareholders" },
      function (result) {
        if (checkedElement != "") {
          select = $("#shareholder");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner un actionnaire</option>`)
          listStatus.forEach((item) => {
              if (item[0] == checkedElement) {
                select.append(
                  `<option selected value=${item[0]}>${item[1]} | ${item[2]} ${item[3]}</option>`
                );
              } else {
                select.append(`<option value=${item[0]}>${item[1]} | ${item[2]} ${item[3]}</option>`);
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
      "../model/parts_sociales.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          fillCompanies("#newCompany");
          fillShareholders("#newShareholder");
          const tableData = data.map(function (item) {
            return [
              item[1],
           `${item[2]} | ${item[3]} ${item[4]}`,
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
              { title: "Société" },
              { title: "Actionnaire sélectionné" },
              { title: "Actionnaire" },
              { title: "Part" },
              { title: "Gérant" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2,3,4]
                },
  
                filename: `parts_sociales${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des parts sociales";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [90,90,90,90,90];
                }
              },
              {
                extend: "csv",
                charset: 'utf-8',
                exportOptions: {
                  columns: [0,1,2,3,4]
                },
                filename: `parts_sociales${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0,1,2,3,4]
                },
  
                filename: `parts_sociales${today}`
              },
              "colvis"
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter une part sociale</button>';
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
    let societe_id = $("#newCompany").val();
    let actionnaire_id = $("#newShareholder").val();
    let actionnaire = $("#newActio").val();
    let part = $("#newPart").val();
    let gerant = $("#newManager").val();
    societe_id=$.trim(societe_id);
    actionnaire_id=$.trim(actionnaire_id);
    actionnaire=$.trim(actionnaire);
    part=$.trim(part);
    gerant=$.trim(gerant);
    let errorList="";
    if (!societe_id) {
      errorList+="<li>Sélectionner une société</li>"
    }
    if (!actionnaire_id) {
      errorList+="<li>Sélectionner un actionnaire</li>"
    }
    if (!actionnaire) {
      errorList+="<li>L'actionnaire</li>"
    }
    if (!part) {
      errorList+="<li>La part</li>"
    }
    if (!gerant) {
      errorList+="<li>Le gérant</li>"
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (societe_id && actionnaire_id && actionnaire && part && gerant) {      $("#addModal").modal("hide");
    $("#addInputs").html("");
      $.post(
        "../model/parts_sociales.php",
        {
          action: "add_shares",
          societe_id:societe_id,
          actionnaire_id:actionnaire_id,
          actionnaire:actionnaire,
          part:part,
          gerant:gerant
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newCompany,#newShareholder,#newActio, #newPart,#newManager").val("")
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
        "../model/parts_sociales.php",
        { action: "delete_shares", id: id },
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
    id=$.trim(id)
    $.post(
      "../model/parts_sociales.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.idParts);
          fillCompanies("#company",data.idSociete)
          fillShareholders("#shareholder",data.idActionnaire)
          $("#actio").val(data.actionnaire);
          $("#part").val(data.part);
          $("#manager").val(data.gerant);
        } else {
          customAlert(`Erreur lors de la récupération`, "update");
        }
      },
      "json"
      )
  });
  $(document).on("click", "#update-button", function () {
    let id = $("#id").val();
    let actionnaire = $("#actio").val();
    let part = $("#part").val();
    let gerant = $("#manager").val();
    id=$.trim(id);
    actionnaire=$.trim(actionnaire);
    part=$.trim(part);
    gerant=$.trim(gerant);
    let errorList="";
    if (!actionnaire) {
      errorList+="<li>L'actionnaire</li>"
    }
    if (!part) {
      errorList+="<li>La part</li>"
    }
    if (!gerant) {
      errorList+="<li>Le gérant</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (id && actionnaire && part && gerant) {      $("#addModal").modal("hide");
      $("#updateInputs").html("");
      $.post(
        "../model/parts_sociales.php",
        {
          action: "update_shares",
          id: id,
          actionnaire:actionnaire,
          part:part,
          gerant:gerant
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
