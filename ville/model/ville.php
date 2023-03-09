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

    public function read_regions()
    {
        $sql = "SELECT id, libelle FROM region";
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
        $sql = "SELECT v.id as idVille,v.libelle as libelleVille,r.id as idRegion,r.libelle as libelleRegion FROM ville v join region r on r.id=v.region_id
        WHERE v.id = ?";
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
        $sql = "SELECT v.id as idVille,v.libelle as libelleVille,r.libelle as libelleRegion FROM ville v join region r on r.id=v.region_id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idVille'],
                $row['libelleVille'],
                $row['libelleRegion']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_city()
    {
        $libelle = mysqli_real_escape_string($this->conn, ($_POST['libelle']));
        $region_id = mysqli_real_escape_string($this->conn, ($_POST['region_id']));
        $sql = "insert into ville (libelle,region_id) values (?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "si", $libelle, $region_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_city()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $libelle = mysqli_real_escape_string($this->conn, ($_POST['libelle']));
        $region_id = mysqli_real_escape_string($this->conn, ($_POST['region_id']));
        $sql = "UPDATE ville SET libelle = ?,region_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sii",$libelle, $region_id, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_city()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM ville WHERE id = ?";
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

if (isset($_POST['action']) && $_POST['action'] == 'read_regions') {
    $database->read_regions();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_city') {
    $database->add_city();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_city') {
    $database->update_city();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_city') {
    $database->delete_city();
}
