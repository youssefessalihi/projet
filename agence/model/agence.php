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
    public function read_networks()
    {
        $sql = "SELECT * FROM reseau";
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
    public function read_cities()
    {
        $sql = "SELECT * FROM ville";
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
        $sql = "select a.*,a.id as idAgence,r.id as idReseau,r.libelle as libelleReseau,v.id as idVille,v.libelle as libelleVille 
        FROM agence a
        join reseau r on a.reseau_id=r.id 
        join ville v on a.ville_id=v.id where a.id=?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $id);
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
        $sql = "select a.*,a.id as idAgence,r.libelle as libelleReseau,v.libelle as libelleVille 
        FROM agence a
        join reseau r on a.reseau_id=r.id 
        join ville v on a.ville_id=v.id ";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idAgence'],
                $row['nom'],
                $row['adresse'],
                $row['tel'],
                $row['code'],
                $row['libelleReseau'],
                $row['libelleVille']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_agency()
    {
        $nom = mysqli_real_escape_string($this->conn, ($_POST['nom']));
        $adresse = mysqli_real_escape_string($this->conn, ($_POST['adresse']));
        $tel = mysqli_real_escape_string($this->conn, ($_POST['tel']));
        $code = mysqli_real_escape_string($this->conn, ($_POST['code']));
        $reseau_id = mysqli_real_escape_string($this->conn, ($_POST['reseau_id']));
        $ville_id = mysqli_real_escape_string($this->conn, ($_POST['ville_id']));
        $sql = "insert into agence (nom,adresse,tel,code,reseau_id,ville_id) values (?,?,?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssii", $nom,$adresse,$tel,$code,$reseau_id,$ville_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_agency()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $nom = mysqli_real_escape_string($this->conn, ($_POST['nom']));
        $adresse = mysqli_real_escape_string($this->conn, ($_POST['adresse']));
        $tel = mysqli_real_escape_string($this->conn, ($_POST['tel']));
        $code = mysqli_real_escape_string($this->conn, ($_POST['code']));
        $reseau_id = mysqli_real_escape_string($this->conn, ($_POST['reseau_id']));
        $sql = "UPDATE agence SET nom = ?,adresse=?,tel=?,code=?,reseau_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssii",  $nom,$adresse,$tel,$code,$reseau_id, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_agency()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM agence WHERE id = ?";
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
if (isset($_POST['action']) && $_POST['action'] == 'read_networks') {
    $database->read_networks();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_cities') {
    $database->read_cities();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_agency') {
    $database->add_agency();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_agency') {
    $database->update_agency();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_agency') {
    $database->delete_agency();
}
