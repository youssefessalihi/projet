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
    public function read_types()
    {
        $sql = "SELECT * FROM u";
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
        $sql = "select user.*,user.id as idUser,u.libelle,u.id as idType from user join u on user.typeutilisateur_id=u.id WHERE user.id = ?";
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
        $sql = "select user.*,user.id as idUser,u.libelle from user join u on user.typeutilisateur_id=u.id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idUser'],
                $row['nomComplet'],
                $row['tel'],
                $row['login'],
                $row['mdp'],
                $row['libelle']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_user()
    {
        $nomComplet = mysqli_real_escape_string($this->conn, ($_POST['nomComplet']));
        $tel = mysqli_real_escape_string($this->conn, ($_POST['tel']));
        $login = mysqli_real_escape_string($this->conn, ($_POST['login']));
        $mdp = mysqli_real_escape_string($this->conn, ($_POST['mdp']));
        $typeutilisateur_id = mysqli_real_escape_string($this->conn, ($_POST['typeutilisateur_id']));
        $sql = "insert into user (nomComplet,tel,login,mdp,typeutilisateur_id) values (?,?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssi", $nomComplet,$tel,$login,$mdp,$typeutilisateur_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_user()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $nomComplet = mysqli_real_escape_string($this->conn, ($_POST['nomComplet']));
        $tel = mysqli_real_escape_string($this->conn, ($_POST['tel']));
        $login = mysqli_real_escape_string($this->conn, ($_POST['login']));
        $mdp = mysqli_real_escape_string($this->conn, ($_POST['mdp']));
        $typeutilisateur_id = mysqli_real_escape_string($this->conn, ($_POST['typeutilisateur_id']));
        $sql = "UPDATE user SET nomComplet = ?,tel=?,login=?,mdp=?,typeutilisateur_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssii",$nomComplet,$tel,$login,$mdp,$typeutilisateur_id,$id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_user()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM user WHERE id = ?";
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
if (isset($_POST['action']) && $_POST['action'] == 'read_types') {
    $database->read_types();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_user') {
    $database->add_user();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_user') {
    $database->update_user();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_user') {
    $database->delete_user();
}
