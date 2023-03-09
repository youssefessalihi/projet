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
    $("#newFname,#newLname,#newTel,#newCIN, #newEmail,#newAddress,#newDescription,#newCompany").val("")
    $("#newLname").focus();
  });
  function fillCompanies(element, checkedElement = "") {
    let select = $(element);
    select.html("");
    $.post(
      "../model/actionnaire.php",
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
  function getElements() {
    $("#updateForm").hide();
    $.post(
      "../model/actionnaire.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          fillCompanies("#newCompany");
          const tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
              item[3],
              item[4],
              item[5],
              item[6],
              item[7],
              item[8],
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
              { title: "Prénom" },
              { title: "CIN" },
              { title: "Tél" },
              { title: "Email" },
              { title: "Adresse" },
              { title: "Descriptif" },
              { title: "Société" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2,3,4,5,6,7]
                },
  
                filename: `actionnaires${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des actionnaires";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [40,40,40,60,80,70,70,60];
                }
              },
              {
                extend: "csv",
                charset: 'utf-8',
                exportOptions: {
                  columns: [0,1,2,3,4,5,6,7]
                },
                filename: `actionnaires${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0,1,2,3,4,5,6,7]
                },
  
                filename: `actionnaires${today}`
              },
              "colvis",
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un actionnaire</button>';
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
    let nom = $("#newLname").val();
    let prenom = $("#newFname").val();
    let cin = $("#newCIN").val();
    let tel = $("#newTel").val();
    let email = $("#newEmail").val();
    let adresse = $("#newAddress").val();
    let descriptif = $("#newDescription").val();
    let societe_id = $("#newCompany").val();
    nom=$.trim(nom);
    prenom=$.trim(prenom);
    cin=$.trim(cin);
    tel=$.trim(tel);
    email=$.trim(email);
    adresse=$.trim(adresse);
    descriptif=$.trim(descriptif);
    societe_id=$.trim(societe_id);
    let errorList="";
    if (!nom) {
      errorList+="<li>Le nom</li>"
    }
    if (!prenom) {
      errorList+="<li>Le prénom</li>"
    }
    if (!cin) {
      errorList+="<li>CIN</li>"
    }
    if (!tel) {
      errorList+="<li>Le numéro de téléphone</li>"
    }
    else if (!/^[0-9]{10}$/.test(tel)) {
      errorList+="<li>Le numéro de téléphone invalide !</li>"
    }
    if (!email) {
       errorList+="<li>L'email</li>"
     }
    else  if (!/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(email)) {
      errorList+="<li>L'email est invalide !</li>"
    }
    if (!adresse) {
      errorList+="<li>L'adresse</li>"
    }
    if (!societe_id) {
      errorList+="<li>Société</li>"
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (nom && prenom && cin && /^[0-9]{10}$/.test(tel)  && /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(email) && adresse && descriptif && societe_id) {      $("#addModal").modal("hide");
    $("#addInputs").html("");
      $.post(
        "../model/actionnaire.php",
        {
          action: "add_shareholder",
          nom:nom,
          prenom:prenom,
          cin:cin,
          tel:tel,
          email:email,
          adresse:adresse,
          descriptif:descriptif,
          societe_id:societe_id     
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
            $("#newFname,#newLname,#newTel,#newCIN, #newEmail,#newAddress,#newDescription,#newCompany").val("")
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
        "../model/actionnaire.php",
        { action: "delete_shareholder", id: id },
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
    $("#updateModal").modal("show");
    let id = $(this).data("id");
    id=$.trim(id)
    $.post(
      "../model/actionnaire.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.id);
          $("#lname").val(data.nom);
          $("#fname").val(data.prenom);
          $("#cin").val(data.cin);
          $("#tel").val(data.tel);
          $("#email").val(data.email);
          $("#address").val(data.adresse);
          $("#description").val(data.descriptif);
          fillCompanies("#company",data.idSociete)
        } else {
          customAlert(`Erreur lors de la récupération`, "update");
        }
      },
      "json"
      )
  });
  $(document).on("click", "#update-button", function () {
    let id = $("#id").val();
    let nom = $("#lname").val();
    let prenom = $("#fname").val();
    let cin = $("#cin").val();
    let tel = $("#tel").val();
    let email = $("#email").val();
    let adresse = $("#address").val();
    let descriptif = $("#description").val();
    let societe_id = $("#company").val();
    id=$.trim(id);
    nom=$.trim(nom);
    prenom=$.trim(prenom);
    cin=$.trim(cin);
    tel=$.trim(tel);
    email=$.trim(email);
    adresse=$.trim(adresse);
    descriptif=$.trim(descriptif);
    societe_id=$.trim(societe_id);
    let errorList="";
    if (!nom) {
      errorList+="<li>Le nom</li>"
    }
    if (!prenom) {
      errorList+="<li>Le prénom</li>"
    }
    if (!cin) {
      errorList+="<li>CIN</li>"
    }
    if (!tel) {
      errorList+="<li>Le numéro de téléphone</li>"
    }
    else if (!/^[0-9]{10}$/.test(tel)) {
      errorList+="<li>Le numéro de téléphone invalide !</li>"
    }
    if (!email) {
      errorList+="<li>L'email</li>"
    }
    else if (!/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(email)) {
      errorList+="<li>L'email est invalide !</li>"
    }
    if (!adresse) {
      errorList+="<li>L'adresse</li>"
    }
    if (!societe_id) {
      errorList+="<li>Société</li>"
    }    
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (id && nom && prenom && cin && /^[0-9]{10}$/.test(tel) && email && /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(email) && adresse && descriptif && societe_id) {      $("#addModal").modal("hide");
      $("#updateInputs").html("");
      $.post(
        "../model/actionnaire.php",
        {
          action: "update_shareholder",
          id: id,
          nom:nom,
          prenom:prenom,
          cin:cin,
          tel:tel,
          email:email,
          adresse:adresse,
          descriptif:descriptif,
          societe_id:societe_id
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
