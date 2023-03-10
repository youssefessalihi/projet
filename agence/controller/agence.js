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
    $("#newName,#newTel,#newAddress, #newCode,#newNetwork,#newCity").val("")
    $("#newName").focus();
  });
  function fillNetworks(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/agence.php",
      { action: "read_networks" },
      function (result) {
        if (checkedElement != "") {
          select = $("#network");
        }
        if (result.success) {
          listStatus = result.data;
          select.append(`<option selected value=""disabled>Séléctionner un réseau</option>`)
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
  function fillCities(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/agence.php",
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
    $("#updateForm").hide();
    $.post(
      "../model/agence.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          fillNetworks("#newNetwork");
          fillCities("#newCity");
          const tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
              item[3],
              item[4]==""?"-":item[4],
              item[5],
              item[6],
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
              { title: "Nom" },
              { title: "adresse" },
              { title: "Tél" },
              { title: "Code" },
              { title: "Réseau" },
              { title: "Ville" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2,3,4,5]
                },
  
                filename: `agences${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des agences";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [80,80,80,80,80,80];
                }
              },
              {
                extend: "csv",
                charset: 'utf-8',
                exportOptions: {
                  columns: [0,1,2,3,4,5]
                },
                filename: `agences${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0,1,2,3,4,5]
                },
  
                filename: `agences${today}`
              },
              "colvis"
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter une agence</button>';
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
    let nom = $("#newName").val();
    let adresse = $("#newAddress").val();
    let tel = $("#newTel").val();
    let code = $("#newCode").val();
    let reseau_id = $("#newNetwork").val();
    let ville_id = $("#newCity").val();
    nom=$.trim(nom);
    adresse=$.trim(adresse);
    tel=$.trim(tel);
    code=$.trim(code);
    reseau_id=$.trim(reseau_id);
    ville_id=$.trim(ville_id);
    let errorList="";
    if (!nom) {
      errorList+="<li>Le nom</li>"
    }
    if (!adresse) {
      errorList+="<li>L'adresse</li>"
    }
    if (!tel) {
      errorList+="<li>Le numéro de téléphone</li>"
    }
    else if (!/^[0-9]{10}$/.test(tel)) {
      errorList+="<li>Le numéro de téléphone invalide !</li>"
    }
    if (!code) {
      errorList+="<li>Le code</li>"
    }
    if (!reseau_id) {
      errorList+="<li>Le réseau</li>"
    }
    if (!ville_id) {
      errorList+="<li>La ville</li>"
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (nom && /^[0-9]{10}$/.test(tel) && adresse && code && reseau_id && ville_id) {      $("#addModal").modal("hide");
    $("#addInputs").html("");
      $.post(
        "../model/agence.php",
        {
          action: "add_agency",
          nom:nom,
          tel:tel,
          adresse:adresse,
          code:code,
          reseau_id:reseau_id,
          ville_id:ville_id  
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newName,#newTel,#newAddress, #newCode,#newNetwork,#newCity").val("")
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
        "../model/agence.php",
        { action: "delete_agency", id: id },
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
    $("#updateModal").modal("show");
    let id = $(this).data("id");
    id=$.trim(id)
    $.post(
      "../model/agence.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.idAgence);
          $("#name").val(data.nom);
          $("#address").val(data.adresse);
          $("#tel").val(data.tel);
          data.code==""?$("#code").val("-"):$("#code").val(data.code);
          fillNetworks("#network",data.idReseau)
          fillCities("#city",data.idVille)
        } else {
          customAlert(`Erreur lors de la récupération`, "update");
        }
      },
      "json"
      )
  });
  $(document).on("click", "#update-button", function () {
    let id = $("#id").val();
    let nom = $("#name").val();
    let adresse = $("#address").val();
    let tel = $("#tel").val();
    let code = $("#code").val();
    let reseau_id = $("#network").val();
    let ville_id = $("#city").val();
    id=$.trim(id);
    nom=$.trim(nom);
    adresse=$.trim(adresse);
    tel=$.trim(tel);
    code=$.trim(code);
    reseau_id=$.trim(reseau_id);
    ville_id=$.trim(ville_id);
    let errorList="";
    if (!nom) {
      errorList+="<li>Le nom</li>"
    }
    if (!adresse) {
      errorList+="<li>L'adresse</li>"
    }
    if (!tel) {
      errorList+="<li>Le numéro de téléphone</li>"
    }
    else if (!/^[0-9]{10}$/.test(tel)) {
      errorList+="<li>Le numéro de téléphone invalide !</li>"
    }
    if (!code) {
      errorList+="<li>Le code</li>"
    }
    if (!reseau_id) {
      errorList+="<li>Le réseau</li>"
    }
    if (!ville_id) {
      errorList+="<li>La ville</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (id && nom && /^[0-9]{10}$/.test(tel) && adresse && code && reseau_id && ville_id) {      $("#addModal").modal("hide");
      $("#updateInputs").html("");
      $.post(
        "../model/agence.php",
        {
          action: "update_agency",
          id: id,
          nom:nom,
          tel:tel,
          adresse:adresse,
          code:code,
          reseau_id:reseau_id
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
