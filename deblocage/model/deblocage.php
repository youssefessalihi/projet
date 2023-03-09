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
    public function read_papers()
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
        $sql = "SELECT deb.id as idDeblocage, 
        deb.date as dateDeblocage,
        deb.montant as montantDeblocage,
        deb.taux as tauxDeblocage,
        deb.img_url as imgDeblocage,
        credit.id as idCredit,
        credit.numDossier,
        credit.statut as statutCredit,
        credit.objetFinancement as objetCredit 
        FROM deblocage deb 
        JOIN dossierdecredit  credit
        on deb.dossierdecredit_id=credit.id
        WHERE deb.id = ?";
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
        $sql = "SELECT deb.id as idDeblocage, 
        deb.date as dateDeblocage,
        deb.montant as montantDeblocage,
        deb.taux as tauxDeblocage,
        deb.img_url as imgDeblocage,
        credit.numDossier,
        credit.statut as statutCredit,
        credit.objetFinancement as objetCredit 
        FROM deblocage deb 
        JOIN dossierdecredit  credit
        on deb.dossierdecredit_id=credit.id";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $elements = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $elements[] = array(
                $row['idDeblocage'],
                $row['dateDeblocage'],
                $row['montantDeblocage'],
                $row['tauxDeblocage'],
                $row['imgDeblocage'],
                $row['numDossier'],
                $row['statutCredit'],
                $row['objetCredit']
            );
        }
        echo json_encode(array('success' => true, 'data' => $elements));
    }

    public function add_unlock()
    {
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $montant = mysqli_real_escape_string($this->conn, ($_POST['montant']));
        $taux = mysqli_real_escape_string($this->conn, ($_POST['taux']));
        $img_url = mysqli_real_escape_string($this->conn, ($_POST['img_url']));
        $dossierdecredit_id = mysqli_real_escape_string($this->conn, ($_POST['dossierdecredit_id']));
        $sql = "insert into deblocage (date,montant,taux,img_url,dossierdecredit_id) values (?,?,?,?,?)";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssi", $date,$montant,$taux,$img_url,$dossierdecredit_id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }

    public function update_unlock()
    {
        $id =  mysqli_real_escape_string($this->conn, htmlspecialchars($_POST['id']));
        $date = mysqli_real_escape_string($this->conn, ($_POST['date']));
        $montant = mysqli_real_escape_string($this->conn, ($_POST['montant']));
        $taux = mysqli_real_escape_string($this->conn, ($_POST['taux']));
        $img_url = mysqli_real_escape_string($this->conn, ($_POST['img_url']));
        $sql = "UPDATE deblocage SET date = ?,montant=?,taux=?,img_url=? WHERE id = ?";
        $stmt = mysqli_prepare($this->conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssi",$date,$montant,$taux,$img_url,$id);
        $result = mysqli_stmt_execute($stmt);
        if ($result) {
            echo json_encode(array('success' => true));
        } else {
            echo json_encode(array('success' => false));
        }
    }
    public function delete_unlock()
    {
        $id = htmlspecialchars($_POST['id']);
        $sql = "DELETE FROM deblocage WHERE id = ?";
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
if (isset($_POST['action']) && $_POST['action'] == 'read_papers') {
    $database->read_papers();
}
else if (isset($_POST['action']) && $_POST['action'] == 'read_all') {
    $database->read_all();
} elseif (isset($_POST['action']) && $_POST['action'] == 'read_one') {
    $database->read_one();
} elseif (isset($_POST['action']) && $_POST['action'] == 'add_unlock') {
    $database->add_unlock();
} elseif (isset($_POST['action']) && $_POST['action'] == 'update_unlock') {
    $database->update_unlock();
} elseif (isset($_POST['action']) && $_POST['action'] == 'delete_unlock') {
    $database->delete_unlock();
}
