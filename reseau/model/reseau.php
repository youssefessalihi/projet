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

    public function read_regioDirec()
    {
        $sql = "SELECT * FROM directionregionale";
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
        $sql = "SELECT r.id as idReseau,r.region,r.libelle as libelleReseau,d.id as idDossier ,d.libelle as libelleRegion FROM reseau r join directionregionale d on r.direction_regionale_id=d.id        WHERE r.id = ?";
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
        $sql = "SELECT r.id as idReseau,r.region,r.libelle as libelleReseau,d.id as idDossier ,d.libelle as libelleRegion FROM reseau r join directionregionale d on r.direction_regionale_id=d.id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idReseau'],
                $row['region'],
                $row['libelleReseau'],
                $row['libelleRegion'],
                $row['idDossier']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_networks()
    {
        $libelle =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['libelle']));
        $region =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['region']));
        $direction_regionale_id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['direction_regionale_id']));
        $sql = "insert into reseau (region,libelle,direction_regionale_id) values (?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sss",$region, $libelle,$direction_regionale_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_networks()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $libelle =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['libelle']));
        $region =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['region']));
        $direction_regionale_id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['direction_regionale_id']));
        $sql = "UPDATE reseau SET libelle = ?, region = ?,direction_regionale_id = ? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssi",$libelle, $region, $direction_regionale_id, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_networks()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM reseau WHERE id = ?";
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

if (isset($_POST['action']) && $_POST['action'] == 'read_regioDirec') {
    $database->read_regioDirec();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_networks') {
    $database->add_networks();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_networks') {
    $database->update_networks();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_networks') {
    $database->delete_networks();
}
