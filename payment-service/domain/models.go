package domain

import (
	"time"
)

// PaymentRequest merepresentasikan data input untuk membuat transaksi pembayaran baru.
type PaymentRequest struct {
	OrderID          string  `json:"order_id" binding:"required"`
	Nominal          float64 `json:"nominal" binding:"required,gt=0"`
	MetodePembayaran string  `json:"metode_pembayaran" binding:"required,oneof=cash qris bank"` // cash, qris, bank
	PromoID          string  `json:"promo_id"`
	UserID           string  `json:"user_id" binding:"required"`
	DriverID         string  `json:"driver_id" binding:"required"`
	IdempotencyKey   string  `json:"idempotency_key"`
}

// PaymentResponse merepresentasikan response setelah transaksi dibuat atau diperiksa statusnya.
type PaymentResponse struct {
	TransactionID string `json:"transaction_id"`
	PaymentStatus string `json:"payment_status"`
	InvoiceURL    string `json:"invoice_url,omitempty"`
}

// Transaction merepresentasikan tabel 'transactions' di PostgreSQL untuk menyimpan data pembayaran.
type Transaction struct {
	ID                string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TransactionID     string     `gorm:"type:varchar(50);not null;uniqueIndex" json:"transaction_id"` // Format: TRX-YYYYMMDD-XXXXX
	OrderID           string     `gorm:"type:varchar(50);not null;index" json:"order_id"`
	UserID            string     `gorm:"type:uuid;not null;index" json:"user_id"`
	DriverID          string     `gorm:"type:uuid;not null" json:"driver_id"`
	GrossAmount       float64    `gorm:"type:decimal(15,2);not null" json:"gross_amount"`
	DiscountAmount    float64    `gorm:"type:decimal(15,2);default:0" json:"discount_amount"`
	NetAmount         float64    `gorm:"type:decimal(15,2);not null" json:"net_amount"`
	MetodePembayaran  string     `gorm:"type:varchar(20);not null" json:"metode_pembayaran"` // cash, qris, bank
	PaymentGatewayRef string     `gorm:"type:varchar(100)" json:"payment_gateway_ref"`
	Status            string     `gorm:"type:varchar(20);default:'pending'" json:"status"` // pending, success, failed, refunded, expired
	PlatformFee       float64    `gorm:"type:decimal(15,2)" json:"platform_fee"`           // Potongan platform (20%)
	DriverEarnings    float64    `gorm:"type:decimal(15,2)" json:"driver_earnings"`        // Yang diterima driver (80%)
	PaidAt            *time.Time `json:"paid_at"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// DriverWallet merepresentasikan tabel 'driver_wallets' untuk menyimpan saldo driver.
type DriverWallet struct {
	ID          string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DriverID    string    `gorm:"type:uuid;not null;uniqueIndex" json:"driver_id"`
	Balance     float64   `gorm:"type:decimal(15,2);default:0" json:"balance"`
	TotalEarned float64   `gorm:"type:decimal(15,2);default:0" json:"total_earned"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// WalletTransaction merepresentasikan tabel 'wallet_transactions' untuk mencatat mutasi saldo driver.
type WalletTransaction struct {
	ID           string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DriverID     string    `gorm:"type:uuid;not null;index" json:"driver_id"`
	Type         string    `gorm:"type:varchar(10);not null" json:"type"` // credit (masuk), debit (keluar)
	Amount       float64   `gorm:"type:decimal(15,2);not null" json:"amount"`
	BalanceAfter float64   `gorm:"type:decimal(15,2);not null" json:"balance_after"`
	RefID        string    `gorm:"type:varchar(50)" json:"ref_id"` // transaction_id
	Note         string    `gorm:"type:text" json:"note"`
	CreatedAt    time.Time `json:"created_at"`
}

// PaymentLog merepresentasikan tabel 'payment_logs' untuk audit trail pembayaran.
type PaymentLog struct {
	ID            string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TransactionID string    `gorm:"type:varchar(50);not null;index" json:"transaction_id"`
	Event         string    `gorm:"type:varchar(50);not null" json:"event"` // e.g., created, webhook_received
	Payload       string    `gorm:"type:jsonb" json:"payload"`              // Menyimpan payload JSON mentah
	CreatedAt     time.Time `json:"created_at"`
}

// IdempotencyKey merepresentasikan tabel 'idempotency_keys' untuk mencegah double payment.
type IdempotencyKey struct {
	Key       string    `gorm:"type:varchar(255);primaryKey" json:"key"`
	Response  string    `gorm:"type:jsonb;not null" json:"response"` // JSON response serialized
	CreatedAt time.Time `json:"created_at"`
}
