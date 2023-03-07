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

    public function read_reports()
    {
        $sql = "SELECT * FROM dossierdecredit";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['id'],
                $row['numDossier'],
                $row['statut'],
                $row['objetFinancement']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function read_one()
    {
        $id = mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $sql = "SELECT r.id as idRembourssement,r.date,r.montant,r.taux,d.id as idDossier,numDossier FROM rembourssement r join dossierdecredit d on r.dossierdecredit_id=d.id        
        WHERE r.id = ?";
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
        $sql = "SELECT r.id as idRembourssement,r.date,r.montant,r.taux,d.id as idDossier,numDossier,statut,objetFinancement FROM rembourssement r join dossierdecredit d on r.dossierdecredit_id=d.id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idRembourssement'],
                $row['date'],
                $row['montant'],
                $row['taux'],
                $row['numDossier'],
                $row['statut'],
                $row['objetFinancement'],
                $row['idDossier']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_reimbursement()
    {
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $taux = mysqli_real_escape_string($this->conn, ($_POST['taux']));
        $montant = mysqli_real_escape_string($this->conn, ($_POST['montant']));
        $dossierdecredit_id = mysqli_real_escape_string($this->conn, ($_POST['dossierdecredit_id']));
        $sql = "insert into rembourssement (date,taux,montant,dossierdecredit_id) values (?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssi",$date, $taux, $montant,$dossierdecredit_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_reimbursement()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $taux = mysqli_real_escape_string($this->conn, ($_POST['taux']));
        $montant = mysqli_real_escape_string($this->conn, ($_POST['montant']));
        $sql = "UPDATE rembourssement SET date = ?, taux = ?,montant = ? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssi",$date, $taux, $montant, $id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_reimbursement()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM rembourssement WHERE id = ?";
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

if (isset($_POST['action']) && $_POST['action'] == 'read_reports') {
    $database->read_reports();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_reimbursement') {
    $database->add_reimbursement();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_reimbursement') {
    $database->update_reimbursement();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_reimbursement') {
    $database->delete_reimbursement();
}
