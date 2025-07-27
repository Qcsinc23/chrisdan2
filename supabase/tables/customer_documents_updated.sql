-- Updated customer_documents table with proper foreign key constraints
CREATE TABLE customer_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    associated_shipment_id UUID,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE customer_documents 
ADD CONSTRAINT fk_customer_documents_customer 
FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;

ALTER TABLE customer_documents 
ADD CONSTRAINT fk_customer_documents_shipment 
FOREIGN KEY (associated_shipment_id) REFERENCES shipments(id);

-- Add indexes for better performance
CREATE INDEX idx_customer_documents_customer_id ON customer_documents(customer_id);
CREATE INDEX idx_customer_documents_document_type ON customer_documents(document_type);
CREATE INDEX idx_customer_documents_upload_date ON customer_documents(upload_date);
CREATE INDEX idx_customer_documents_is_verified ON customer_documents(is_verified);
