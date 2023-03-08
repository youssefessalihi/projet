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
        $sql = "SELECT d.*,d.id as idDococument,p.nomProjet,p.id as idProjet FROM documentprojet d join projet p on p.id=d.projet_id
        WHERE d.id = ?";
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
        $sql = "SELECT d.*,p.nomProjet,p.id as idProjet FROM documentprojet d join projet p on p.id=d.projet_id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['date'],
                $row['url'],
                $row['typeDocument'],
                $row['libelle'],
                $row['nomProjet'],
                $row['idProjet']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_document()
    {
        $url = mysqli_real_escape_string($this->conn, ($_POST['url']));
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $libelle = mysqli_real_escape_string($this->conn, ($_POST['libelle']));
        $type = mysqli_real_escape_string($this->conn, ($_POST['type']));
        $projet = mysqli_real_escape_string($this->conn, ($_POST['projet']));
        $sql = "insert into documentProjet (date,url,typeDocument,libelle,projet_id) values (?,?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssi", $date, $url, $type, $libelle, $projet);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_document()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $url = mysqli_real_escape_string($this->conn, ($_POST['url']));
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $libelle = mysqli_real_escape_string($this->conn, ($_POST['libelle']));
        $type = mysqli_real_escape_string($this->conn, ($_POST['type']));
        $projet = mysqli_real_escape_string($this->conn, ($_POST['projet']));
        $sql = "UPDATE documentProjet SET date = ?, url = ?,typeDocument = ?,libelle=?,projet_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssii",$date, $url, $type, $libelle, $projet, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_document()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM documentProjet WHERE id = ?";
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
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_document') {
    $database->add_document();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_document') {
    $database->update_document();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_document') {
    $database->delete_document();
}
