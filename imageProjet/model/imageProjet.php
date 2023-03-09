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
        $sql = "SELECT id, nomProjet FROM projet";
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

    public function read_one()
    {
        $id = mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $sql = "SELECT i.*,i.id as idImage,p.nomProjet,p.id as idProjet FROM imageprojet i join projet p on p.id=i.projet_id
        WHERE i.id = ?";
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
        $sql = "SELECT i.*,p.nomProjet,p.id as idProjet FROM imageprojet i join projet p on p.id=i.projet_id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['url'],
                $row['date'],
                $row['nomProjet'],
                $row['idProjet']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_image()
    {
        $url = mysqli_real_escape_string($this->conn, ($_POST['url']));
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $projet = mysqli_real_escape_string($this->conn, ($_POST['projet']));
        $sql = "insert into imageprojet (date,url,projet_id) values (?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssi", $date, $url, $projet);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_image()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $url = mysqli_real_escape_string($this->conn, ($_POST['url']));
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $projet = mysqli_real_escape_string($this->conn, ($_POST['projet']));
        $sql = "UPDATE imageprojet SET date = ?, url = ?,projet_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssii",$date, $url, $projet, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_image()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM imageprojet WHERE id = ?";
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
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_image') {
    $database->add_image();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_image') {
    $database->update_image();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_image') {
    $database->delete_image();
}
