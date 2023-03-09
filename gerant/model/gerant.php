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

    public function read_groupes()
    {
        $sql = "SELECT id, nomGroupe FROM groupe";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['nomGroupe']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function read_one()
    {
        $id = mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $sql = "SELECT g.id as idGerant,g.libelle,gr.id as idGroupe,gr.nomGroupe FROM gerant g join groupe gr on gr.id=g.groupe_id
        WHERE g.id = ?";
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
        $sql = "SELECT g.id as idGerant,g.libelle,gr.nomGroupe FROM gerant g join groupe gr on gr.id=g.groupe_id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idGerant'],
                $row['libelle'],
                $row['nomGroupe']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_manager()
    {
        $libelle = mysqli_real_escape_string($this->conn, ($_POST['libelle']));
        $groupe_id = mysqli_real_escape_string($this->conn, ($_POST['groupe_id']));
        $sql = "insert into gerant (libelle,groupe_id) values (?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "si", $libelle, $groupe_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_manager()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $libelle = mysqli_real_escape_string($this->conn, ($_POST['libelle']));
        $groupe_id = mysqli_real_escape_string($this->conn, ($_POST['groupe_id']));
        $sql = "UPDATE gerant SET libelle = ?,groupe_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sii",$libelle, $groupe_id, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_manager()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM gerant WHERE id = ?";
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

if (isset($_POST['action']) && $_POST['action'] == 'read_groupes') {
    $database->read_groupes();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_manager') {
    $database->add_manager();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_manager') {
    $database->update_manager();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_manager') {
    $database->delete_manager();
}
