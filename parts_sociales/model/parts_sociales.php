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
    public function read_shareholders()
    {
        $sql = "SELECT * FROM actionnaire";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['cin'],
                $row['nom'],
                $row['prenom'],
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function read_one()
    {
        $id = mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $sql = " 
        SELECT p.*,p.id as idParts,a.id as idActionnaire,
        a.nom as nomActionnaire,a.prenom as prenomActionnaire,a.cin as cinActionnaire,s.id as idSociete,
        s.libelle as libelleSociete
        from parts_sociales p join actionnaire a on p.actionnaire_id=a.id 
        JOIN societe s ON s.id=p.societe_id
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
        SELECT p.*,p.id as idParts,
        a.nom as nomActionnaire,a.prenom as prenomActionnaire,a.cin as cinActionnaire,
        s.libelle as libelleSociete
        from parts_sociales p join actionnaire a on p.actionnaire_id=a.id 
        JOIN societe s ON s.id=p.societe_id
        ";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idParts'],
                $row['libelleSociete'],
                $row['cinActionnaire'],
                $row['nomActionnaire'],
                $row['prenomActionnaire'],
                $row['actionnaire'],
                $row['part'],
                $row['gerant']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_shares()
    {
        $actionnaire = mysqli_real_escape_string($this->conn, ($_POST['actionnaire']));
        $part = mysqli_real_escape_string($this->conn, ($_POST['part']));
        $gerant = mysqli_real_escape_string($this->conn, ($_POST['gerant']));
        $societe_id = mysqli_real_escape_string($this->conn, ($_POST['societe_id']));
        $actionnaire_id = mysqli_real_escape_string($this->conn, ($_POST['actionnaire_id']));
        $sql = "insert into parts_sociales (societe_id,actionnaire_id,actionnaire,part,gerant) values (?,?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "iiidi",  $societe_id,$actionnaire_id,$actionnaire,$part,$gerant);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_shares()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $actionnaire = mysqli_real_escape_string($this->conn, ($_POST['actionnaire']));
        $part = mysqli_real_escape_string($this->conn, ($_POST['part']));
        $gerant = mysqli_real_escape_string($this->conn, ($_POST['gerant']));
        $sql = "UPDATE parts_sociales SET actionnaire = ?,part=?,gerant=?  WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "idii", $actionnaire,$part,$gerant, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_shares()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM parts_sociales WHERE id = ?";
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
else if (isset($_POST['action']) && $_POST['action'] == 'read_shareholders') {
    $database->read_shareholders();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_shares') {
    $database->add_shares();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_shares') {
    $database->update_shares();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_shares') {
    $database->delete_shares();
}
