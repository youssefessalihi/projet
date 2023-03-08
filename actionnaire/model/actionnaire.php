<?php
class Database
{
    private $host = "localhost";
    private $user = "root";
    private $password = "";
    private $database = "projetv2";
    private $conn;

    public function __construct()
    {
        $this->conn = mysqli_connect($this->host, $this->user, $this->password, $this->database);
        if (!$this->conn) {
            die("Connection failed ");
        }
    }
    public function read_companies()
    {
        $sql = "SELECT * FROM societe";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['libelle']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function read_one()
    {
        $id = mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $sql = "select a.*,s.id as idSociete  from actionnaire a join societe s on s.id=a.societe_id WHERE a.id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        if ($result) {
            $data = mysqli_fetch_assoc($result);
            echo json_encode(array('success' => true, 'data' => $data));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function read_all()
    {
        $sql = "select a.*,s.libelle as libelleSociete  from actionnaire a join societe s on s.id=a.societe_id ";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['nom'],
                $row['prenom'],
                $row['cin'],
                $row['tel'],
                $row['email'],
                $row['adresse'],
                $row['descriptif'],
                $row['libelleSociete']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_shareholder()
    {
        $nom = mysqli_real_escape_string($this->conn, ($_POST['nom']));
        $prenom = mysqli_real_escape_string($this->conn, ($_POST['prenom']));
        $cin = mysqli_real_escape_string($this->conn, ($_POST['cin']));
        $tel = mysqli_real_escape_string($this->conn, ($_POST['tel']));
        $email = mysqli_real_escape_string($this->conn, ($_POST['email']));
        $adresse = mysqli_real_escape_string($this->conn, ($_POST['adresse']));
        $descriptif = mysqli_real_escape_string($this->conn, ($_POST['descriptif']));
        $societe_id = mysqli_real_escape_string($this->conn, ($_POST['societe_id']));
        $sql = "insert into actionnaire (nom,prenom,cin,tel,email,adresse,descriptif,societe_id) values (?,?,?,?,?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssssssi", $nom, $prenom,$cin,$tel,$email,$adresse,$descriptif,$societe_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_shareholder()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $nom = mysqli_real_escape_string($this->conn, ($_POST['nom']));
        $prenom = mysqli_real_escape_string($this->conn, ($_POST['prenom']));
        $cin = mysqli_real_escape_string($this->conn, ($_POST['cin']));
        $tel = mysqli_real_escape_string($this->conn, ($_POST['tel']));
        $email = mysqli_real_escape_string($this->conn, ($_POST['email']));
        $adresse = mysqli_real_escape_string($this->conn, ($_POST['adresse']));
        $descriptif = mysqli_real_escape_string($this->conn, ($_POST['descriptif']));
        $societe_id = mysqli_real_escape_string($this->conn, ($_POST['societe_id']));
        $sql = "UPDATE actionnaire SET nom = ?,prenom = ?,cin=?,tel=?,email=?,adresse=?,descriptif=?,societe_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssssssi", $nom, $prenom,$cin,$tel,$email,$adresse,$descriptif,$societe_id, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_shareholder()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM actionnaire WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $id);
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false, 'data' => $id));
        }
    }
}
$database = new Database();
if (isset($_POST['action']) && $_POST['action'] == 'read_companies') {
    $database->read_companies();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_shareholder') {
    $database->add_shareholder();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_shareholder') {
    $database->update_shareholder();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_shareholder') {
    $database->delete_shareholder();
}
