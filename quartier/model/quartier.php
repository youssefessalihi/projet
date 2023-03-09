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

    public function read_cities()
    {
        $sql = "SELECT id, libelle FROM ville";
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
        $sql = "SELECT q.id as idQuartier,q.libelle as libelleQuartier,q.code_quartier,v.libelle as libelleVille,v.id as idVille FROM quartier q join ville v on v.id=q.ville_id
        WHERE q.id = ?";
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
        $sql = "SELECT q.id as idQuartier,q.libelle as libelleQuartier,q.code_quartier,v.libelle as libelleVille,v.id as idVille FROM quartier q join ville v on v.id=q.ville_id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idQuartier'],
                $row['libelleQuartier'],
                $row['code_quartier'],
                $row['libelleVille'],
                $row['idVille']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_quartier()
    {
        $libelle = mysqli_real_escape_string($this->conn, ($_POST['libelle']));
        $code_quartier = mysqli_real_escape_string($this->conn, ($_POST['code_quartier']));
        $ville_id = mysqli_real_escape_string($this->conn, ($_POST['ville_id']));
        $sql = "insert into quartier (libelle,code_quartier,ville_id) values (?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssi", $libelle, $code_quartier, $ville_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_quartier()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $libelle = mysqli_real_escape_string($this->conn, ($_POST['libelle']));
        $code_quartier = mysqli_real_escape_string($this->conn, ($_POST['code_quartier']));
        $ville_id = mysqli_real_escape_string($this->conn, ($_POST['ville_id']));
        $sql = "UPDATE quartier SET libelle = ?, code_quartier = ?,ville_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssii",$libelle, $code_quartier, $ville_id, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_quartier()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM quartier WHERE id = ?";
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

if (isset($_POST['action']) && $_POST['action'] == 'read_cities') {
    $database->read_cities();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_quartier') {
    $database->add_quartier();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_quartier') {
    $database->update_quartier();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_quartier') {
    $database->delete_quartier();
}
