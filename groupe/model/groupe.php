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

    public function read_one()
    {
        $id = mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $sql = "SELECT * from groupe WHERE id = ?";
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
        $sql = "SELECT * from groupe";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['if_groupe'],
                $row['descriptif'],
                $row['nomGroupe']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_groupe()
    {
        $idF = mysqli_real_escape_string($this->conn, ($_POST['idF']));
        $descriptif = mysqli_real_escape_string($this->conn, ($_POST['descriptif']));
        $groupe = mysqli_real_escape_string($this->conn, ($_POST['groupe']));
        $sql = "insert into groupe (if_groupe,descriptif,nomGroupe) values (?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sss", $idF, $descriptif, $groupe);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_groupe()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $idF = mysqli_real_escape_string($this->conn, ($_POST['idF']));
        $descriptif = mysqli_real_escape_string($this->conn, ($_POST['descriptif']));
        $groupe = mysqli_real_escape_string($this->conn, ($_POST['groupe']));
        $sql = "UPDATE groupe SET if_groupe = ?, descriptif = ?,nomGroupe = ? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssi", $idF, $descriptif,$groupe, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_groupe()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM groupe WHERE id = ?";
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

if (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_groupe') {
    $database->add_groupe();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_groupe') {
    $database->update_groupe();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_groupe') {
    $database->delete_groupe();
}
