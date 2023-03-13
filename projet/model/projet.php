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
    public function read_types()
    {
        $sql = "SELECT * FROM typeprojet";
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
        $sql = " 
        SELECT p.*,p.id as idProjet,s.id as idSociete ,s.libelle as libelleSociete,tp.id as idType,tp.libelle as typeProjet
        FROM projet p JOIN societe s 
        on p.Societe_id=s.id
        JOIN typeprojet tp
        on tp.id=p.typeProjet
        where p.id=?";
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
        $sql = "
        SELECT p.*,p.id as idProjet,s.libelle as libelleSociete,tp.libelle as typeProjet
        FROM projet p JOIN societe s 
        on p.Societe_id=s.id
        JOIN typeprojet tp
        on tp.id=p.typeProjet
        ";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idProjet'],
                $row['longitude'],
                $row['latitude'],
                $row['nombre'],
                $row['superficieMoyenne'],
                $row['prixMoyen'],
                $row['libelleSociete'],
                $row['nomProjet'],
                $row['typeProjet']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_project()
    {
        $longitude = mysqli_real_escape_string($this->conn, ($_POST['longitude']));
        $latitude = mysqli_real_escape_string($this->conn, ($_POST['latitude']));
        $nombre = mysqli_real_escape_string($this->conn, ($_POST['nombre']));
        $superficieMoyenne = mysqli_real_escape_string($this->conn, ($_POST['superficieMoyenne']));
        $prixMoyen = mysqli_real_escape_string($this->conn, ($_POST['prixMoyen']));
        $societe_id = mysqli_real_escape_string($this->conn, ($_POST['societe_id']));
        $nomProjet = mysqli_real_escape_string($this->conn, ($_POST['nomProjet']));
        $typeProjet = mysqli_real_escape_string($this->conn, ($_POST['typeProjet']));
        $sql = "insert into projet (longitude,latitude,nombre,superficieMoyenne,prixMoyen,societe_id,nomProjet,typeProjet) values (?,?,?,?,?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ddiddisi",  $longitude,$latitude,$nombre,$superficieMoyenne,$prixMoyen,$societe_id,$nomProjet,$typeProjet);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_project()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $longitude = mysqli_real_escape_string($this->conn, ($_POST['longitude']));
        $latitude = mysqli_real_escape_string($this->conn, ($_POST['latitude']));
        $nombre = mysqli_real_escape_string($this->conn, ($_POST['nombre']));
        $superficieMoyenne = mysqli_real_escape_string($this->conn, ($_POST['superficieMoyenne']));
        $prixMoyen = mysqli_real_escape_string($this->conn, ($_POST['prixMoyen']));
        $societe_id = mysqli_real_escape_string($this->conn, ($_POST['societe_id']));
        $nomProjet = mysqli_real_escape_string($this->conn, ($_POST['nomProjet']));
        $sql = "UPDATE projet SET longitude=?,latitude = ?,nombre=?,superficieMoyenne=?,prixMoyen=? ,societe_id=?,nomProjet=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ddiddisi",  $longitude,$latitude,$nombre,$superficieMoyenne,$prixMoyen,$societe_id,$nomProjet, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_project()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM projet WHERE id = ?";
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
else if (isset($_POST['action']) && $_POST['action'] == 'read_types') {
    $database->read_types();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_project') {
    $database->add_project();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_project') {
    $database->update_project();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_project') {
    $database->delete_project();
}
