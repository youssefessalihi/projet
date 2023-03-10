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
    public function read_projects()
    {
        $sql = "SELECT * FROM projet";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['nomProjet']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }
    public function read_types()
    {
        $sql = "SELECT * FROM typecomposition";
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
                select c.*,c.id as idComposition,tc.id as idType,p.id as idProjet
        FROM composition c
        join typecomposition  tc on c.typeComposition_id=tc.id 
        join projet p on c.Projet_id=p.id 
        where c.id=?";
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
        select c.*,c.id as idComposition,tc.libelle as libelleTypeComp,p.nomProjet
        FROM composition c
        join typecomposition  tc on c.typeComposition_id=tc.id 
        join projet p on c.Projet_id=p.id 
        ";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idComposition'],
                $row['superficieMoyenne'],
                $row['prixMoyen'],
                $row['nombre'],
                $row['nomProjet'],
                $row['icon'],
                $row['libelleTypeComp']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_composition()
    {
        $superficieMoyenne = mysqli_real_escape_string($this->conn, ($_POST['superficieMoyenne']));
        $prixMoyen = mysqli_real_escape_string($this->conn, ($_POST['prixMoyen']));
        $nombre = mysqli_real_escape_string($this->conn, ($_POST['nombre']));
        $icon = mysqli_real_escape_string($this->conn, ($_POST['icon']));
        $projet_id = mysqli_real_escape_string($this->conn, ($_POST['projet_id']));
        $typecomposition_id = mysqli_real_escape_string($this->conn, ($_POST['typecomposition_id']));
        $sql = "insert into composition (superficieMoyenne,prixMoyen,nombre,icon,projet_id,typecomposition_id) values (?,?,?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ddisii",  $superficieMoyenne,$prixMoyen,$nombre,$icon,$projet_id,$typecomposition_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_composition()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $superficieMoyenne = mysqli_real_escape_string($this->conn, ($_POST['superficieMoyenne']));
        $prixMoyen = mysqli_real_escape_string($this->conn, ($_POST['prixMoyen']));
        $nombre = mysqli_real_escape_string($this->conn, ($_POST['nombre']));
        $icon = mysqli_real_escape_string($this->conn, ($_POST['icon']));
        $projet_id = mysqli_real_escape_string($this->conn, ($_POST['projet_id']));
        $sql = "UPDATE composition SET superficieMoyenne = ?,prixMoyen=?,nombre=?,icon=?,projet_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ddisii",  $superficieMoyenne,$prixMoyen,$nombre,$icon,$projet_id, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_composition()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM composition WHERE id = ?";
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
if (isset($_POST['action']) && $_POST['action'] == 'read_projects') {
    $database->read_projects();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_types') {
    $database->read_types();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_composition') {
    $database->add_composition();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_composition') {
    $database->update_composition();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_composition') {
    $database->delete_composition();
}
