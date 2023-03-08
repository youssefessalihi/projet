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
    $("#newName,#newTel,#newPw,#newLogin, #newRole").val("")
    $("#newName").focus();
  });
 
  function getElements() {
    $("#updateForm").hide();
    $.post(
      "../model/utilisateur.php",
      { action: "read_all" },
      function (result) {
          const data = result.data;
          const tableData = data.map(function (item) {
            return [
              item[1],
              item[2],
              item[3],
              item[4],
              item[5],
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
              { title: "Nom complet" },
              { title: "Tél" },
              { title: "Login" },
              { title: "Mot de passe" },
              { title: "Rôle" },
              { title: "Action" }
            ],
            dom: "Bfrtip",
            buttons: [
              {
                extend: "pdf",
                exportOptions: {
                  columns: [0,1,2,3,4]
                },
  
                filename: `utilisateurs${today}`,
                customize: function (doc) {
                  doc.content[0].text = "Liste des utilisateurs";
                  doc.styles.tableHeader.alignment = "left";
                  doc.content[1].table.widths = [95,80,95,100,95];
                }
              },
              {
                extend: "csv",
                exportOptions: {
                  columns: [0, 1,2,3,4]
                },
  
                filename: `utilisateurs${today}`
              },
              {
                extend: "copy",
                exportOptions: {
                  columns: [0, 1,2,3,4]
                },
  
                filename: `utilisateurs${today}`
              },
              "colvis"
            ]
          });
          const addButton = '<button type="button" class=" dt-button " style="background-color:blue !important;color:white;" data-bs-toggle="modal" id="addModal" data-bs-target="#addModal"><i class="bi bi-plus-circle"></i> Ajouter un utilisateur</button>';
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
    let nomComplet = $("#newName").val();
    let tel = $("#newTel").val();
    let mdp = $("#newPw").val();
    let login = $("#newLogin").val();
    let role = $("#newRole").val();
    nomComplet=$.trim(nomComplet);
    tel=$.trim(tel);
    mdp=$.trim(mdp);
    login=$.trim(login);
    role=$.trim(role);
    let errorList="";
    if (!nomComplet) {
      errorList+="<li>Le nom complet</li>"
    }
    if (!tel) {
      errorList+="<li>Le numéro de téléphone</li>"
    }
    else if (!/^[0-9]{10}$/.test(tel)) {
      errorList+="<li>Le numéro de téléphone invalide !</li>"
    }
    if (!login) {
      errorList+="<li>Le login</li>"
    }
    else if (!/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(login)) {
      errorList+="<li>Le login invalide !</li>"
    }
    if (!mdp) {
      errorList+="<li>Le mot de passe</li>"
    }
    if (!role) {
      errorList+="<li>Le rôle</li>"
    }
    if(errorList!==""){
      $("#addInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (nomComplet && /^[0-9]{10}$/.test(tel) && mdp && /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(login) && role) {      $("#addModal").modal("hide");
    $("#addInputs").html("");
      $.post(
        "../model/utilisateur.php",
        {
          action: "add_user",
          nomComplet:nomComplet,
          tel:tel,
          mdp:mdp,
          login:login,
          role:role      
        },
        function (result) {
          if (result.success) {
            customAlert("Ajouté avec succès!", "create");
            getElements();
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
        "../model/utilisateur.php",
        { action: "delete_user", id: id },
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
    let id = $(this).data("id");
    id=$.trim(id)
    $.post(
      "../model/utilisateur.php",
      { action: "read_one", id: id },
      function (result) {
        const data=result.data;
        if (result.success) {
          $("#id").val(data.id);
          $("#name").val(data.nomComplet);
          $("#tel").val(data.tel);
          $("#login").val(data.login);
          $("#pw").val(data.mdp);
          $("#role").val(data.role);
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
    let nomComplet = $("#name").val();
    let tel = $("#tel").val();
    let mdp = $("#pw").val();
    let login = $("#login").val();
    let role = $("#role").val();
    id=$.trim(id);
    nomComplet=$.trim(nomComplet);
    tel=$.trim(tel);
    mdp=$.trim(mdp);
    login=$.trim(login);
    role=$.trim(role);
    let errorList="";
    if (!nomComplet) {
      errorList+="<li>Le nom complet</li>"
    }
    if (!tel) {
      errorList+="<li>Le numéro de téléphone</li>"
    }
    else if (!/^[0-9]{10}$/.test(tel)) {
      errorList+="<li>Le numéro de téléphone invalide !</li>"
    }
    if (!login) {
      errorList+="<li>Le login</li>"
    }
    else if (!/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(login)) {
      errorList+="<li>Le login invalide !</li>"
    } 
    if (!mdp) {
      errorList+="<li>Le mot de passe</li>"
    }
    if (!role) {
      errorList+="<li>Le rôle</li>"
    }
    if(errorList!==""){
      $("#updateInputs").html("Veuillez remplir le(s) champ(s) suivant(s):"+errorList);
    }
    if (id && nomComplet && /^[0-9]{10}$/.test(tel) && mdp && /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(login) && role){     $("#addModal").modal("hide");
      $("#updateInputs").html("");

      $.post(
        "../model/utilisateur.php",
        {
          action: "update_user",
          id: id,
          nomComplet:nomComplet,
          tel:tel,
          mdp:mdp,
          login:login,
          role:role
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
