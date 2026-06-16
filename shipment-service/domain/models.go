package domain

import (
	"database/sql/driver"
	"errors"
	"time"
)

// JSONB mendefinisikan tipe data custom untuk menyimpan data JSON mentah di PostgreSQL.
type JSONB []byte

// Value mengubah JSONB ke tipe data yang dipahami oleh driver SQL (database/sql/driver).
func (j JSONB) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	return string(j), nil
}

// Scan membaca data dari database PostgreSQL dan menyimpannya ke tipe JSONB.
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	switch v := value.(type) {
	case string:
		*j = append((*j)[0:0], []byte(v)...)
	case []byte:
		*j = append((*j)[0:0], v...)
	default:
		return errors.New("tipe data tidak kompatibel untuk JSONB")
	}
	return nil
}

// ShipmentRequest merepresentasikan data input untuk membuat pengiriman barang.
type ShipmentRequest struct {
	OrderID        string                 `json:"order_id" binding:"required"`
	KategoriBarang string                 `json:"kategori_barang"`
	BeratBarang    float64                `json:"berat_barang"`
	NamaPenerima   string                 `json:"nama_penerima"`
	NomorPenerima  string                 `json:"nomor_penerima"`
	CatatanPickup  string                 `json:"catatan_pickup"`
	Manifest       map[string]interface{} `json:"manifest"` // Menampung manifes dinamis tambahan yang formatnya berubah-ubah
}

// ShipmentResponse merepresentasikan data output setelah pengiriman dibuat.
type ShipmentResponse struct {
	ShipmentID    string `json:"shipment_id"`
	KodeTracking  string `json:"kode_tracking"`
	LabelShipping string `json:"label_shipping"`
}

// ProofData merepresentasikan URL foto bukti serah terima paket.
type ProofData struct {
	ImageURL string `json:"image_url" binding:"required"`
}

// Shipment merepresentasikan tabel 'shipments' di PostgreSQL untuk menyimpan data logistik barang.
type Shipment struct {
	ID            string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID       string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"order_id"`
	TrackingCode  string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"tracking_code"` // Format: SHP-YYYYMMDD-XXXXX
	Status        string    `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`   // pending, pickup, ongoing, delivered, cancelled
	Manifest      JSONB     `gorm:"type:jsonb;not null" json:"manifest"`                        // Detail manifes bertipe JSONB
	ProofImageURL string    `gorm:"type:varchar(500)" json:"proof_image_url"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
