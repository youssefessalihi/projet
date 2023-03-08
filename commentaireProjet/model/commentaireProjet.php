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
        $sql = "SELECT c.*,p.nomProjet,p.id as idProjet FROM commentaireprojet c join projet p on p.id=c.projet_id
        WHERE c.id = ?";
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
        $sql = "SELECT c.*,p.nomProjet,p.id as idProjet FROM commentaireprojet c join projet p on p.id=c.projet_id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['date'],
                $row['commentaire'],
                $row['nomProjet'],
                $row['idProjet']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_comment()
    {
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $comment = mysqli_real_escape_string($this->conn, ($_POST['comment']));
        $projet = mysqli_real_escape_string($this->conn, ($_POST['projet']));
        $sql = "insert into commentaireProjet (date,commentaire,projet_id) values (?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssi", $date, $comment, $projet);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_comment()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $comment = mysqli_real_escape_string($this->conn, ($_POST['comment']));
        $projet = mysqli_real_escape_string($this->conn, ($_POST['projet']));
        $sql = "UPDATE commentaireProjet SET date = ?,commentaire = ?,projet_id=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssii",$date,$comment, $projet, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_comment()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM commentaireProjet WHERE id = ?";
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
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_comment') {
    $database->add_comment();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_comment') {
    $database->update_comment();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_comment') {
    $database->delete_comment();
}
